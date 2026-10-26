import { View, Image } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { ThemeContext } from '@/context/ThemeContext';
import { colorsFor } from '@/theme/colors';

const colors = colorsFor('dark');
const forcedDarkTheme = { theme: 'dark' as const, colors, toggleTheme: () => {} };

export default function Welcome() {
  const router = useRouter();
  return (
    <ThemeContext.Provider value={forcedDarkTheme}>
      <LinearGradient colors={['#0A0A0A', '#1a0800']} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 220, height: 220, borderRadius: 28, marginBottom: 28 }}
            resizeMode="cover"
          />
          <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19, marginBottom: 36 }}>
            Bible study, worship, real talk, and a place to belong — built for teens 13 to 19 at Calvary Bible
            Church.
          </Text>
          <View style={{ width: '100%', maxWidth: 320, gap: 12 }}>
            <Button label="Log in" onPress={() => router.push('/(auth)/login')} fullWidth />
            <Button label="Sign up" variant="secondary" onPress={() => router.push('/(auth)/signup')} fullWidth />
          </View>
        </View>
      </LinearGradient>
    </ThemeContext.Provider>
  );
}
