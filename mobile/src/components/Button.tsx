import { Pressable, ActivityIndicator, type PressableProps } from 'react-native';
import { Text } from '@/components/Text';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({ label, variant = 'primary', loading, fullWidth, disabled, style, onPress, ...rest }: Props) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const base = {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
    opacity: isDisabled ? 0.55 : 1,
    width: fullWidth ? '100%' as const : undefined,
  };

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: colors.accent }
      : variant === 'secondary'
        ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }
        : { backgroundColor: 'transparent' };

  const textColor = variant === 'primary' ? colors.accentText : colors.ink;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={(e) => {
        if (!isDisabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }
      }}
      style={({ pressed }) => [base, variantStyle, pressed && !isDisabled ? { transform: [{ scale: 0.97 }] } : null, style as object]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontWeight: '700', fontSize: 14 }}>{label}</Text>
      )}
    </Pressable>
  );
}
