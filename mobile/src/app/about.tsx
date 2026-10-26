import { useEffect, useState } from 'react';
import { View, Pressable, Linking } from 'react-native';
import { Text } from '@/components/Text';
import { MapPin, Tent, Phone, Mail } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useTheme } from '@/context/ThemeContext';
import { serviceTimes } from '@/data/serviceTimes';
import { supabase } from '@/lib/supabase';

type ChurchInfo = {
  church_name: string | null;
  address: string | null;
  city: string | null;
  camp_location: string | null;
  phone: string | null;
  email: string | null;
};

export default function About() {
  const { colors } = useTheme();
  const [info, setInfo] = useState<ChurchInfo | null>(null);

  useEffect(() => {
    supabase.from('church_info').select('*').limit(1).maybeSingle().then(({ data }) => setInfo(data));
  }, []);

  const mapsHref = info?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(`${info.address} ${info.city || ''}`)}`
    : null;

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Card accentBar>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MapPin size={18} color={colors.accent} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 2 }}>
                {info?.church_name || 'Da Nu Breed'}
              </Text>
              {info?.address ? (
                <>
                  <Text style={{ fontSize: 13, color: colors.muted }}>{info.address}</Text>
                  {info.city && <Text style={{ fontSize: 13, color: colors.muted }}>{info.city}</Text>}
                  {mapsHref && (
                    <Pressable onPress={() => Linking.openURL(mapsHref)}>
                      <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '600', marginTop: 4 }}>Get directions →</Text>
                    </Pressable>
                  )}
                </>
              ) : (
                <Text style={{ fontSize: 13, color: colors.muted }}>Address coming soon.</Text>
              )}
            </View>
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: colors.accent, marginBottom: 8 }}>
            Service times
          </Text>
          {serviceTimes.map((s) => (
            <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
              <Text style={{ fontSize: 13, color: colors.ink }}>{s.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>{s.time_text}</Text>
            </View>
          ))}
        </Card>

        {info?.camp_location && (
          <Card accentBar>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Tent size={18} color={colors.accent} style={{ marginTop: 2 }} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 2 }}>Daniel&apos;s Camp location</Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>{info.camp_location}</Text>
              </View>
            </View>
          </Card>
        )}

        {(info?.phone || info?.email) && (
          <Card style={{ gap: 10 }}>
            {info?.phone && (
              <Pressable onPress={() => Linking.openURL(`tel:${info.phone}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color={colors.accent} />
                <Text style={{ fontSize: 13, color: colors.ink }}>{info.phone}</Text>
              </Pressable>
            )}
            {info?.email && (
              <Pressable onPress={() => Linking.openURL(`mailto:${info.email}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color={colors.accent} />
                <Text style={{ fontSize: 13, color: colors.ink }}>{info.email}</Text>
              </Pressable>
            )}
          </Card>
        )}
      </View>
    </Screen>
  );
}
