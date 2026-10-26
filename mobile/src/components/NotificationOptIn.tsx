import { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { Text } from '@/components/Text';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Bell } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { supabase } from '@/lib/supabase';

type Status = 'idle' | 'subscribing' | 'subscribed' | 'denied' | 'unsupported' | 'error';

// Expo Go dropped remote push support in SDK 53+, and merely importing
// expo-notifications throws immediately on Android there — so this module is
// only ever require()'d when we know we're in a custom/standalone build.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const pushUnavailable = Platform.OS === 'web' || isExpoGo;

export function NotificationOptIn() {
  const { colors } = useTheme();
  const { member } = useMemberAuth();
  const [status, setStatus] = useState<Status>(() => (pushUnavailable ? 'unsupported' : 'idle'));

  useEffect(() => {
    if (pushUnavailable) return;
    import('expo-notifications').then((Notifications) => {
      Notifications.getPermissionsAsync().then(({ status: perm }) => {
        if (perm === 'granted') setStatus('subscribed');
        else if (perm === 'denied') setStatus('denied');
      });
    });
  }, []);

  if (status === 'unsupported' || status === 'subscribed') return null;

  async function subscribe() {
    if (pushUnavailable) return;
    setStatus('subscribing');
    try {
      const Notifications = await import('expo-notifications');
      const { status: perm } = await Notifications.requestPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: token } = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      const { error } = await supabase.from('expo_push_tokens').upsert({ token, member_id: member?.id ?? null });
      setStatus(error ? 'error' : 'subscribed');
    } catch (err) {
      console.error('Push subscribe failed:', err);
      setStatus('error');
    }
  }

  return (
    <Card style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: `${colors.accent}22`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={16} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>Turn on notifications</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {status === 'denied'
              ? 'Blocked — enable in your phone settings'
              : status === 'error'
                ? "Couldn't turn this on — tap to try again"
                : 'Camp updates and reminders, straight to your phone'}
          </Text>
        </View>
      </View>
      {status !== 'denied' && (
        <Button
          label={status === 'subscribing' ? '...' : status === 'error' ? 'Retry' : 'Enable'}
          onPress={subscribe}
          loading={status === 'subscribing'}
        />
      )}
    </Card>
  );
}
