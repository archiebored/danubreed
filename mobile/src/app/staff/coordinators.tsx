import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Image, Alert } from 'react-native';
import { Text } from '@/components/Text';
import * as ImagePicker from 'expo-image-picker';
import { Upload, User, Pencil, X } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { uploadAssetToBucket } from '@/lib/upload';

type Coordinator = {
  id: string;
  full_name: string;
  role_label: string | null;
  phone: string | null;
  whatsapp_link: string | null;
  photo_url: string | null;
};

const emptyForm = { full_name: '', role_label: '', phone: '', whatsapp_link: '' };

export default function StaffCoordinators() {
  const { colors } = useTheme();
  const confirm = useConfirm();
  const [items, setItems] = useState<Coordinator[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('coordinators').select('*').order('sort_order');
    setItems(data || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  function startEdit(item: Coordinator) {
    setEditingId(item.id);
    setForm({ full_name: item.full_name, role_label: item.role_label || '', phone: item.phone || '', whatsapp_link: item.whatsapp_link || '' });
    setPhotoUri(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoUri(null);
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      let photo_url: string | undefined;
      if (photoUri) {
        const { publicUrl, error } = await uploadAssetToBucket('coordinator-photos', photoUri, 'jpg', 'image/jpeg');
        if (error || !publicUrl) {
          Alert.alert("Couldn't upload photo", error?.message ?? 'Unknown error.');
          setSaving(false);
          return;
        }
        photo_url = publicUrl;
      }
      const payload = { ...form, ...(photo_url ? { photo_url } : {}) };
      const { error: dbError } = editingId
        ? await supabase.from('coordinators').update(payload).eq('id', editingId)
        : await supabase.from('coordinators').insert({ ...payload, sort_order: items.length });
      if (dbError) {
        Alert.alert("Couldn't save", dbError.message);
        setSaving(false);
        return;
      }
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : 'Unknown error.');
      setSaving(false);
      return;
    }
    setSaving(false);
    resetForm();
    load();
  }

  async function remove(id: string, name: string) {
    const ok = await confirm({ title: `Remove ${name}?`, message: 'They will disappear from the public Coordinators page.' });
    if (!ok) return;
    await supabase.from('coordinators').delete().eq('id', id);
    load();
  }

  return (
    <Screen>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink, marginBottom: 6 }}>
        {editingId ? 'Edit coordinator' : 'Add coordinator'}
      </Text>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 14 }}>
        This is the public directory shown on the Coordinators page. The first one here also appears as the welcome
        message on Home.
      </Text>

      <Card style={{ marginBottom: 24, gap: 10 }}>
        <Pressable
          onPress={pickPhoto}
          style={{ borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, padding: 16, alignItems: 'center', gap: 8 }}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: 56, height: 56, borderRadius: 28 }} />
          ) : (
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} color={colors.muted} />
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Upload size={12} color={colors.muted} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.muted }}>{photoUri ? 'Photo selected' : 'Upload a photo'}</Text>
          </View>
        </Pressable>

        <TextField placeholder="Full name" value={form.full_name} onChangeText={(v) => setForm((f) => ({ ...f, full_name: v }))} />
        <TextField placeholder="Role, e.g. Lead Coordinator" value={form.role_label} onChangeText={(v) => setForm((f) => ({ ...f, role_label: v }))} />
        <TextField placeholder="Phone number" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <TextField placeholder="WhatsApp link (optional)" value={form.whatsapp_link} onChangeText={(v) => setForm((f) => ({ ...f, whatsapp_link: v }))} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label={saving ? 'Saving...' : editingId ? 'Save changes' : 'Add'} onPress={handleSubmit} loading={saving} />
          {editingId && <Button label="Cancel" variant="ghost" onPress={resetForm} />}
        </View>
      </Card>

      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: colors.ink, marginBottom: 12 }}>Current coordinators</Text>
      <View style={{ gap: 8 }}>
        {items.map((item) => (
          <Card key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={{ width: 38, height: 38, borderRadius: 19 }} />
              ) : (
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color={colors.muted} />
                </View>
              )}
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{item.full_name}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>{item.role_label}{item.phone ? ` · ${item.phone}` : ''}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={() => startEdit(item)} style={{ padding: 8 }}>
                <Pencil size={15} color={colors.accent} />
              </Pressable>
              <Pressable onPress={() => remove(item.id, item.full_name)} style={{ padding: 8 }}>
                <X size={16} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
