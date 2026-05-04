import { useColorScheme } from 'react-native';

export const ACCOUNT_COLORS = [
  '#6C63FF', // violet
  '#FF6584', // pink
  '#43C6AC', // teal
  '#F7971E', // orange
  '#4facfe', // blue
  '#a8edea', // mint
  '#fd746c', // coral
  '#a18cd1', // purple
];

export function getNextAccountColor(existingColors: string[]): string {
  const unused = ACCOUNT_COLORS.find((c) => !existingColors.includes(c));
  return unused ?? ACCOUNT_COLORS[existingColors.length % ACCOUNT_COLORS.length];
}

const light = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F0F5',
  border: '#E4E4EE',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  primary: '#6C63FF',
  error: '#EF4444',
  success: '#10B981',
  unread: '#EEF2FF',
  skeleton: '#E5E7EB',
  skeletonShimmer: '#F3F4F6',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E4E4EE',
  headerBackground: '#FFFFFF',
  icon: '#6B7280',
  iconActive: '#6C63FF',
};

const dark = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceVariant: '#22223B',
  border: '#2D2D45',
  text: '#F0F0FF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  primary: '#7C73FF',
  error: '#F87171',
  success: '#34D399',
  unread: '#1E1E3A',
  skeleton: '#22223B',
  skeletonShimmer: '#2D2D45',
  tabBar: '#1A1A2E',
  tabBarBorder: '#2D2D45',
  headerBackground: '#1A1A2E',
  icon: '#9CA3AF',
  iconActive: '#7C73FF',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
};
