import { View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/context/ThemeContext';

export function ScreenHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      {eyebrow && (
        <Text
          style={{
            color: colors.accent,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </Text>
      )}
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 40, letterSpacing: 0.5, color: colors.ink }}>
        {title}
      </Text>
    </View>
  );
}
