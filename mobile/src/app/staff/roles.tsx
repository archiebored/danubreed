import { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Picker } from '@react-native-picker/picker';
import { UserPlus, ShieldCheck, X } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';

type StaffRow = { id: string; full_name: string; email: string | null; role: string };
const emptyForm = { uid: '', full_name: '', email: '', role: 'coordinator' };

export default function StaffRoles() {
  const { colors } = useTheme();
  const { staff } = useAuth();
  const confirm = useConfirm();
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const load = useCallback(async () => {
    const { data } = await supabase.from('staff').select('*').order('full_name');
    setStaffList(data || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  async function handleAdd() {
    setStatus('saving');
    const { error } = await supabase.from('staff').insert({
      id: form.uid.trim(), full_name: form.full_name.trim(), email: form.email.trim() || null, role: form.role,
    });
    setStatus(error ? 'error' : 'saved');
    if (!error) {
      setForm(emptyForm);
      load();
    }
  }

  async function removeStaff(id: string, name: string) {
    const ok = await confirm({ title: `Remove ${name}'s access?`, message: "Their Supabase login stays active — this only removes app permissions." });
    if (!ok) return;
    await supabase.from('staff').delete().eq('id', id);
    load();
  }

  if (staff?.role !== 'admin') {
    return (
      <Screen>
        <Text style={{ color: colors.muted }}>Only admins can manage staff access.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <UserPlus size={22} color={colors.accent} />
        <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 24, color: colors.ink }}>Add a coordinator or admin</Text>
      </View>

      <View style={{ gap: 8, marginBottom: 20 }}>
        {[
          'In Supabase, go to Authentication → Users → Add user, and turn on "Auto Confirm User".',
          "Copy that person's User UID from the users list.",
          'Paste it into the form below — this is the step that actually gives them access inside the app.',
        ].map((text, i) => (
          <Card key={i} style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: `${colors.accent}22`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 12, color: colors.muted }}>{text}</Text>
          </Card>
        ))}
      </View>

      <Card style={{ marginBottom: 24, gap: 10 }}>
        <TextField placeholder="User UID (from Supabase Auth)" value={form.uid} onChangeText={(v) => setForm((f) => ({ ...f, uid: v }))} autoCapitalize="none" />
        <TextField placeholder="Full name" value={form.full_name} onChangeText={(v) => setForm((f) => ({ ...f, full_name: v }))} />
        <TextField placeholder="Email (for your own reference)" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} autoCapitalize="none" keyboardType="email-address" />
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.base }}>
          <Picker selectedValue={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))} style={{ color: colors.ink }}>
            <Picker.Item label="Coordinator" value="coordinator" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>
        <Button label={status === 'saving' ? 'Adding...' : 'Grant access'} onPress={handleAdd} loading={status === 'saving'} disabled={!form.uid.trim() || !form.full_name.trim()} />
        {status === 'error' && <Text style={{ fontSize: 12, color: colors.danger }}>Couldn&apos;t add — check the UID is correct and not already in use.</Text>}
      </Card>

      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: colors.ink, marginBottom: 12 }}>Current staff</Text>
      <View style={{ gap: 8 }}>
        {staffList.map((s) => (
          <Card key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: s.role === 'admin' ? `${colors.accent}33` : `${colors.muted}22`, alignItems: 'center', justifyContent: 'center' }}>
                {s.role === 'admin' ? <ShieldCheck size={16} color={colors.accent} /> : (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted }}>{s.full_name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{s.full_name}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, textTransform: 'capitalize' }}>{s.role}{s.email ? ` · ${s.email}` : ''}</Text>
              </View>
            </View>
            {s.id !== staff.id && (
              <Pressable onPress={() => removeStaff(s.id, s.full_name)} style={{ padding: 4 }}>
                <X size={16} color={colors.danger} />
              </Pressable>
            )}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
