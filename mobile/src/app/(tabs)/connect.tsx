import { useEffect, useState } from 'react';
import { View, Image, Pressable, Linking } from 'react-native';
import { Text } from '@/components/Text';
import { Phone, MessageCircle, Lock } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { supabase } from '@/lib/supabase';

type Coordinator = {
  id: string;
  full_name: string;
  role_label: string | null;
  photo_url: string | null;
  phone: string | null;
  whatsapp_link: string | null;
};

type SubmissionType = 'confession' | 'suggestion';

export default function Connect() {
  const { colors } = useTheme();
  const { member } = useMemberAuth();
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);

  const [type, setType] = useState<SubmissionType>('confession');
  const [content, setContent] = useState('');
  const [includeContact, setIncludeContact] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    supabase.from('coordinators').select('*').order('sort_order').then(({ data }) => setCoordinators(data || []));
  }, []);

  async function handleSubmit() {
    if (!content.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('anonymous_submissions').insert({
      type,
      content: content.trim(),
      contact_info: includeContact ? member?.phone_number ?? null : null,
    });
    setStatus(error ? 'error' : 'sent');
    if (!error) setContent('');
  }

  return (
    <Screen style={{ paddingTop: 60 }}>
      <ScreenHeader eyebrow="Reach out" title="Connect" />

      <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.accent, marginBottom: 10 }}>
        Coordinators
      </Text>
      {coordinators.length === 0 && (
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.ink }}>Coordinator contact details haven&apos;t been added yet.</Text>
        </Card>
      )}
      <View style={{ gap: 10, marginBottom: 28 }}>
        {coordinators.map((c) => (
          <Card key={c.id} accentBar style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              {c.photo_url && <Image source={{ uri: c.photo_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />}
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{c.full_name}</Text>
                {c.role_label && <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '600' }}>{c.role_label}</Text>}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {c.phone && (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${c.phone}`)}
                  style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Phone size={14} color={colors.accent} />
                </Pressable>
              )}
              {c.whatsapp_link && (
                <Pressable
                  onPress={() => Linking.openURL(c.whatsapp_link!)}
                  style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                >
                  <MessageCircle size={14} color={colors.accent} />
                </Pressable>
              )}
            </View>
          </Card>
        ))}
      </View>

      <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.accent, marginBottom: 10 }}>
        Confess or suggest
      </Text>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingVertical: 10 }}>
        <Lock size={14} color={colors.muted} />
        <Text style={{ fontSize: 11, color: colors.muted, flex: 1 }}>Anonymous — only coordinators can read this</Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {(['confession', 'suggestion'] as const).map((option) => {
          const active = type === option;
          return (
            <Pressable key={option} onPress={() => setType(option)} style={{ flex: 1 }}>
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
                <Text style={{ fontSize: 13, fontWeight: '600', textTransform: 'capitalize', color: active ? colors.accent : colors.muted }}>
                  {option}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <TextField
        value={content}
        onChangeText={setContent}
        placeholder="Write what's on your mind..."
        multiline
        numberOfLines={5}
        style={{ minHeight: 110, textAlignVertical: 'top', marginBottom: 10 }}
      />

      <Pressable
        onPress={() => setIncludeContact((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            borderWidth: 1.5,
            borderColor: includeContact ? colors.accent : colors.border,
            backgroundColor: includeContact ? colors.accent : 'transparent',
          }}
        />
        <Text style={{ fontSize: 12, color: colors.muted, flex: 1 }}>
          Let a coordinator reach back out to me about this (shares your phone number)
        </Text>
      </Pressable>

      <Button
        label={status === 'sending' ? 'Sending...' : 'Submit anonymously'}
        onPress={handleSubmit}
        loading={status === 'sending'}
        disabled={!content.trim()}
        fullWidth
      />

      {status === 'sent' && (
        <Text style={{ fontSize: 11, textAlign: 'center', color: colors.accent, fontWeight: '600', marginTop: 12 }}>
          Sent. Thank you for sharing.
        </Text>
      )}
      {status === 'error' && (
        <Text style={{ fontSize: 11, textAlign: 'center', color: colors.danger, marginTop: 12 }}>
          Something went wrong sending that — please try again.
        </Text>
      )}
    </Screen>
  );
}
