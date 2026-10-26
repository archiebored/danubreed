import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Staff = { id: string; full_name: string; role: string } | null;

type AuthContextValue = {
  staff: Staff;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff>(null);
  const [loading, setLoading] = useState(true);

  async function loadStaffRecord(userId: string | undefined) {
    if (!userId) {
      setStaff(null);
      return;
    }
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();
    setStaff(error ? null : data);
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

  async function signIn(email: string, password: string) {
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
