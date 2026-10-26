import { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import * as Haptics from 'expo-haptics';
import { HandHeart } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { supabase } from '@/lib/supabase';

type Prayer = { id: string; full_name: string; content: string; pray_count: number; created_at: string };

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PrayerWall() {
  const { colors } = useTheme();
  const { member } = useMemberAuth();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const { data } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }).limit(50);
    setPrayers(data || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  async function handlePost() {
    if (!content.trim() || !member) return;
    setPosting(true);
    const { error } = await supabase.from('prayer_requests').insert({
      member_id: member.id,
      full_name: member.full_name,
      content: content.trim(),
    });
    setPosting(false);
    if (!error) {
      setContent('');
      load();
    }
  }

  async function handlePray(id: string) {
    if (prayedFor.has(id)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrayedFor((s) => new Set(s).add(id));
    setPrayers((curr) => curr.map((p) => (p.id === id ? { ...p, pray_count: p.pray_count + 1 } : p)));
    await supabase.rpc('increment_prayer_count', { p_prayer_id: id });
  }

  return (
    <Screen>
      <ScreenHeader eyebrow="Lift each other up" title="Prayer Wall" />

      <Card style={{ marginBottom: 20, gap: 10 }}>
        <TextField
          value={content}
          onChangeText={setContent}
          placeholder="What can we pray with you about?"
          multiline
          numberOfLines={3}
          style={{ minHeight: 76, textAlignVertical: 'top' }}
        />
        <Button
          label={posting ? 'Posting...' : 'Post to the wall'}
          onPress={handlePost}
          loading={posting}
          disabled={!content.trim()}
        />
      </Card>

      {prayers.length === 0 && <Text style={{ color: colors.muted }}>Nothing here yet — be the first to share.</Text>}

      <View style={{ gap: 10 }}>
        {prayers.map((p) => {
          const prayed = prayedFor.has(p.id);
          return (
            <Card key={p.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink }}>{p.full_name.split(' ')[0]}</Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>{timeAgo(p.created_at)}</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.ink, lineHeight: 19, marginBottom: 10 }}>{p.content}</Text>
              <Pressable
                onPress={() => handlePray(p.id)}
                disabled={prayed}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: 'flex-start',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: prayed ? `${colors.accent}55` : colors.border,
                  backgroundColor: prayed ? `${colors.accent}22` : 'transparent',
                }}
              >
                <HandHeart size={13} color={prayed ? colors.accent : colors.muted} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: prayed ? colors.accent : colors.muted }}>
                  {prayed ? "You're praying" : 'Praying'} · {p.pray_count}
                </Text>
              </Pressable>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
