export const palette = {
  accent: '#FF7A1F',
  accentDark: '#C2590A',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#241E19',
  baseLight: '#FAF6F1',
  baseDark: '#19140F',
  inkLight: '#241A10',
  inkDark: '#F8F2EA',
  mutedLight: '#7A6E62',
  mutedDark: '#B3A395',
  borderLight: 'rgba(36,26,16,0.1)',
  borderDark: 'rgba(255,255,255,0.12)',
  danger: '#F87171',
  success: '#4ADE80',
};

export type ThemeColors = {
  mode: 'light' | 'dark';
  accent: string;
  accentText: string;
  base: string;
  surface: string;
  ink: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
};

export function colorsFor(mode: 'light' | 'dark'): ThemeColors {
  const isDark = mode === 'dark';
  return {
    mode,
    accent: palette.accent,
    accentText: '#1a0a00',
    base: isDark ? palette.baseDark : palette.baseLight,
    surface: isDark ? palette.surfaceDark : palette.surfaceLight,
    ink: isDark ? palette.inkDark : palette.inkLight,
    muted: isDark ? palette.mutedDark : palette.mutedLight,
    border: isDark ? palette.borderDark : palette.borderLight,
    danger: palette.danger,
    success: palette.success,
  };
}
