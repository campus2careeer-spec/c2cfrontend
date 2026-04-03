import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

// ─── Clear ALL Supabase-related storage to kill stale refresh tokens ──────────
function clearSupabaseStorage() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {}
}

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading]   = useState(true);

  // Guard: prevents setState after unmount
  const mountedRef    = useRef(true);
  // Guard: prevents fetchAuthUser running concurrently
  const fetchingRef   = useRef(false);
  // Guard: tracks last fetched userId so we don't re-fetch for same user
  const lastFetchedId = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchAuthUser = async (userId) => {
    if (!userId) return null;
    // Don't re-fetch if we already have this user's data
    if (lastFetchedId.current === userId && authUser?.id === userId) return authUser;
    // Prevent concurrent fetches
    if (fetchingRef.current) return null;

    fetchingRef.current = true;
    try {
      let data = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: row, error } = await supabase
          .from('profiles')
          .select('id, email, role, full_name')
          .eq('id', userId)
          .single();

        if (row) { data = row; break; }
        if (error) console.warn(`fetchAuthUser attempt ${attempt}:`, error.message);
        if (attempt < 3) await new Promise(r => setTimeout(r, 800 * attempt));
      }

      if (!data) {
        if (mountedRef.current) setAuthUser(null);
        return null;
      }

      const minimal = {
        id:       data.id,
        email:    data.email,
        role:     data.role ?? null,
        fullName: data.full_name ?? '',
      };

      lastFetchedId.current = userId;
      if (mountedRef.current) setAuthUser(minimal);
      return minimal;
    } catch (err) {
      console.error('fetchAuthUser fatal:', err);
      if (mountedRef.current) setAuthUser(null);
      return null;
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: s }, error } = await supabase.auth.getSession();

        // ── FIX: If Supabase returns an auth error (e.g. bad refresh token),
        //         clear storage immediately and don't try to use the stale session.
        if (error) {
          console.warn('getSession error — clearing stale tokens:', error.message);
          clearSupabaseStorage();
          await supabase.auth.signOut().catch(() => {});
          if (mounted) { setSession(null); setAuthUser(null); setLoading(false); }
          return;
        }

        if (!mounted) return;
        setSession(s);
        if (s?.user) await fetchAuthUser(s.user.id);
      } catch (err) {
        console.error('Auth init failed:', err);
        // If init totally fails, clear storage so the next page load is clean
        clearSupabaseStorage();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mounted) return;

        // ── FIX: Handle token refresh errors — they fire as TOKEN_REFRESHED
        //         with a null session or as a separate error event.
        if (event === 'TOKEN_REFRESHED' && !s) {
          console.warn('Token refresh failed — clearing stale session');
          clearSupabaseStorage();
          setSession(null);
          setAuthUser(null);
          setLoading(false);
          return;
        }

        // ── FIX: SIGNED_OUT cleans everything up
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setAuthUser(null);
          lastFetchedId.current = null;
          setLoading(false);
          return;
        }

        setSession(s);

        if (s?.user) {
          // Only fetch if the user actually changed
          if (s.user.id !== lastFetchedId.current) {
            await fetchAuthUser(s.user.id);
          }
        } else {
          setAuthUser(null);
          lastFetchedId.current = null;
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auth actions ──────────────────────────────────────────────────────────
  const signUp = async ({ email, password, fullName, role, extra = {} }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;

    if (data.user) {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id:        data.user.id,
          full_name: fullName,
          role:      role || 'student',
          email,
          ...extra,
        }, { onConflict: 'id' });

      if (upsertError) console.warn('Profile upsert failed:', upsertError.message);
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    // ── FIX: Clear any stale tokens BEFORE signing in so Supabase doesn't
    //         try to merge a corrupted old session with the new one.
    clearSupabaseStorage();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data?.user?.id) {
      setSession(data.session);
      lastFetchedId.current = null; // force re-fetch
      await fetchAuthUser(data.user.id);
    }
    return data;
  };

  const signInWithGoogle = async () => {
    clearSupabaseStorage();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
    clearSupabaseStorage();
    setSession(null);
    setAuthUser(null);
    lastFetchedId.current = null;
  };

  const value = {
    session,
    user:    session?.user || null,
    authUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshAuthUser: () => {
      if (!session?.user) return;
      lastFetchedId.current = null; // force re-fetch
      return fetchAuthUser(session.user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
