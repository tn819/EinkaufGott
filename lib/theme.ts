import { useColorScheme } from 'react-native';

/**
 * Premium Organic Palette (EinkaufGott V2)
 * A high-end, mindful system using earthy tones and diffuse depth.
 */

export const LIGHT_COLORS = {
  bg: '#FCFBF7',           // Bone: Warm organic background
  card: '#FFFFFF',         // Pure White: Elevated surfaces
  text: '#1A1C18',         // Deep Olive-Black: High contrast
  textSecondary: '#43493E', // Muted Moss: Subtext
  muted: '#8E9286',        // Dusty Leaf: Disabled/Muted
  border: '#E2E3D8',       // Soft Linen: Low-impact dividers
  primary: '#3E5A30',      // Sage: Primary action color
  primaryLight: '#F1F4EE', // Pale Herb: Highlight backgrounds
  secondary: '#D4A373',    // Tan: Warm secondary accent
  protein: '#BC4749',      // Terra: Earthy protein red
  carbs: '#A3B18A',        // Herb: Muted carb green
  fat: '#606C38',          // Olive: Deep healthy fat green
  success: '#3E5A30',
  warning: '#D4A373',
  error: '#BC4749',
} as const;

export const DARK_COLORS = {
  bg: '#0F110A',           // Deep Moss: Organic dark mode
  card: '#1A1D12',         // Elevated Forest: Dark surfaces
  text: '#E1E3DB',         // Linen White: Soft readable text
  textSecondary: '#C5C8BA', // Muted Sage: Secondary text
  muted: '#43493E',        // Deep Herb: Muted dark elements
  border: '#2A2E24',       // Dark Soil: Subtle dark dividers
  primary: '#81A670',      // Soft Lime: High visibility dark primary
  primaryLight: '#252B1E', // Forest Tint: Dark primary backgrounds
  secondary: '#E9C46A',    // Sand: Warm dark accent
  protein: '#E56B6F',      // Soft Terra
  carbs: '#CCD5AE',        // Pale Herb
  fat: '#DDA15E',          // Earthy Gold
  success: '#81A670',
  warning: '#E9C46A',
  error: '#E56B6F',
} as const;

export type ThemeColors = Record<keyof typeof LIGHT_COLORS, string>;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

// Fallback for static contexts if needed, but useThemeColors() is preferred
export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Depth & Shadow System
 * Replacing 1px borders with diffuse, colored shadows.
 */
export const SHADOWS = {
  soft: {
    shadowColor: '#3E5A30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1A1C18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
} as const;
