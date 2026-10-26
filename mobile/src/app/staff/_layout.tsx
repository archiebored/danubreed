import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Stack, Redirect, useSegments, useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import { colorsFor } from '@/theme/colors';

// Staff area is always dark, regardless of the visitor-facing light/dark toggle —
// forced here by overriding ThemeContext for this whole subtree, so shared
// components (Button, Card, TextField) pick up dark colors automatically.
const colors = colorsFor('dark');
const forcedDarkTheme = { theme: 'dark' as const, colors, toggleTheme: () => {} };

export default function StaffLayout() {
  const { staff, loading, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const onLoginScreen = segments[segments.length - 1] === 'login';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  if (!staff && !onLoginScreen) return <Redirect href="/staff/login" />;
  if (staff && onLoginScreen) return <Redirect href="/staff/dashboard" />;

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  return (
    <ThemeContext.Provider value={forcedDarkTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.accent,
          headerTitleStyle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.base },
          headerRight: staff
            ? () => (
                <Pressable onPress={handleSignOut} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <LogOut size={14} color={colors.muted} />
                </Pressable>
              )
            : undefined,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="members" options={{ title: 'Members' }} />
        <Stack.Screen name="events" options={{ title: 'Events' }} />
        <Stack.Screen name="confessions" options={{ title: 'Confessions' }} />
        <Stack.Screen name="roles" options={{ title: 'Roles' }} />
        <Stack.Screen name="coordinators" options={{ title: 'Coordinators' }} />
        <Stack.Screen name="blog" options={{ title: 'Blog' }} />
        <Stack.Screen name="visit-info" options={{ title: 'Visit Us info' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      </Stack>
    </ThemeContext.Provider>
  );
}
