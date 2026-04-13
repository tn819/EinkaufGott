import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from './theme';

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
}

export function MacroRing({ label, value, target, unit, color }: MacroRingProps) {
  const progress = Math.min(value / target, 1.5);
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(progress, 1));

  const isOver = value > target * 1.1;
  const isUnder = value < target * 0.9;
  const displayColor = isOver ? COLORS.error : isUnder ? COLORS.warning : color;

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={COLORS.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={displayColor}
            strokeWidth={STROKE_WIDTH + 1}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.text }}>{Math.round(value)}</Text>
      </View>
      <Text style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>{label}</Text>
      {unit && <Text style={{ fontSize: 9, color: COLORS.muted }}>{unit}</Text>}
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
}: MacroRingsRowProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
      <MacroRing label="Kcal" value={calories} target={targetCalories} color={COLORS.text} />
      <MacroRing label="Protein" value={protein} target={targetProtein} unit="g" color={COLORS.protein} />
      <MacroRing label="Carbs" value={carbs} target={targetCarbs} unit="g" color={COLORS.carbs} />
      <MacroRing label="Fett" value={fat} target={targetFat} unit="g" color={COLORS.fat} />
    </View>
  );
}