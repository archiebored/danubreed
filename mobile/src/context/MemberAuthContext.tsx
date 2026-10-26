import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'dnb-member-id';

export type Member = {
  id: string;
  full_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  parent_guardian_name: string | null;
  parent_guardian_contact: string | null;
  school_level: string | null;
  completed_membership_class: boolean | null;
  tribe_id: string | null;
  favorite_bible_verse: string | null;
  profile_photo_url: string | null;
  join_date?: string | null;
};

type MemberAuthContextValue = {
  member: Member | null;
  loading: boolean;
  login: (nameQuery: string, phoneNumber: string) => Promise<{ error: string | null; memberId: string | null }>;
  loginWithId: (memberId: string) => Promise<void>;
  refresh: () => Promise<void>;
  updateMember: (patch: Partial<Member>) => void;
  signOut: () => Promise<void>;
};

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMemberById = useCallback(async (id: string) => {
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    if (error || !data) {
      setMember(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    setMember(data as Member);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((id) => (id ? loadMemberById(id) : Promise.resolve()))
      .finally(() => setLoading(false));
  }, [loadMemberById]);

  const login = useCallback(async (nameQuery: string, phoneNumber: string) => {
    const { data, error } = await supabase.rpc('member_login', {
      p_name_query: nameQuery.trim(),
      p_phone_number: phoneNumber.trim(),
    });
    if (error) return { error: 'Something went wrong — please try again.', memberId: null };
    const match = Array.isArray(data) ? data[0] : data;
    if (!match) return { error: "We couldn't find that. Check your name and phone number, or sign up below.", memberId: null };
    setMember(match as Member);
    await AsyncStorage.setItem(STORAGE_KEY, match.id);
    return { error: null, memberId: match.id as string };
  }, []);

  const loginWithId = useCallback(async (memberId: string) => {
    await loadMemberById(memberId);
    await AsyncStorage.setItem(STORAGE_KEY, memberId);
  }, [loadMemberById]);

  const refresh = useCallback(async () => {
    if (member) await loadMemberById(member.id);
  }, [member, loadMemberById]);

  const updateMember = useCallback((patch: Partial<Member>) => {
    setMember((curr) => (curr ? { ...curr, ...patch } : curr));
  }, []);

  const signOut = useCallback(async () => {
    setMember(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <MemberAuthContext.Provider value={{ member, loading, login, loginWithId, refresh, updateMember, signOut }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  return ctx;
}
