import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = ScrollViewProps & {
  scroll?: boolean;
};

export function Screen({ children, style, scroll = true, ...rest }: Props) {
  const { colors } = useTheme();

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.base, padding: 20 }, style]}>{children}</View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={[{ padding: 20, paddingBottom: 40 }, style]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
