// src/components/ScanFrame.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

const CORNER = 28; // corner length
const STROKE = 3.5;
const RADIUS = 10;

interface Props {
  size: number;
  color?: string;
}

export default function ScanFrame({ size, color = '#00F5A0' }: Props) {
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const S = size;
  const C = CORNER;
  const R = RADIUS;
  const ST = STROKE;

  // Corner paths (each corner is an L-shape with rounded inner corner)
  const corners = [
    // Top-left
    `M ${ST / 2} ${C + R} L ${ST / 2} ${R} Q ${ST / 2} ${ST / 2} ${R} ${ST / 2} L ${C + R} ${ST / 2}`,
    // Top-right
    `M ${S - C - R} ${ST / 2} L ${S - R} ${ST / 2} Q ${S - ST / 2} ${ST / 2} ${S - ST / 2} ${R} L ${S - ST / 2} ${C + R}`,
    // Bottom-left
    `M ${ST / 2} ${S - C - R} L ${ST / 2} ${S - R} Q ${ST / 2} ${S - ST / 2} ${R} ${S - ST / 2} L ${C + R} ${S - ST / 2}`,
    // Bottom-right
    `M ${S - C - R} ${S - ST / 2} L ${S - R} ${S - ST / 2} Q ${S - ST / 2} ${S - ST / 2} ${S - ST / 2} ${S - R} L ${S - ST / 2} ${S - C - R}`,
  ];

  return (
    <Animated.View style={{ opacity: pulseOpacity }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {corners.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={color}
              strokeWidth={ST}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
}
