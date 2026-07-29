import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const checkAdminStatus = useCallback(async (userId) => {
    try {
      const { data } = await supabase.from('admins').select('id').eq('user_id', userId).maybeSingle();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const checkProStatus = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('id, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      if (data) {
        const expiresAt = new Date(data.expires_at);
        setIsPro(expiresAt > new Date());
      } else {
        setIsPro(false);
      }
    } catch {
      setIsPro(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
        checkProStatus(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
        checkProStatus(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsPro(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, [checkAdminStatus, checkProStatus]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    await checkAdminStatus(data.user.id);
    await checkProStatus(data.user.id);
    return data;
  };

  const signup = async (email, password, name) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsPro(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isPro, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
