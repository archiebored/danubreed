import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStaffRecord(userId) {
    if (!userId) {
      setStaff(null);
      return;
    }
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();
    if (error) {
      setStaff(null);
      return;
    }
    setStaff(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadStaffRecord(data.session?.user?.id).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      loadStaffRecord(session?.user?.id).finally(() => setLoading(false));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ staff, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}