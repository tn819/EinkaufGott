import { useColorScheme } from 'react-native';

export const LIGHT_COLORS = {
  bg: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  muted: '#999999',
  border: '#E5E5E5',
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#FF6F00',
  protein: '#E53935',
  carbs: '#FFB300',
  fat: '#1E88E5',
  success: '#2E7D32',
  warning: '#FF6F00',
  error: '#D32F2F',
} as const;

export const DARK_COLORS = {
  bg: '#121212',
  card: '#1E1E1E',
  text: '#E8E8E8',
  textSecondary: '#AAAAAA',
  muted: '#666666',
  border: '#333333',
  primary: '#4CAF50',
  primaryLight: '#1B3A1D',
  secondary: '#FF9800',
  protein: '#EF5350',
  carbs: '#FFC107',
  fat: '#42A5F5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#EF5350',
} as const;

export type ThemeColors = Record<keyof typeof LIGHT_COLORS, string>;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;