import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [authUser, setAuthUser] = useState(null);   // { id, email, role }
  const [loading, setLoading]   = useState(true);

  // ─── Fetch ONLY id + email + role from Supabase ───────────────────────────
  // Everything else (name, skills, photo, etc.) is fetched by the dashboard
  // directly from the Python backend. Keeping these two fetches separate
  // prevents the auth context and dashboard from fighting over profile state.
  const fetchAuthUser = async (userObj) => {
    try {
      let data = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: row, error } = await supabase
          .from('profiles')
          .select('id, email, role, full_name')
          .eq('id', userObj.id)
          .single();

        if (row) { data = row; break; }
        if (error) console.warn(`fetchAuthUser attempt ${attempt}:`, error.message);
        if (attempt < 3) await new Promise(r => setTimeout(r, 800 * attempt));
      }

      if (!data) {
        console.warn('Fallback: no profile found in table, using auth metadata');
        const fallback = {
          id:       userObj.id,
          email:    userObj.email || '',
          role:     userObj.user_metadata?.role || 'student',
          fullName: userObj.user_metadata?.full_name || userObj.email?.split('@')[0] || 'User'
        };
        setAuthUser(fallback);
        return fallback;
      }

      const minimal = {
        id:       data.id,
        email:    data.email || userObj.email,
        role:     data.role || userObj.user_metadata?.role || 'student',
        fullName: data.full_name || '',
      };
      setAuthUser(minimal);
      return minimal;
    } catch (err) {
      console.error('fetchAuthUser fatal:', err);
      const fallback = {
        id:       userObj.id,
        email:    userObj.email || '',
        role:     userObj.user_metadata?.role || 'student',
        fullName: 'User'
      };
      setAuthUser(fallback);
      return fallback;
    }
  };

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(s);
        if (s?.user) await fetchAuthUser(s.user);
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;
        setSession(s);
        if (s?.user) {
          await fetchAuthUser(s.user);
        } else {
          setAuthUser(null);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      setSession(data.session);
      await fetchAuthUser(data.user);
    }
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAuthUser(null);
  };

  const value = {
    session,
    user:    session?.user || null,  // raw Supabase user (has .id, .email)
    authUser,                         // { id, email, role, fullName } from profiles table
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    // Expose refetch so dashboard can call after profile creation if needed
    refreshAuthUser: () => session?.user && fetchAuthUser(session.user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
