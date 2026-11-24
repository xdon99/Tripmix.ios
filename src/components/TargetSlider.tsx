import { useRef } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { BUDGET_TARGET_MAX, BUDGET_TARGET_MIN, BUDGET_TARGET_STEP } from '../types';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function TargetSlider({ value, onChange }: Props) {
  const widthRef = useRef(1);

  const valueFromX = (x: number) => {
    const ratio = Math.max(0, Math.min(1, x / widthRef.current));
    const raw = BUDGET_TARGET_MIN + ratio * (BUDGET_TARGET_MAX - BUDGET_TARGET_MIN);
    return Math.round(raw / BUDGET_TARGET_STEP) * BUDGET_TARGET_STEP;
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => onChange(valueFromX(evt.nativeEvent.locationX)),
      onPanResponderMove: (evt) => onChange(valueFromX(evt.nativeEvent.locationX)),
    }),
  ).current;

  const onLayout = (event: LayoutChangeEvent) => {
    widthRef.current = Math.max(1, event.nativeEvent.layout.width);
  };

  const ratio = (value - BUDGET_TARGET_MIN) / (BUDGET_TARGET_MAX - BUDGET_TARGET_MIN);

  return (
    <View style={styles.hit} onLayout={onLayout} {...pan.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Adjust Target">
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
      </View>
      <View style={[styles.thumb, { left: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.indigo100,
  },
  thumb: {
    position: 'absolute',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.indigo,
    shadowColor: colors.indigo,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
