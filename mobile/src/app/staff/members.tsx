import { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Picker } from '@react-native-picker/picker';
import { Search, X } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';

type Member = { id: string; full_name: string; date_of_birth: string | null; join_date: string | null; tribe_id: string | null };
type Lookup = { id: string; name: string };

function age(dob: string | null) {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function StaffMembers() {
  const { colors } = useTheme();
  const confirm = useConfirm();
  const [members, setMembers] = useState<Member[]>([]);
  const [tribes, setTribes] = useState<Lookup[]>([]);
  const [departments, setDepartments] = useState<Lookup[]>([]);
  const [memberDepts, setMemberDepts] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: m }, { data: t }, { data: d }, { data: md }] = await Promise.all([
      supabase.from('members').select('*').order('full_name'),
      supabase.from('tribes').select('id, name').order('name'),
      supabase.from('departments').select('id, name').order('name'),
      supabase.from('member_departments').select('member_id, department_id'),
    ]);
    setMembers(m || []);
    setTribes(t || []);
    setDepartments(d || []);
    const grouped: Record<string, string[]> = {};
    (md || []).forEach((row) => {
      grouped[row.member_id] = grouped[row.member_id] || [];
      grouped[row.member_id].push(row.department_id);
    });
    setMemberDepts(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    loadAll();
  }, [loadAll]);

  async function assignTribe(memberId: string, tribeId: string) {
    setMembers((curr) => curr.map((m) => (m.id === memberId ? { ...m, tribe_id: tribeId } : m)));
    await supabase.from('members').update({ tribe_id: tribeId || null }).eq('id', memberId);
  }

  async function removeMember(memberId: string, name: string) {
    const ok = await confirm({ title: `Remove ${name}?`, message: 'This deletes their full record and cannot be undone.' });
    if (!ok) return;
    await supabase.from('members').delete().eq('id', memberId);
    setMembers((curr) => curr.filter((m) => m.id !== memberId));
  }

  function deptNames(memberId: string) {
    const ids = memberDepts[memberId] || [];
    return ids.map((id) => departments.find((d) => d.id === id)?.name.replace(' Department', '')).filter(Boolean).join(', ');
  }

  const filtered = members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Screen>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink, marginBottom: 10 }}>
        Members ({members.length})
      </Text>
      <View style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} color={colors.muted} style={{ position: 'absolute', left: 14, top: 0, bottom: 0, zIndex: 1 }} />
        <TextField placeholder="Search by name..." value={search} onChangeText={setSearch} style={{ paddingLeft: 36 }} />
      </View>

      {loading && <Text style={{ color: colors.muted }}>Loading...</Text>}

      <View style={{ gap: 10 }}>
        {filtered.map((m) => (
          <Card key={m.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.accent}22`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.accent }}>{m.full_name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{m.full_name}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>
                  Age {age(m.date_of_birth)} · {deptNames(m.id) || 'No departments'}
                </Text>
              </View>
              <Pressable onPress={() => removeMember(m.id, m.full_name)} style={{ padding: 4 }}>
                <X size={16} color={colors.danger} />
              </Pressable>
            </View>
            <View style={{ borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.base }}>
              <Picker selectedValue={m.tribe_id || ''} onValueChange={(v) => assignTribe(m.id, v)} style={{ color: colors.ink }}>
                <Picker.Item label="No tribe" value="" />
                {tribes.map((t) => (
                  <Picker.Item key={t.id} label={t.name} value={t.id} />
                ))}
              </Picker>
            </View>
          </Card>
        ))}
        {!loading && filtered.length === 0 && <Text style={{ color: colors.muted }}>No members match that search.</Text>}
      </View>
    </Screen>
  );
}
