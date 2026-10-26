import { useCallback, useEffect, useState } from 'react';
import { View, Image, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { ArrowRight, Moon, Sun, MapPin, Flame, HandHeart, BookOpen, Cake } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { useStreak } from '@/hooks/useStreak';
import { getVerseOfDay } from '@/data/verses';
import { serviceTimes } from '@/data/serviceTimes';
import { supabase } from '@/lib/supabase';

type NextEvent = { id: string; title: string; event_date: string; location: string | null };
type Coordinator = { id: string; full_name: string; role_label: string | null; photo_url: string | null };
type ChurchInfo = { church_name: string | null; address: string | null; city: string | null };

// Days until the next occurrence of dob's month/day (0 = today, null = no dob on file).
function daysUntilBirthday(dob: string | null): number | null {
  if (!dob) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birth = new Date(dob);
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { member } = useMemberAuth();
  const streak = useStreak();
  const verse = getVerseOfDay();
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [featured, setFeatured] = useState<Coordinator | null>(null);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);

  const load = useCallback(async () => {
    const [{ data: ev }, { data: coord }, { data: info }] = await Promise.all([
      supabase
        .from('events')
        .select('id, title, event_date, location')
        .gte('event_date', new Date().toISOString().slice(0, 10))
        .order('event_date', { ascending: true })
        .limit(1),
      supabase.from('coordinators').select('id, full_name, role_label, photo_url').order('sort_order').limit(1),
      supabase.from('church_info').select('church_name, address, city').limit(1).maybeSingle(),
    ]);
    setNextEvent(ev?.[0] || null);
    setFeatured(coord?.[0] || null);
    setChurchInfo(info || null);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = member?.full_name?.split(' ')[0] ?? '';
  const daysToBirthday = daysUntilBirthday(member?.date_of_birth ?? null);
  const isBirthdayToday = daysToBirthday === 0;
  const isBirthdaySoon = daysToBirthday !== null && daysToBirthday > 0 && daysToBirthday <= 30;

  return (
    <Screen style={{ paddingTop: 60 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Image source={require('../../../assets/wordmark.png')} style={{ width: 75, height: 44, borderRadius: 8 }} resizeMode="cover" />
        <Pressable
          onPress={toggleTheme}
          style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={15} color={colors.muted} /> : <Moon size={15} color={colors.muted} />}
        </Pressable>
      </View>

      {isBirthdayToday && (
        <Card style={{ backgroundColor: `${colors.accent}22`, borderColor: `${colors.accent}55`, marginBottom: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>
            Happy birthday, {firstName}! 🎉 The whole Da Nu Breed fam is celebrating you today.
          </Text>
        </Card>
      )}

      {isBirthdaySoon && (
        <Card style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
            <Cake size={18} color={colors.accent} />
          </View>
          <Text style={{ fontSize: 13, color: colors.ink, flex: 1 }}>
            Your birthday is in <Text style={{ fontWeight: '700', color: colors.accent }}>{daysToBirthday} day{daysToBirthday === 1 ? '' : 's'}</Text> 🎂
          </Text>
        </Card>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {member?.profile_photo_url ? (
                <Image source={{ uri: member.profile_photo_url }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent }}>{firstName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
          </Pressable>
          <View>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 2 }}>{greeting},</Text>
            <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 36, color: colors.ink, lineHeight: 38 }}>
              {firstName}
            </Text>
          </View>
        </View>
        {streak > 1 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: `${colors.accent}18`, marginBottom: 6 }}>
            <Flame size={14} color={colors.accent} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>{streak}</Text>
          </View>
        )}
      </View>

      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <BookOpen size={14} color={colors.accent} />
          <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent }}>Verse of the day</Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.ink, lineHeight: 21, fontStyle: 'italic', marginBottom: 8 }}>
          &quot;{verse.text}&quot;
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>{verse.reference}</Text>
      </Card>

      {featured && (
        <Card style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, overflow: 'hidden', backgroundColor: colors.border, flexShrink: 0 }}>
            {featured.photo_url && <Image source={{ uri: featured.photo_url }} style={{ width: '100%', height: '100%' }} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontStyle: 'italic', color: colors.ink, lineHeight: 17, marginBottom: 4 }}>
              &quot;Whoever you are, however you found us — you&apos;re welcome here.&quot;
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>
              {featured.full_name}{featured.role_label ? ` · ${featured.role_label}` : ''}
            </Text>
          </View>
        </Card>
      )}

      <Pressable onPress={() => router.push('/prayer-wall')}>
        <Card style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
            <HandHeart size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>Prayer Wall</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Share a request, or pray for someone else&apos;s</Text>
          </View>
          <ArrowRight size={16} color={colors.muted} />
        </Card>
      </Pressable>

      {nextEvent && (
        <Pressable onPress={() => router.push('/(tabs)/events')}>
          <Card style={{ marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent, marginBottom: 4 }}>
                Upcoming event
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{nextEvent.title}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {new Date(nextEvent.event_date).toLocaleDateString()}{nextEvent.location ? ` · ${nextEvent.location}` : ''}
              </Text>
            </View>
            <ArrowRight size={16} color={colors.muted} />
          </Card>
        </Pressable>
      )}

      <Pressable onPress={() => router.push('/about')}>
        <Card style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <MapPin size={14} color={colors.accent} />
            <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent }}>About the church</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 2 }}>
            {churchInfo?.church_name || 'Calvary Bible Church'}
          </Text>
          {churchInfo?.address && (
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>
              {churchInfo.address}{churchInfo.city ? `, ${churchInfo.city}` : ''}
            </Text>
          )}
          {serviceTimes.map((s) => (
            <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
              <Text style={{ fontSize: 13, color: colors.ink }}>{s.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>{s.time_text}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 8 }}>Visit us →</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}
