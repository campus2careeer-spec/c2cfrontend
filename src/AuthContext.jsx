import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

function clearSupabaseStorage() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) localStorage.removeItem(key);
    });
    Object.keys(sessionStorage || {}).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) sessionStorage.removeItem(key);
    });
  } catch {}
}

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const mountedRef    = useRef(true);
  const fetchingRef   = useRef(false);
  const lastFetchedId = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Pull full profile directly from Supabase (no backend) ─────────────────
  const fetchAuthUser = async (userId) => {
    if (!userId) return null;
    if (lastFetchedId.current === userId && authUser?.id === userId) return authUser;
    if (fetchingRef.current) return null;
    fetchingRef.current = true;

    try {
      let data = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: row, error } = await supabase
          .from('profiles')
          .select(`
            id, email, role, full_name, username,
            phone, address, about, skills, photo, cover_photo,
            tenth, twelfth, graduation, qualification, cgpa,
            certificates, personal_posts, resumes,
            linkedin, github, website,
            experience, projects, achievements
          `)
          .eq('id', userId)
          .single();

        if (row) { data = row; break; }
        if (error) console.warn(`fetchAuthUser attempt ${attempt}:`, error.message);
        if (attempt < 3) await new Promise(r => setTimeout(r, 800 * attempt));
      }

      if (!data) { if (mountedRef.current) setAuthUser(null); return null; }

      const normalized = {
        id:            data.id,
        email:         data.email          || '',
        role:          data.role           || 'student',
        fullName:      data.full_name      || '',
        username:      data.username       || '',
        phone:         data.phone          || '',
        address:       data.address        || '',
        about:         data.about          || '',
        skills:        Array.isArray(data.skills) ? data.skills : [],
        photo:         data.photo          || null,
        coverPhoto:    data.cover_photo    || null,
        tenth:         data.tenth          || '',
        twelfth:       data.twelfth        || '',
        graduation:    data.graduation     || '',
        qualification: data.qualification  || '',
        cgpa:          data.cgpa           || '',
        certificates:  data.certificates   || [],
        personalPosts: data.personal_posts || [],
        resumes:       data.resumes        || [],
        linkedin:      data.linkedin       || '',
        github:        data.github         || '',
        website:       data.website        || '',
        experience:    data.experience     || '',
        projects:      data.projects       || '',
        achievements:  data.achievements   || '',
      };

      lastFetchedId.current = userId;
      if (mountedRef.current) setAuthUser(normalized);
      return normalized;
    } catch (err) {
      console.error('fetchAuthUser fatal:', err);
      if (mountedRef.current) setAuthUser(null);
      return null;
    } finally {
      fetchingRef.current = false;
    }
  };

  // ── Save profile directly to Supabase ────────────────────────────────────
  const saveProfile = async (userId, updates) => {
    if (!userId || !updates) throw new Error('Missing userId or updates');

    // Map frontend keys → DB columns
    const FIELD_MAP = {
      fullName:      'full_name',
      coverPhoto:    'cover_photo',
      personalPosts: 'personal_posts',
      name:          'full_name',
      address:       'address',
    };

    const ALLOWED = new Set([
      'full_name','username','email','phone','address','about',
      'skills','photo','cover_photo','tenth','twelfth','graduation',
      'qualification','cgpa','experience','projects','achievements',
      'linkedin','github','website','certificates','resumes','personal_posts',
    ]);

    const mapped = {};
    for (const [k, v] of Object.entries(updates)) {
      const dbKey = FIELD_MAP[k] || k;
      if (!ALLOWED.has(dbKey)) continue;

      // Strip oversized base64 from list items
      if (Array.isArray(v)) {
        mapped[dbKey] = v.map(item => {
          if (typeof item !== 'object' || item === null) return item;
          return Object.fromEntries(
            Object.entries(item).filter(([, iv]) => !(typeof iv === 'string' && iv.length > 900_000))
          );
        });
      } else if (typeof v === 'string' && v.length > 5_000_000) {
        // Too large — skip
      } else {
        mapped[dbKey] = v;
      }
    }

    if (Object.keys(mapped).length === 0) throw new Error('No valid fields to update');

    const { error } = await supabase.from('profiles').update(mapped).eq('id', userId);
    if (error) throw error;

    // Re-fetch so authUser stays fresh
    lastFetchedId.current = null;
    return fetchAuthUser(userId);
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: s }, error } = await supabase.auth.getSession();
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
        clearSupabaseStorage();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      if (event === 'TOKEN_REFRESHED' && !s) {
        clearSupabaseStorage();
        setSession(null); setAuthUser(null); setLoading(false);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setSession(null); setAuthUser(null);
        lastFetchedId.current = null; setLoading(false);
        return;
      }

      setSession(s);
      if (s?.user && s.user.id !== lastFetchedId.current) {
        await fetchAuthUser(s.user.id);
      } else if (!s?.user) {
        setAuthUser(null); lastFetchedId.current = null;
      }
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; subscription?.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const signUp = async ({ email, password, fullName, role, extra = {} }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;

    if (data.user) {
      const { error: upsertError } = await supabase.from('profiles').upsert({
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
    clearSupabaseStorage();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user?.id) {
      setSession(data.session);
      lastFetchedId.current = null;
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
    setSession(null); setAuthUser(null);
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
    saveProfile,
    refreshAuthUser: () => {
      if (!session?.user) return;
      lastFetchedId.current = null;
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
