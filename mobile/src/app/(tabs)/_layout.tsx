import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar, MessageCircleHeart, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { member, loading } = useMemberAuth();
  const insets = useSafeAreaInsets();

  if (loading) return <LoadingScreen />;

  if (!member) return <Redirect href="/(auth)/welcome" />;

  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 56 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: 'Events', tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="connect"
        options={{ title: 'Connect', tabBarIcon: ({ color, size }) => <MessageCircleHeart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
