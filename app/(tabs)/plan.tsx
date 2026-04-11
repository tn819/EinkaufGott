import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAppStore } from '../../lib/store';
import { generateMealPlan } from '../../lib/meals/generator';
import { COLORS, SPACING } from '../../lib/theme';
import type { DayPlan } from '../../lib/types';

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function PlanScreen() {
  const { currentPlan, macroTarget, setCurrentPlan } = useAppStore();

  const handleGenerate = () => {
    const plan = generateMealPlan(macroTarget);
    setCurrentPlan(plan);
  };

  if (!currentPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>📅</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm }}>Kein Wochenplan</Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl }}>
          Generiere einen Plan basierend auf deinen Makros.
        </Text>
        <Pressable onPress={handleGenerate} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Plan erstellen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text }}>Wochenplan</Text>
        <Pressable onPress={handleGenerate} style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>🔄 Neu</Text>
        </Pressable>
      </View>

      {currentPlan.days.map((day: DayPlan, i: number) => (
        <View key={day.date} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs }}>
            <View style={{ backgroundColor: COLORS.primary, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>{DAY_NAMES[i] ?? '?'}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{day.date}</Text>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {day.meals.length} Mahlzeiten · {Math.round(day.totalMacros.calories)} kcal
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}