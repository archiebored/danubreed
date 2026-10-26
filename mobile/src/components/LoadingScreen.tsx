import { ActivityIndicator, Image, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

// Shown while the saved session is being restored, so the app never flashes the wrong screen.
export function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Image source={require('../../assets/wordmark.png')} style={{ width: 150, height: 88 }} resizeMode="contain" />
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
