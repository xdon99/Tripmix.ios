import { StyleSheet, Text, View } from 'react-native';

import { getCategoryStyle } from '../logic/categoryStyles';
import type { Category } from '../types';
import { categoryIcons } from './icons';

type Props = {
  category: Category;
  compact?: boolean;
};

export function CategoryBadge({ category, compact }: Props) {
  const style = getCategoryStyle(category);
  const Icon = categoryIcons[style.icon];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.badgeBg, borderColor: style.badgeBorder },
      ]}>
      {compact ? null : <Icon color={style.badgeText} size={10} />}
      <Text style={[styles.label, { color: style.badgeText }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
});
