import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Linking, Alert, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  User, Camera, Heart, Copy, Check, LogOut, Lock, Users as UsersIcon, Tag,
} from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { NotificationOptIn } from '@/components/NotificationOptIn';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth, type Member } from '@/context/MemberAuthContext';
import { supabase } from '@/lib/supabase';
import { uploadAssetToBucket } from '@/lib/upload';

const accounts = [
  { bank: 'FirstBank', number: '2018457003' },
  { bank: 'Stanbic IBTC', number: '0015067615' },
  { bank: 'FCMB', number: '0320413015' },
  { bank: 'Zenith', number: '1010342016' },
  { bank: 'GTCO (NGN)', number: '0016453101' },
  { bank: 'GTCO (USD)', number: '0016453118' },
  { bank: 'GTCO (GBP)', number: '0016453132' },
];

function AccountRow({ bank, number }: { bank: string; number: string }) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await Clipboard.setStringAsync(number);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <Pressable onPress={handleCopy} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
      <View>
        <Text style={{ fontSize: 11, color: colors.muted }}>{bank}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink, letterSpacing: 0.5 }}>{number}</Text>
      </View>
      {copied ? <Check size={15} color={colors.accent} /> : <Copy size={15} color={colors.accent} />}
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink }}>{value}</Text>
    </View>
  );
}

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  in_secondary: 'In Secondary School',
  finished_secondary: 'Finished Secondary School',
  in_university: 'In University',
  finished_university: 'Finished University',
};

const SCHOOL_LEVEL_OPTIONS = Object.entries(SCHOOL_LEVEL_LABELS).map(([value, label]) => ({ value, label }));

type DetailsDraft = {
  fullName: string;
  phone: string;
  dob: Date | null;
  schoolLevel: string;
  guardianName: string;
  guardianContact: string;
  tribeId: string;
};

export default function Profile() {
  const { colors } = useTheme();
  const router = useRouter();
  const { member, updateMember, signOut } = useMemberAuth();

  const [tribeName, setTribeName] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [myDepartmentIds, setMyDepartmentIds] = useState<string[]>([]);
  const [socials, setSocials] = useState<{ instagram_url: string | null; tiktok_url: string | null }>({ instagram_url: null, tiktok_url: null });

  const [verseDraft, setVerseDraft] = useState(member?.favorite_bible_verse ?? '');
  const [savingVerse, setSavingVerse] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingDepartments, setSavingDepartments] = useState(false);
  const [tribes, setTribes] = useState<{ id: string; name: string }[]>([]);
  const [editingDetails, setEditingDetails] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [draft, setDraft] = useState<DetailsDraft | null>(null);

  function startEditingDetails() {
    if (!member) return;
    setDraft({
      fullName: member.full_name,
      phone: member.phone_number ?? '',
      dob: member.date_of_birth ? new Date(member.date_of_birth) : null,
      schoolLevel: member.school_level ?? '',
      guardianName: member.parent_guardian_name ?? '',
      guardianContact: member.parent_guardian_contact ?? '',
      tribeId: member.tribe_id ?? '',
    });
    setEditingDetails(true);
  }

  async function saveDetails() {
    if (!member || !draft) return;
    setSavingDetails(true);
    const { data, error } = await supabase.rpc('update_member_details', {
      p_member_id: member.id,
      p_full_name: draft.fullName.trim(),
      p_date_of_birth: draft.dob ? draft.dob.toISOString().slice(0, 10) : null,
      p_phone_number: draft.phone.trim(),
      p_school_level: draft.schoolLevel || null,
      p_parent_guardian_name: draft.guardianName.trim() || null,
      p_parent_guardian_contact: draft.guardianContact.trim() || null,
      p_tribe_id: draft.tribeId || null,
    });
    setSavingDetails(false);
    if (error) {
      Alert.alert("Couldn't save your details", error.message);
      return;
    }
    const saved = Array.isArray(data) ? data[0] : data;
    if (saved) updateMember(saved as Partial<Member>);
    setEditingDetails(false);
  }

  const load = useCallback(async () => {
    if (!member) return;
    const [{ data: allDepts }, { data: myDepts }, { data: info }, { data: allTribes }] = await Promise.all([
      supabase.from('departments').select('id, name').order('name'),
      supabase.rpc('get_member_departments', { p_member_id: member.id }),
      supabase.from('church_info').select('instagram_url, tiktok_url').limit(1).maybeSingle(),
      supabase.from('tribes').select('id, name').order('name'),
    ]);
    setTribes(allTribes || []);
    setDepartments(allDepts || []);
    setMyDepartmentIds((myDepts || []).map((d: { id: string }) => d.id));
    setSocials({ instagram_url: info?.instagram_url ?? null, tiktok_url: info?.tiktok_url ?? null });

    if (member.tribe_id) {
      const { data: tribe } = await supabase.from('tribes').select('name').eq('id', member.tribe_id).single();
      setTribeName(tribe?.name ?? null);
    } else {
      setTribeName(null);
    }
  }, [member]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local draft when the member record refreshes, not user input
    setVerseDraft(member?.favorite_bible_verse ?? '');
  }, [member?.favorite_bible_verse]);

  async function handlePickPhoto() {
    if (!member) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (result.canceled) return;
    setUploadingPhoto(true);
    const { publicUrl, error } = await uploadAssetToBucket('member-photos', result.assets[0].uri, 'jpg', 'image/jpeg');
    if (error || !publicUrl) {
      setUploadingPhoto(false);
      Alert.alert(
        "Couldn't upload photo",
        error?.message ?? 'Unknown error. Make sure the member-photos storage bucket exists (run supabase/member_app_migration.sql).'
      );
      return;
    }
    const { error: rpcError } = await supabase.rpc('update_member_profile', { p_member_id: member.id, p_profile_photo_url: publicUrl });
    setUploadingPhoto(false);
    if (rpcError) {
      Alert.alert("Photo uploaded, but couldn't save it to your profile", rpcError.message);
      return;
    }
    updateMember({ profile_photo_url: publicUrl });
  }

  async function handleSaveVerse() {
    if (!member) return;
    setSavingVerse(true);
    await supabase.rpc('update_member_profile', { p_member_id: member.id, p_favorite_bible_verse: verseDraft.trim() || null });
    updateMember({ favorite_bible_verse: verseDraft.trim() || null });
    setSavingVerse(false);
  }

  async function toggleDepartment(id: string) {
    if (!member) return;
    const next = myDepartmentIds.includes(id) ? myDepartmentIds.filter((d) => d !== id) : [...myDepartmentIds, id];
    setMyDepartmentIds(next);
    setSavingDepartments(true);
    await supabase.rpc('update_member_departments', { p_member_id: member.id, p_department_ids: next });
    setSavingDepartments(false);
  }

  function handleSignOut() {
    Alert.alert('Log out?', "You'll need your name and phone number to log back in.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  if (!member) return null;

  return (
    <Screen style={{ paddingTop: 60 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Pressable onPress={handlePickPhoto} style={{ width: 92, height: 92, borderRadius: 46, marginBottom: 12 }}>
          <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {member.profile_photo_url ? (
              <Image
                source={{ uri: member.profile_photo_url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                onError={(e) => console.error('Profile photo failed to load:', member.profile_photo_url, e.error)}
              />
            ) : (
              <User size={36} color={colors.muted} />
            )}
          </View>
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.base }}>
            <Camera size={13} color={colors.accentText} />
          </View>
        </Pressable>
        {uploadingPhoto && <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Uploading...</Text>}
        <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 30, color: colors.ink }}>{member.full_name}</Text>
        {tribeName && <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '600' }}>{tribeName}</Text>}
      </View>

      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent, marginBottom: 8 }}>
          Favorite bible verse
        </Text>
        <TextField
          value={verseDraft}
          onChangeText={setVerseDraft}
          placeholder="e.g. Isaiah 40:31"
          multiline
          numberOfLines={2}
          style={{ minHeight: 56, textAlignVertical: 'top', marginBottom: 8 }}
        />
        <Button
          label={savingVerse ? 'Saving...' : 'Save'}
          variant="secondary"
          onPress={handleSaveVerse}
          loading={savingVerse}
          disabled={verseDraft.trim() === (member.favorite_bible_verse ?? '')}
        />
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Tag size={13} color={colors.accent} />
          <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent }}>Departments</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {departments.map((d) => {
            const active = myDepartmentIds.includes(d.id);
            return (
              <Pressable key={d.id} onPress={() => toggleDepartment(d.id)} disabled={savingDepartments}>
                <View
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 13,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: active ? `${colors.accent}55` : colors.border,
                    backgroundColor: active ? `${colors.accent}22` : colors.base,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: active ? colors.accent : colors.muted }}>
                    {d.name.replace(' Department', '')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <UsersIcon size={13} color={colors.accent} />
          <Text style={{ flex: 1, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent }}>My details</Text>
          {!editingDetails && (
            <Pressable onPress={startEditingDetails} hitSlop={8}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>Edit</Text>
            </Pressable>
          )}
        </View>

        {!editingDetails && (
          <>
            <InfoRow label="Date of birth" value={member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'Not set'} />
            <InfoRow label="Phone" value={member.phone_number || 'Not set'} />
            <InfoRow label="School" value={member.school_level ? SCHOOL_LEVEL_LABELS[member.school_level] ?? member.school_level : 'Not set'} />
            <InfoRow label="Guardian" value={member.parent_guardian_name || 'Not set'} />
            <InfoRow label="Guardian contact" value={member.parent_guardian_contact || 'Not set'} />
            <InfoRow label="Membership class" value={member.completed_membership_class ? 'Completed' : 'Not yet'} />
          </>
        )}

        {editingDetails && draft && (
          <View style={{ gap: 10, marginTop: 8 }}>
            <TextField placeholder="Full name" value={draft.fullName} onChangeText={(v) => setDraft({ ...draft, fullName: v })} />
            <TextField placeholder="Phone number" value={draft.phone} onChangeText={(v) => setDraft({ ...draft, phone: v })} keyboardType="phone-pad" />
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: -4 }}>Changing your name or phone also changes how you log in.</Text>

            <Pressable onPress={() => setShowDobPicker((v) => !v)}>
              <TextField placeholder="Date of birth" value={draft.dob ? draft.dob.toLocaleDateString() : ''} editable={false} pointerEvents="none" />
            </Pressable>
            {showDobPicker && (
              <View>
                <DateTimePicker
                  value={draft.dob || new Date(2012, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={(_event, selected) => {
                    if (Platform.OS === 'android') setShowDobPicker(false);
                    if (selected) setDraft({ ...draft, dob: selected });
                  }}
                />
                {Platform.OS === 'ios' && <Button label="Done" variant="secondary" onPress={() => setShowDobPicker(false)} />}
              </View>
            )}

            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.base }}>
              <Picker selectedValue={draft.schoolLevel} onValueChange={(v) => setDraft({ ...draft, schoolLevel: v })} style={{ color: colors.ink }}>
                <Picker.Item label="School level" value="" />
                {SCHOOL_LEVEL_OPTIONS.map((s) => (
                  <Picker.Item key={s.value} label={s.label} value={s.value} />
                ))}
              </Picker>
            </View>

            <TextField placeholder="Parent / guardian name" value={draft.guardianName} onChangeText={(v) => setDraft({ ...draft, guardianName: v })} />
            <TextField placeholder="Parent / guardian contact" value={draft.guardianContact} onChangeText={(v) => setDraft({ ...draft, guardianContact: v })} keyboardType="phone-pad" />

            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.base }}>
              <Picker selectedValue={draft.tribeId} onValueChange={(v) => setDraft({ ...draft, tribeId: v })} style={{ color: colors.ink }}>
                <Picker.Item label="No tribe yet" value="" />
                {tribes.map((t) => (
                  <Picker.Item key={t.id} label={t.name} value={t.id} />
                ))}
              </Picker>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Button label="Cancel" variant="secondary" onPress={() => setEditingDetails(false)} disabled={savingDetails} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={savingDetails ? 'Saving...' : 'Save'} onPress={saveDetails} loading={savingDetails} disabled={!draft.fullName.trim() || !draft.phone.trim()} />
              </View>
            </View>
          </View>
        )}
      </Card>

      <NotificationOptIn />

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Heart size={13} color={colors.accent} />
          <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent }}>Give</Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
          Online giving isn&apos;t switched on yet — give directly using the details below, or see a coordinator.
        </Text>
        <View>
          {accounts.map((a) => (
            <AccountRow key={a.bank} bank={a.bank} number={a.number} />
          ))}
        </View>
        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 6, fontStyle: 'italic' }}>
          Issue cheques in favour of &quot;Truth of Calvary Ministries&quot;.
        </Text>
      </Card>

      {(socials.instagram_url || socials.tiktok_url) && (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {socials.instagram_url && (
            <Pressable onPress={() => Linking.openURL(socials.instagram_url!)} style={{ flex: 1 }}>
              <Card style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>Instagram</Text>
              </Card>
            </Pressable>
          )}
          {socials.tiktok_url && (
            <Pressable onPress={() => Linking.openURL(socials.tiktok_url!)} style={{ flex: 1 }}>
              <Card style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>TikTok</Text>
              </Card>
            </Pressable>
          )}
        </View>
      )}

      <Pressable onPress={handleSignOut} style={{ marginBottom: 24 }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogOut size={16} color={colors.danger} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.danger }}>Log out</Text>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push('/staff/login')} style={{ alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Lock size={11} color={colors.muted} />
          <Text style={{ fontSize: 11, color: colors.muted }}>Staff access</Text>
        </View>
      </Pressable>
    </Screen>
  );
}
