import type { Category } from '../types';
import { colors } from '../theme';

export type CategoryStyle = {
  label: string;
  icon: 'bed-double' | 'utensils' | 'ticket';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pinBg: string;
  ring: string;
};

export function getCategoryStyle(category: Category): CategoryStyle {
  if (category === 'Hotel') {
    return {
      label: 'Hotel',
      icon: 'bed-double',
      badgeBg: colors.indigo100,
      badgeText: '#3730A3',
      badgeBorder: '#C7D2FE',
      pinBg: colors.indigo,
      ring: '#A5B4FC',
    };
  }
  if (category === 'Shop/Food') {
    return {
      label: 'Shop & Food',
      icon: 'utensils',
      badgeBg: colors.amber100,
      badgeText: colors.amber800,
      badgeBorder: '#FDE68A',
      pinBg: colors.amber500,
      ring: '#FCD34D',
    };
  }
  return {
    label: 'Activity',
    icon: 'ticket',
    badgeBg: colors.rose100,
    badgeText: '#BE123C',
    badgeBorder: '#FECDD3',
    pinBg: colors.rose,
    ring: '#FDA4AF',
  };
}

export function nextJourneyDay(day: number): number {
  return day === 1 ? 2 : 1;
}

export function clampPinCoord(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(12, Math.min(88, Math.round(x))),
    y: Math.max(22, Math.min(88, Math.round(y))),
  };
}

export function tabHref(tab: 'explore' | 'mapview' | 'journey' | 'share'): string {
  switch (tab) {
    case 'explore':
      return '/(tabs)';
    case 'mapview':
      return '/(tabs)/map';
    case 'journey':
      return '/(tabs)/journey';
    case 'share':
      return '/(tabs)/share';
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}
