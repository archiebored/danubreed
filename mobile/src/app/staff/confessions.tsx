import { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Phone } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  type: string;
  content: string;
  contact_info: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
};

const filters = ['new', 'reviewed', 'all'] as const;

export default function StaffConfessions() {
  const { colors } = useTheme();
  const { staff } = useAuth();
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>('new');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('anonymous_submissions').select('*').order('submitted_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount/filter change, setState happens after the await
    load();
  }, [load]);

  async function markReviewed(id: string) {
    await supabase
      .from('anonymous_submissions')
      .update({ status: 'reviewed', reviewed_by: staff?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    load();
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {filters.map((f) => {
          const active = filter === f;
          return (
            <Pressable key={f} onPress={() => setFilter(f)}>
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: active ? `${colors.accent}55` : colors.border,
                  backgroundColor: active ? `${colors.accent}22` : colors.surface,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: active ? colors.accent : colors.muted }}>
                  {f}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {loading && <Text style={{ color: colors.muted }}>Loading...</Text>}
      {!loading && items.length === 0 && <Text style={{ color: colors.muted }}>Nothing here.</Text>}

      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <Card key={item.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.accent }}>
                {item.type}
              </Text>
              <Text style={{ fontSize: 10, color: colors.muted }}>{new Date(item.submitted_at).toLocaleString()}</Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.ink }}>{item.content}</Text>
            {item.contact_info && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <Phone size={12} color={colors.accent} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>Wants a reply — {item.contact_info}</Text>
              </View>
            )}
            {item.status === 'new' ? (
              <Pressable onPress={() => markReviewed(item.id)} style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>Mark reviewed</Text>
              </Pressable>
            ) : (
              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 10 }}>
                Reviewed {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString() : ''}
              </Text>
            )}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
