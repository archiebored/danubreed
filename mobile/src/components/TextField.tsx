import { TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function TextField({ style, ...rest }: TextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.base,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          fontFamily: 'PlusJakartaSans_400Regular',
          color: colors.ink,
        },
        style,
      ]}
      {...rest}
    />
  );
}
