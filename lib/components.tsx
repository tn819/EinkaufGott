import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { type ThemeColors, RADII, SHADOWS, SPACING } from './theme';

const RING_SIZE = 64;
const STROKE_WIDTH = 4;
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
  const progress = Math.min(value / target, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const isOver = value > target * 1.1;
  const isUnder = value < target * 0.9;
  const displayColor = isOver ? colors.error : isUnder ? colors.warning : color;

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ 
        width: RING_SIZE, 
        height: RING_SIZE, 
        position: 'relative', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderRadius: RING_SIZE / 2,
        ...SHADOWS.soft,
        shadowColor: displayColor,
        shadowOpacity: 0.12
      }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={colors.bg}
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
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{Math.round(value)}</Text>
          {unit && <Text style={{ fontSize: 8, color: colors.muted, marginTop: -2 }}>{unit}</Text>}
        </View>
      </View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
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
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      alignItems: 'center',
      paddingVertical: SPACING.sm
    }}>
      <MacroRing label="Kcal" value={calories} target={targetCalories} color={colors.text} colors={colors} />
      <MacroRing label="P" value={protein} target={targetProtein} unit="g" color={colors.protein} colors={colors} />
      <MacroRing label="K" value={carbs} target={targetCarbs} unit="g" color={colors.carbs} colors={colors} />
      <MacroRing label="F" value={fat} target={targetFat} unit="g" color={colors.fat} colors={colors} />
    </View>
  );
}
