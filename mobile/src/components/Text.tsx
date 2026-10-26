import { Text as RNText, type TextProps } from 'react-native';

// The app's default body font. Screens that need the display font set
// fontFamily: 'BebasNeue_400Regular' explicitly in their own style, which
// wins over this default since it's applied second in the array.
export function Text({ style, ...rest }: TextProps) {
  return <RNText style={[{ fontFamily: 'PlusJakartaSans_400Regular' }, style]} {...rest} />;
}
