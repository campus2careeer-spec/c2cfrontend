import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = (p) => {
    const updatedProfile = {
      ...p,
      name: p.full_name || p.name || '',
      username: p.username || (p.full_name || 'user').toLowerCase().replace(/\s+/g, '_'),
      address: p.address || p.location || '',
      skills: p.skills || [],
      photo: p.photo || null,
      certificates: p.certificates || [],
      personalPosts: p.personal_posts || p.personalPosts || [],
      resumes: p.resumes || [],
      chats: p.chats || {},
      // ✅ FIX 1: Never default role to 'student' — keep whatever is in DB.
      // Only fall back if the field is genuinely missing (null/undefined).
      role: p.role ?? null,
    };
    setProfile(updatedProfile);
    return updatedProfile;
  };

  // ✅ FIX 2: Increased timeout & removed hardcoded 'student' fallback.
  // Returns the profile so callers can await it.
  const fetchProfile = async (userId) => {
    try {
      // Retry up to 3 times — newly created rows may not be visible immediately
      let data = null;
      let error = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
       // Inside fetchProfile in AuthContext.jsx
          const result = await Promise.race([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile fetch timed out')), 15000) // Changed from 5000 to 15000
            ),
          ]);
        data = result.data;
        error = result.error;

        if (data) break; // success

        // Row might not exist yet right after signup — wait and retry
        if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
      }

      if (error || !data) {
        console.warn('Profile not found after retries:', error?.message);
        // ✅ DO NOT fall back to role:'student' — set profile to null so
        // ProtectedRoute keeps the user in the loading state until we have real data.
        setProfile(null);
        return null;
      }

      return applyProfile(data);
    } catch (err) {
      console.error('Fatal error fetching profile:', err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initialize and listen to session changes
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(data.session);
        if (!data.session) setLoading(false);
      } catch (err) {
        console.error('Session initialize failed:', err);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return;
        setSession(s);
        if (!s) {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch profile ONLY when the authenticated user ID changes
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (session?.user?.id) {
        setLoading(true);
        await fetchProfile(session.user.id);
        if (mounted) setLoading(false);
      }
    };

    if (session?.user?.id) {
      loadProfile();
    }

    return () => { mounted = false; };
  }, [session?.user?.id]);

  const signUp = async ({ email, password, fullName, role, extra = {} }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) throw error;

    if (data.user) {
      const updates = {
        id: data.user.id,
        full_name: fullName,
        role: role || 'student',
        email: email,
        ...extra,
      };

      // ✅ FIX 4: Use upsert instead of update.
      // update() silently does nothing if the row doesn't exist yet.
      // upsert() creates it if missing, updates it if present.
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (upsertError) {
        console.warn('Profile upsert failed:', upsertError.message);
      }
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Session state and Profile fetching will auto-handle via the useEffect hooks.
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
    if (error) throw error;
    await fetchProfile(session.user.id);
  };

  const value = {
    session,
    user: session?.user || null,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile: () => session?.user && fetchProfile(session.user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
