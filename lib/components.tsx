import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import type { ThemeColors } from './theme';

const RING_SIZE = 56;
const STROKE_WIDTH = 5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface MacroRingProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color: string;
  colors: ThemeColors;
}

export function MacroRing({ label, value, target, unit, color, colors }: MacroRingProps) {
  const progress = Math.min(value / target, 1.5);
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(progress, 1));

  const isOver = value > target * 1.1;
  const isUnder = value < target * 0.9;
  const displayColor = isOver ? colors.error : isUnder ? colors.warning : color;

  const displayLabel = unit ? `${label} ${unit}` : label;

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ width: RING_SIZE, height: RING_SIZE, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={colors.border}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={displayColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <Text style={{ position: 'absolute', fontSize: 12, fontWeight: '700', color: colors.text }}>{Math.round(value)}</Text>
      </View>
      <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>{displayLabel}</Text>
    </View>
  );
}

interface MacroRingsRowProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  colors: ThemeColors;
}

export function MacroRingsRow({
  calories,
  protein,
  carbs,
  fat,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  colors,
}: MacroRingsRowProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' }}>
      <MacroRing label="Kcal" value={calories} target={targetCalories} color={colors.text} colors={colors} />
      <MacroRing label="Protein" value={protein} target={targetProtein} unit="g" color={colors.protein} colors={colors} />
      <MacroRing label="Carbs" value={carbs} target={targetCarbs} unit="g" color={colors.carbs} colors={colors} />
      <MacroRing label="Fett" value={fat} target={targetFat} unit="g" color={colors.fat} colors={colors} />
    </View>
  );
}