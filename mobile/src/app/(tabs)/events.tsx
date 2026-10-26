import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { Text } from '@/components/Text';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MapPin, X, Play, Newspaper } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { supabase } from '@/lib/supabase';
import { POST_CATEGORIES, categoryLabel } from '@/data/postCategories';

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  cover_image_url: string | null;
};
type Post = {
  id: string;
  image_url: string;
  media_type: 'image' | 'video' | null;
  title: string | null;
  description: string | null;
  sort_order: number | null;
  category: string | null;
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function DateBadge({ dateStr }: { dateStr: string | null }) {
  const { colors } = useTheme();
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return (
    <View style={{ width: 48, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.base, borderWidth: 1, borderColor: colors.border, flexShrink: 0 }}>
      <View style={{ backgroundColor: colors.accent, paddingVertical: 3, alignItems: 'center' }}>
        <Text style={{ fontSize: 9, fontWeight: '800', color: colors.accentText, letterSpacing: 0.5 }}>{MONTHS[d.getMonth()]}</Text>
      </View>
      <View style={{ paddingVertical: 6, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: colors.ink, lineHeight: 24 }}>{d.getDate()}</Text>
      </View>
    </View>
  );
}

export default function Events() {
  const { colors } = useTheme();
  const { member } = useMemberAuth();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [phone, setPhone] = useState(member?.phone_number ?? '');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const [posts, setPosts] = useState<Post[]>([]);
  const [active, setActive] = useState<Post | null>(null);
  const [postFilter, setPostFilter] = useState<'all' | 'video' | string>('all');

  const load = useCallback(async () => {
    const [{ data: ev }, { data: gallery }] = await Promise.all([
      supabase
        .from('events')
        .select('id, title, description, event_date, location, cover_image_url')
        .order('event_date', { ascending: true }),
      supabase.from('gallery_photos').select('*').order('sort_order', { ascending: false }),
    ]);
    setEvents(ev || []);
    setPosts(gallery || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  async function handleRegister(eventId: string) {
    if (!member || !phone.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      full_name: member.full_name,
      phone_number: phone.trim(),
    });
    setStatus(error ? 'error' : 'sent');
  }

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });
  useEffect(() => {
    // useVideoPlayer only loads its initial source — later source changes need
    // an explicit replace, otherwise the player just sits at 00:00 forever.
    if (active?.media_type === 'video') {
      player.replaceAsync(active.image_url).then(() => player.play());
    }
  }, [active, player]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => !e.event_date || e.event_date >= today);

  return (
    <Screen style={{ paddingTop: 60 }}>
      <ScreenHeader eyebrow="What's coming up" title="Events" />

      {loading && <Text style={{ color: colors.muted }}>Loading...</Text>}
      {!loading && upcoming.length === 0 && (
        <Text style={{ color: colors.muted, marginBottom: 8 }}>Nothing on the calendar yet — check back soon.</Text>
      )}

      <View style={{ gap: 12, marginBottom: 32 }}>
        {upcoming.map((ev) => (
          <Card key={ev.id} style={{ overflow: 'hidden', padding: 0 }}>
            {ev.cover_image_url && (
              <Image source={{ uri: ev.cover_image_url }} style={{ width: '100%', height: 130 }} contentFit="cover" />
            )}
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <DateBadge dateStr={ev.event_date} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: colors.ink, marginBottom: 2 }}>{ev.title}</Text>
                  {ev.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color={colors.muted} />
                      <Text style={{ fontSize: 12, color: colors.muted }}>{ev.location}</Text>
                    </View>
                  )}
                </View>
              </View>
              {ev.description && <Text style={{ fontSize: 13, color: colors.muted, marginTop: 10 }}>{ev.description}</Text>}

              {openEventId !== ev.id ? (
                <Button
                  label="Register →"
                  variant="ghost"
                  onPress={() => {
                    setOpenEventId(ev.id);
                    setStatus('idle');
                  }}
                  style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: 8 }}
                />
              ) : (
                <View style={{ gap: 8, marginTop: 12 }}>
                  <TextField placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                  <Button
                    label={status === 'sending' ? 'Registering...' : 'Confirm registration'}
                    onPress={() => handleRegister(ev.id)}
                    loading={status === 'sending'}
                    disabled={!phone.trim()}
                  />
                  {status === 'sent' && (
                    <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '600' }}>You&apos;re registered for {ev.title}.</Text>
                  )}
                  {status === 'error' && <Text style={{ fontSize: 12, color: colors.danger }}>Something went wrong — try again.</Text>}
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <Newspaper size={12} color={colors.accent} />
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.accent }}>
          The blog
        </Text>
      </View>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 28, color: colors.ink, marginBottom: 14 }}>Past events</Text>

      {posts.length === 0 && <Text style={{ color: colors.muted }}>No moments posted yet — check back soon.</Text>}

      {posts.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {[{ value: 'all', label: 'All' }, { value: 'video', label: 'Videos' }, ...POST_CATEGORIES.filter((c) => posts.some((p) => p.category === c.value))].map((chip) => {
            const active = postFilter === chip.value;
            return (
              <Pressable key={chip.value} onPress={() => setPostFilter(chip.value)}>
                <View
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 13,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: active ? `${colors.accent}55` : colors.border,
                    backgroundColor: active ? `${colors.accent}22` : colors.surface,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '500', color: active ? colors.accent : colors.muted }}>{chip.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={{ gap: 14 }}>
        {posts
          .filter((p) => postFilter === 'all' || (postFilter === 'video' ? p.media_type === 'video' : p.category === postFilter))
          .map((p) => (
          <Pressable key={p.id} onPress={() => setActive(p)}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={{ width: '100%', height: 190 }}>
                <Image source={{ uri: p.image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                {p.media_type === 'video' && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={18} color="#fff" fill="#fff" />
                    </View>
                  </View>
                )}
              </View>
              <View style={{ padding: 14 }}>
                {categoryLabel(p.category) && (
                  <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.accent, marginBottom: 2 }}>
                    {categoryLabel(p.category)}
                  </Text>
                )}
                <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 20, color: colors.ink, marginBottom: 4 }}>
                  {p.title || 'A moment from Da Nu Breed'}
                </Text>
                {p.description && (
                  <Text numberOfLines={2} style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
                    {p.description}
                  </Text>
                )}
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      <Modal visible={!!active} animationType="fade" transparent onRequestClose={() => setActive(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Pressable
            onPress={() => setActive(null)}
            style={{ position: 'absolute', top: 50, right: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <X size={18} color="#fff" />
          </Pressable>

          {active?.media_type === 'video' ? (
            <VideoView player={player} style={{ width: '100%', height: 320, borderRadius: 16 }} contentFit="contain" />
          ) : active ? (
            <Image source={{ uri: active.image_url }} style={{ width: '100%', height: 320, borderRadius: 16 }} contentFit="contain" />
          ) : null}

          {(active?.title || active?.description) && (
            <View style={{ marginTop: 16 }}>
              {active?.title && (
                <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: '#fff', marginBottom: 4, textAlign: 'center' }}>
                  {active.title}
                </Text>
              )}
              {active?.description && (
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>{active.description}</Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </Screen>
  );
}
