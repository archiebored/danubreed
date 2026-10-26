import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function Card({ children, style, accentBar, ...rest }: ViewProps & { accentBar?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: 16,
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    >
      {accentBar && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: colors.accent,
          }}
        />
      )}
      {children}
    </View>
  );
}
