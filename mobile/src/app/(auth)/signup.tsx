import { useEffect, useRef, useState } from 'react';
import { View, Pressable, Platform, Switch } from 'react-native';
import { Text } from '@/components/Text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Camera, User } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { ThemeContext, useTheme } from '@/context/ThemeContext';
import { colorsFor } from '@/theme/colors';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { supabase } from '@/lib/supabase';
import { uploadAssetToBucket } from '@/lib/upload';

const forcedColors = colorsFor('dark');
const forcedDarkTheme = { theme: 'dark' as const, colors: forcedColors, toggleTheme: () => {} };

const SCHOOL_LEVELS = [
  { value: 'in_secondary', label: 'In Secondary School' },
  { value: 'finished_secondary', label: 'Finished Secondary School' },
  { value: 'in_university', label: 'In University' },
  { value: 'finished_university', label: 'Finished University' },
];

type Lookup = { id: string; name: string };

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.accent, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function SignupForm() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login, loginWithId } = useMemberAuth();
  const [departments, setDepartments] = useState<Lookup[]>([]);
  const [tribes, setTribes] = useState<Lookup[]>([]);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDob, setShowDob] = useState(false);
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');
  const [completedMembershipClass, setCompletedMembershipClass] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [knowsTribe, setKnowsTribe] = useState<boolean | null>(null);
  const [tribeId, setTribeId] = useState('');
  const [verse, setVerse] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [continuing, setContinuing] = useState(false);
  // Holds the background "log in + save photo/verse" job so Continue can wait for it.
  const finishing = useRef<Promise<void> | null>(null);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  useEffect(() => {
    supabase.from('departments').select('id, name').order('name').then(({ data }) => setDepartments(data || []));
    supabase.from('tribes').select('id, name').order('name').then(({ data }) => setTribes(data || []));
  }, []);

  function toggleDepartment(id: string) {
    setSelectedDepartments((curr) => (curr.includes(id) ? curr.filter((d) => d !== id) : [...curr, id]));
  }

  const isValid = fullName.trim() && dob && phone.trim() && guardianName.trim() && guardianContact.trim();

  async function handleSubmit() {
    if (!isValid) return;
    setStatus('sending');
    const { error } = await supabase.rpc('signup_member', {
      p_full_name: fullName.trim(),
      p_date_of_birth: dob!.toISOString().slice(0, 10),
      p_phone_number: phone.trim(),
      p_parent_guardian_name: guardianName.trim(),
      p_parent_guardian_contact: guardianContact.trim(),
      p_department_ids: selectedDepartments,
      p_tribe_id: knowsTribe && tribeId ? tribeId : null,
      p_school_level: schoolLevel || null,
      p_completed_membership_class: completedMembershipClass,
    });
    if (error) {
      setStatus('error');
      return;
    }
    setStatus('sent');
    // Log in and save the photo/verse in the background so "Continue" is near-instant.
    finishing.current = (async () => {
      const { memberId } = await login(fullName, phone);
      if (!memberId) return;
      let photoUrl: string | null = null;
      if (photoUri) {
        const upload = await uploadAssetToBucket('member-photos', photoUri, 'jpg', 'image/jpeg');
        photoUrl = upload.publicUrl;
      }
      if (photoUrl || verse.trim()) {
        await supabase.rpc('update_member_profile', {
          p_member_id: memberId,
          p_favorite_bible_verse: verse.trim() || null,
          p_profile_photo_url: photoUrl,
        });
        await loginWithId(memberId);
      }
    })();
  }

  async function handleContinue() {
    setContinuing(true);
    await finishing.current;
    router.replace('/(tabs)');
  }

  if (status === 'sent') {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <Card style={{ alignItems: 'center', paddingVertical: 32, borderColor: `${colors.accent}55` }}>
          <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink, marginBottom: 8 }}>
            You&apos;re signed up!
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 20 }}>
            {knowsTribe && tribeId
              ? 'Your tribe is set. A coordinator will confirm your other details soon.'
              : 'A coordinator will assign your tribe soon.'}
          </Text>
          <Button label={continuing ? 'Taking you in...' : 'Continue'} onPress={handleContinue} loading={continuing} fullWidth />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <ArrowLeft size={16} color={colors.muted} />
        <Text style={{ fontSize: 13, color: colors.muted }}>Back</Text>
      </Pressable>
      <ScreenHeader eyebrow="Join Da Nu Breed" title="Sign up" />

      <View style={{ gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Pressable onPress={pickPhoto} style={{ width: 92, height: 92, borderRadius: 46 }}>
            <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <User size={36} color={colors.muted} />
              )}
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.base }}>
              <Camera size={13} color={colors.accentText} />
            </View>
          </Pressable>
          <Text style={{ fontSize: 11, color: colors.muted }}>Add a profile photo (optional)</Text>
        </View>

        <View style={{ gap: 10 }}>
          <SectionLabel>Personal info</SectionLabel>
          <TextField placeholder="Full name" value={fullName} onChangeText={setFullName} />

          <Pressable onPress={() => setShowDob((v) => !v)}>
            <TextField
              placeholder="Date of birth"
              value={dob ? dob.toLocaleDateString() : ''}
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
          {showDob && (
            <View>
              <DateTimePicker
                value={dob || new Date(2012, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  if (Platform.OS === 'android') setShowDob(false);
                  if (selectedDate) setDob(selectedDate);
                }}
              />
              {Platform.OS === 'ios' && <Button label="Done" variant="secondary" onPress={() => setShowDob(false)} />}
            </View>
          )}

          <TextField placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: -4 }}>
            This is what you&apos;ll use to log back in — no password needed.
          </Text>

          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.base }}>
            <Picker selectedValue={schoolLevel} onValueChange={setSchoolLevel} style={{ color: colors.ink }}>
              <Picker.Item label="School level" value="" />
              {SCHOOL_LEVELS.map((s) => (
                <Picker.Item key={s.value} label={s.label} value={s.value} />
              ))}
            </Picker>
          </View>

          <TextField
            placeholder="Favorite bible verse (optional, e.g. Isaiah 40:31)"
            value={verse}
            onChangeText={setVerse}
            multiline
            numberOfLines={2}
            style={{ minHeight: 56, textAlignVertical: 'top' }}
          />

          <TextField placeholder="Parent / guardian name" value={guardianName} onChangeText={setGuardianName} />
          <TextField placeholder="Parent / guardian contact" value={guardianContact} onChangeText={setGuardianContact} keyboardType="phone-pad" />
        </View>

        <View style={{ gap: 10 }}>
          <SectionLabel>Tribe & service</SectionLabel>
          <Text style={{ fontSize: 13, color: colors.ink }}>Do you know your current tribe?</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[['Yes', true], ['No', false]].map(([label, val]) => {
              const active = knowsTribe === val;
              return (
                <Pressable key={label as string} onPress={() => setKnowsTribe(val as boolean)} style={{ flex: 1 }}>
                  <View
                    style={{
                      paddingVertical: 11,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: active ? `${colors.accent}55` : colors.border,
                      backgroundColor: active ? `${colors.accent}22` : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.accent : colors.muted }}>{label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {knowsTribe && (
            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.base }}>
              <Picker selectedValue={tribeId} onValueChange={setTribeId} style={{ color: colors.ink }}>
                <Picker.Item label="Select your tribe" value="" />
                {tribes.map((t) => (
                  <Picker.Item key={t.id} label={t.name} value={t.id} />
                ))}
              </Picker>
            </View>
          )}
          {knowsTribe === false && (
            <Text style={{ fontSize: 12, color: colors.muted }}>No worries — a coordinator will assign your tribe after sign-up.</Text>
          )}

          <Text style={{ fontSize: 13, color: colors.ink, marginTop: 4 }}>Your departments</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: -4 }}>
            Pick any you&apos;re already in or want to join. You can change these anytime from your profile.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {departments.map((d) => {
              const active = selectedDepartments.includes(d.id);
              return (
                <Pressable key={d.id} onPress={() => toggleDepartment(d.id)}>
                  <View
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: active ? `${colors.accent}55` : colors.border,
                      backgroundColor: active ? `${colors.accent}22` : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '500', color: active ? colors.accent : colors.muted }}>
                      {d.name.replace(' Department', '')}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <SectionLabel>Membership</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ fontSize: 13, color: colors.ink, flex: 1 }}>I&apos;ve completed membership class</Text>
            <Switch
              value={completedMembershipClass}
              onValueChange={setCompletedMembershipClass}
              trackColor={{ true: colors.accent, false: colors.border }}
            />
          </View>
        </View>

        <Button
          label={status === 'sending' ? 'Signing up...' : 'Sign up'}
          onPress={handleSubmit}
          loading={status === 'sending'}
          disabled={!isValid}
          fullWidth
        />
        {status === 'error' && <Text style={{ fontSize: 12, color: colors.danger }}>Something went wrong — please try again.</Text>}

        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
            Already signed up? <Text style={{ color: colors.accent, fontWeight: '600' }}>Log in</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

export default function Signup() {
  return (
    <ThemeContext.Provider value={forcedDarkTheme}>
      <SignupForm />
    </ThemeContext.Provider>
  );
}
