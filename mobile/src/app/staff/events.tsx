import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Platform, Image, Alert } from 'react-native';
import { Text } from '@/components/Text';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, MapPin, ChevronDown, ChevronUp, Users, ImagePlus, Pencil, X } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { uploadAssetToBucket } from '@/lib/upload';

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  capacity: number | null;
  cover_image_url: string | null;
};
type Registration = { event_id: string; full_name: string; phone_number: string | null };

function getStatus(dateStr: string | null) {
  if (!dateStr) return { label: 'No date', color: '#888888' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  if (eventDate < today) return { label: 'Past', color: '#888888' };
  if (eventDate.getTime() === today.getTime()) return { label: 'Today', color: '#F97316' };
  return { label: 'Upcoming', color: '#4ADE80' };
}

const emptyForm = { title: '', description: '', location: '', capacity: '' };

export default function StaffEvents() {
  const { colors } = useTheme();
  const confirm = useConfirm();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, Registration[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverAsset, setCoverAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const { data: ev } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    setEvents(ev || []);
    const { data: regs } = await supabase.from('event_registrations').select('event_id, full_name, phone_number');
    const grouped: Record<string, Registration[]> = {};
    (regs || []).forEach((r) => {
      grouped[r.event_id] = grouped[r.event_id] || [];
      grouped[r.event_id].push(r);
    });
    setRegistrations(grouped);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    loadAll();
  }, [loadAll]);

  function startEdit(ev: EventRow) {
    setEditingId(ev.id);
    setForm({ title: ev.title, description: ev.description || '', location: ev.location || '', capacity: ev.capacity ? String(ev.capacity) : '' });
    setEventDate(ev.event_date ? new Date(ev.event_date) : null);
    setExistingCoverUrl(ev.cover_image_url);
    setCoverAsset(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setEventDate(null);
    setCoverAsset(null);
    setExistingCoverUrl(null);
  }

  async function pickCover() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [16, 9] });
    if (!result.canceled) setCoverAsset(result.assets[0]);
  }

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      let cover_image_url = existingCoverUrl;
      if (coverAsset) {
        const { publicUrl, error } = await uploadAssetToBucket('event-covers', coverAsset.uri, 'jpg', 'image/jpeg');
        if (error || !publicUrl) {
          Alert.alert("Couldn't upload cover image", error?.message ?? 'Unknown error.');
          setSaving(false);
          return;
        }
        cover_image_url = publicUrl;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        event_date: eventDate ? eventDate.toISOString().slice(0, 10) : null,
        capacity: form.capacity === '' ? null : Number(form.capacity),
        cover_image_url,
      };
      const { error: dbError } = editingId
        ? await supabase.from('events').update(payload).eq('id', editingId)
        : await supabase.from('events').insert(payload);
      if (dbError) {
        Alert.alert("Couldn't save event", dbError.message);
        setSaving(false);
        return;
      }
    } catch (err) {
      Alert.alert("Couldn't save event", err instanceof Error ? err.message : 'Unknown error.');
      setSaving(false);
      return;
    }
    setSaving(false);
    resetForm();
    loadAll();
  }

  async function removeEvent(id: string, title: string) {
    const ok = await confirm({ title: 'Delete this event?', message: `"${title}" and all its registrations will be permanently removed.` });
    if (!ok) return;
    await supabase.from('events').delete().eq('id', id);
    loadAll();
  }

  return (
    <Screen>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink, marginBottom: 14 }}>
        {editingId ? 'Edit event' : 'New event'}
      </Text>

      <Card style={{ marginBottom: 24, gap: 10 }}>
        <Pressable
          onPress={pickCover}
          style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderStyle: coverAsset || existingCoverUrl ? 'solid' : 'dashed', borderColor: colors.border }}
        >
          {coverAsset || existingCoverUrl ? (
            <Image source={{ uri: coverAsset?.uri ?? existingCoverUrl ?? undefined }} style={{ width: '100%', height: 110 }} />
          ) : (
            <View style={{ paddingVertical: 20, alignItems: 'center', gap: 6 }}>
              <ImagePlus size={18} color={colors.accent} />
              <Text style={{ fontSize: 12, color: colors.muted }}>Add a cover image (optional)</Text>
            </View>
          )}
        </Pressable>
        <TextField placeholder="Title" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} />
        <TextField
          placeholder="Description"
          value={form.description}
          onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
          multiline
          numberOfLines={2}
          style={{ minHeight: 60, textAlignVertical: 'top' }}
        />
        <Pressable onPress={() => setShowDate((v) => !v)}>
          <TextField placeholder="Event date" value={eventDate ? eventDate.toLocaleDateString() : ''} editable={false} pointerEvents="none" />
        </Pressable>
        {showDate && (
          <View>
            <DateTimePicker
              value={eventDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_e, selected) => {
                if (Platform.OS === 'android') setShowDate(false);
                if (selected) setEventDate(selected);
              }}
            />
            {Platform.OS === 'ios' && <Button label="Done" variant="secondary" onPress={() => setShowDate(false)} />}
          </View>
        )}
        <TextField
          placeholder="Capacity (optional)"
          value={form.capacity}
          onChangeText={(v) => setForm((f) => ({ ...f, capacity: v.replace(/[^0-9]/g, '') }))}
          keyboardType="number-pad"
        />
        <TextField placeholder="Location" value={form.location} onChangeText={(v) => setForm((f) => ({ ...f, location: v }))} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label={saving ? 'Saving...' : editingId ? 'Save changes' : 'Create event'} onPress={handleSubmit} loading={saving} />
          {editingId && <Button label="Cancel" variant="ghost" onPress={resetForm} />}
        </View>
      </Card>

      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: colors.ink, marginBottom: 12 }}>
        All events ({events.length})
      </Text>

      <View style={{ gap: 10 }}>
        {events.map((ev) => {
          const regs = registrations[ev.id] || [];
          const isOpen = expandedId === ev.id;
          const status = getStatus(ev.event_date);
          const pct = ev.capacity ? Math.min(100, Math.round((regs.length / ev.capacity) * 100)) : null;
          return (
            <Card key={ev.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                {ev.cover_image_url && (
                  <Image source={{ uri: ev.cover_image_url }} style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }} />
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{ev.title}</Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: `${status.color}22` }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: status.color }}>{status.label}</Text>
                    </View>
                  </View>
                  {ev.description && <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>{ev.description}</Text>}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {ev.event_date && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} color={colors.muted} />
                        <Text style={{ fontSize: 11, color: colors.muted }}>{new Date(ev.event_date).toLocaleDateString()}</Text>
                      </View>
                    )}
                    {ev.location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color={colors.muted} />
                        <Text style={{ fontSize: 11, color: colors.muted }}>{ev.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Pressable onPress={() => startEdit(ev)} style={{ padding: 8 }}>
                    <Pencil size={15} color={colors.accent} />
                  </Pressable>
                  <Pressable onPress={() => removeEvent(ev.id, ev.title)} style={{ padding: 8 }}>
                    <X size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </View>

              {ev.capacity ? (
                <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{regs.length} / {ev.capacity} registered</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{pct}%</Text>
                  </View>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${pct ?? 0}%` as const, backgroundColor: (pct ?? 0) >= 100 ? colors.danger : colors.accent }} />
                  </View>
                </View>
              ) : null}

              <Pressable onPress={() => setExpandedId(isOpen ? null : ev.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                {isOpen ? <ChevronUp size={14} color={colors.accent} /> : <ChevronDown size={14} color={colors.accent} />}
                <Users size={12} color={colors.accent} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>{regs.length} registered</Text>
              </Pressable>

              {isOpen && (
                <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, gap: 4 }}>
                  {regs.length === 0 && <Text style={{ fontSize: 12, color: colors.muted }}>No one&apos;s registered yet.</Text>}
                  {regs.map((r, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.ink }}>{r.full_name}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>{r.phone_number || '—'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
        {events.length === 0 && <Text style={{ color: colors.muted }}>No events yet.</Text>}
      </View>
    </Screen>
  );
}
