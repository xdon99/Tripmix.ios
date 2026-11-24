import { Circle, G, Path, Polyline, Rect, Svg } from 'react-native-svg';

type Props = {
  width?: number | string;
  height?: number | string;
  viewBox: string;
  routePoints?: string;
};

export function StylizedMapBackground({ width = '100%', height = '100%', viewBox, routePoints }: Props) {
  const isShare = viewBox.endsWith('160');

  return (
    <Svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="none">
      <Rect width="100%" height="100%" fill="#EDF2F7" />
      {isShare ? (
        <>
          <Path d="M 20 15 Q 110 10 130 60 Q 70 85 15 65 Z" fill="#D1FAE5" />
          <Path d="M -10 130 Q 150 105 260 135 T 410 100 L 410 165 L -10 165 Z" fill="#BAE6FD" />
          <G stroke="#FFFFFF" strokeWidth={3.5} fill="none">
            <Path d="M 0 45 L 400 70" />
            <Path d="M 0 95 L 400 85" />
            <Path d="M 115 0 L 135 160" />
            <Path d="M 265 0 L 245 160" />
          </G>
        </>
      ) : (
        <>
          <Path d="M 30 20 Q 110 15 125 75 Q 80 105 25 85 Z" fill="#D1FAE5" opacity={0.85} />
          <Circle cx={315} cy={175} r={42} fill="#D1FAE5" opacity={0.8} />
          <Path d="M -10 185 Q 110 150 210 190 T 410 140 L 410 250 L -10 250 Z" fill="#BAE6FD" opacity={0.75} />
          <G stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.9}>
            <Path d="M 0 60 L 400 95" />
            <Path d="M 0 130 L 400 110" />
            <Path d="M 95 0 L 125 240" />
            <Path d="M 225 0 L 205 240" />
            <Path d="M 310 0 L 335 240" />
          </G>
          {routePoints ? (
            <Polyline
              points={routePoints}
              fill="none"
              stroke="#6366F1"
              strokeWidth={2.5}
              strokeDasharray="5,5"
              opacity={0.75}
            />
          ) : null}
        </>
      )}
    </Svg>
  );
}
