import { Check, Info, Layers, Sparkles, Trash2, Calendar, PlusCircle, Plus, MapPin } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTripStore } from '../state/Store';
import { colors } from '../theme';
import type { ToastTone } from '../types';

const TONE_BG: Record<ToastTone, string> = {
  success: '#10B981',
  info: '#4F46E5',
  danger: '#F43F5E',
  neutral: '#334155',
};

export function ToastBanner() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useTripStore();
  const toast = state.lastToast;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    translateY.setValue(-24);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    const hide = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -24, duration: 220, useNativeDriver: true }),
      ]).start(() => dispatch({ type: 'clearToast' }));
    }, 2600);
    return () => clearTimeout(hide);
  }, [toast, dispatch, opacity, translateY]);

  if (!toast) return null;

  const Icon = iconForToast(toast.title);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { top: insets.top + 8, opacity, transform: [{ translateY }] },
      ]}>
      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: TONE_BG[toast.tone] }]}>
          <Icon color="#FFFFFF" size={16} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>
            {toast.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {toast.subtitle}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function iconForToast(title: string) {
  if (title.startsWith('Copied') || title.startsWith('Remixed') || title.includes('Published')) {
    return title.includes('Published') ? MapPin : title.startsWith('Remixed') ? Layers : Sparkles;
  }
  if (title.startsWith('Already')) return Info;
  if (title.startsWith('Removed')) return Trash2;
  if (title.startsWith('Moved')) return Calendar;
  if (title.startsWith('Add-on') || title.startsWith('Custom')) return title.startsWith('Custom') ? Plus : PlusCircle;
  if (title.startsWith('All Stops')) return Check;
  return Check;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  card: {
    backgroundColor: colors.glassDark,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 1,
  },
});
