import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { Users, Tags, Mail, Cake, Calendar, Bell, Phone, Newspaper, MapPin, Lock, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Member = { full_name: string; date_of_birth: string };

function daysUntilNextBirthday(dob: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birth = new Date(dob);
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const sections = [
  { href: '/staff/members', label: 'Members', icon: Users },
  { href: '/staff/events', label: 'Events', icon: Calendar },
  { href: '/staff/confessions', label: 'Confessions', icon: Mail },
  { href: '/staff/coordinators', label: 'Coordinators', icon: Phone },
  { href: '/staff/blog', label: 'Blog', icon: Newspaper },
  { href: '/staff/visit-info', label: 'Visit Us info', icon: MapPin },
  { href: '/staff/notifications', label: 'Notifications', icon: Bell },
] as const;

export default function Dashboard() {
  const { colors } = useTheme();
  const { staff } = useAuth();
  const router = useRouter();
  const [counts, setCounts] = useState({ members: 0, tribes: 0, departments: 0, newSubmissions: 0 });
  const [birthdays, setBirthdays] = useState<(Member & { daysAway: number })[]>([]);

  useEffect(() => {
    async function load() {
      const [members, tribes, departments, newSubmissions, allMembers] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('tribes').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('anonymous_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('members').select('full_name, date_of_birth'),
      ]);
      setCounts({
        members: members.count || 0,
        tribes: tribes.count || 0,
        departments: departments.count || 0,
        newSubmissions: newSubmissions.count || 0,
      });
      const upcoming = ((allMembers.data as Member[]) || [])
        .map((m) => ({ ...m, daysAway: daysUntilNextBirthday(m.date_of_birth) }))
        .filter((m) => m.daysAway <= 30)
        .sort((a, b) => a.daysAway - b.daysAway);
      setBirthdays(upcoming);
    }
    load();
  }, []);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.accent, marginBottom: 4 }}>
            Overview
          </Text>
          <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 32, color: colors.ink }}>Dashboard</Text>
        </View>
        <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ fontSize: 11, color: colors.muted, textTransform: 'capitalize' }}>{staff?.role}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <View style={{ width: '47%' }}>
          <StatCard label="Members" value={counts.members} icon={Users} />
        </View>
        <View style={{ width: '47%' }}>
          <StatCard label="Tribes" value={counts.tribes} icon={Tags} />
        </View>
        <View style={{ width: '47%' }}>
          <StatCard label="Depts" value={counts.departments} icon={Tags} />
        </View>
        <Pressable onPress={() => router.push('/staff/confessions')} style={{ width: '47%' }}>
          <StatCard label="New confessions" value={counts.newSubmissions} icon={Mail} accent />
        </Pressable>
      </View>

      <Card style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: `${colors.accent}1c`, alignItems: 'center', justifyContent: 'center' }}>
            <Cake size={15} color={colors.accent} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>Upcoming birthdays</Text>
        </View>
        {birthdays.length === 0 && <Text style={{ fontSize: 12, color: colors.muted }}>No birthdays coming up this month.</Text>}
        <View style={{ gap: 8 }}>
          {birthdays.map((m) => (
            <View key={m.full_name + m.date_of_birth} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.ink }}>{m.full_name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>
                {m.daysAway === 0 ? 'Today! 🎉' : `${m.daysAway} day${m.daysAway === 1 ? '' : 's'}`}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.accent, marginBottom: 10 }}>
        Manage
      </Text>
      <View style={{ gap: 8 }}>
        {sections.map(({ href, label, icon: Icon }) => (
          <Pressable key={href} onPress={() => router.push(href)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${colors.accent}1c`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={colors.accent} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.ink, flex: 1 }}>{label}</Text>
              <ChevronRight size={15} color={colors.muted} />
            </Card>
          </Pressable>
        ))}
        {staff?.role === 'admin' && (
          <Pressable onPress={() => router.push('/staff/roles')}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${colors.accent}1c`, alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={15} color={colors.accent} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.ink, flex: 1 }}>Roles</Text>
              <ChevronRight size={15} color={colors.muted} />
            </Card>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card>
      <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: accent ? `${colors.accent}33` : `${colors.muted}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={14} color={accent ? colors.accent : colors.muted} />
      </View>
      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: accent ? colors.accent : colors.ink }}>{value}</Text>
    </Card>
  );
}
