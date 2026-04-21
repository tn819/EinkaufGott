import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { generateMealPlan } from '../../lib/meals/generator';
import { MacroRingsRow } from '../../lib/components';
import { useThemeColors, SPACING, type ThemeColors } from '../../lib/theme';
import { tap, success, select } from '../../lib/haptics';
import type { DayPlan, MealSlot, MacroTarget } from '../../lib/types';

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAY_FULL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snack',
};
const DIET_EMOJI: Record<string, string> = { omnivore: '🥩', vegetarian: '🥗', vegan: '🌱' };

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function macroColor(actual: number, target: number, colors: ThemeColors): string {
  if (target === 0) return colors.muted;
  const pct = Math.abs(actual - target) / target;
  if (pct <= 0.10) return colors.success;
  if (pct <= 0.25) return colors.warning;
  return colors.error;
}

function MealRow({ slot, onPress }: { slot: MealSlot; onPress: () => void }) {
  const COLORS = useThemeColors();
  const cookTimeColor = slot.recipe.totalTime <= 15 ? COLORS.success : slot.recipe.totalTime <= 30 ? COLORS.warning : COLORS.error;

  return (
    <Pressable onPress={() => { tap(); onPress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
      <View style={{ width: 56 }}>
        <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{MEAL_LABELS[slot.type] ?? slot.type}</Text>
        <Text style={{ fontSize: 11, color: cookTimeColor, fontWeight: '600' }}>⏱ {slot.recipe.totalTime}min</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.text }}>{slot.recipe.titleDe}</Text>
        <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
          {Math.round(slot.scaledMacros.calories)} kcal · P {Math.round(slot.scaledMacros.protein)}g · K {Math.round(slot.scaledMacros.carbs)}g · F {Math.round(slot.scaledMacros.fat)}g
        </Text>
      </View>
      <Text style={{ fontSize: 14 }}>{DIET_EMOJI[slot.recipe.diet] ?? ''}</Text>
    </Pressable>
  );
}

export default function PlanScreen() {
  const { currentPlan, macroTarget, setCurrentPlan } = useAppStore();
  const COLORS = useThemeColors();
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleGenerate = useCallback(() => {
    const plan = generateMealPlan(macroTarget);
    setCurrentPlan(plan);
    success();
  }, [macroTarget, setCurrentPlan]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    handleGenerate();
    setRefreshing(false);
  }, [handleGenerate]);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const headerRange = `${weekStart.getDate()}. – ${weekEnd.getDate()}. ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const weekDateStrings = weekDates.map(formatDate);

  if (!currentPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>📅</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm }}>Kein Wochenplan</Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 }}>
          Generiere einen Plan basierend auf deinen Makros.
        </Text>
        <Pressable onPress={handleGenerate} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Plan erstellen</Text>
        </Pressable>
      </View>
    );
  }

  const target = macroTarget;
  const dailyTarget = { calories: target.calories, protein: target.protein, carbs: target.carbs, fat: target.fat };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{headerRange}</Text>
        <Pressable onPress={handleGenerate} style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>🔄 Neu</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg }}>
        <Pressable onPress={() => setWeekOffset((w) => w - 1)} style={{ backgroundColor: COLORS.card, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 18, color: COLORS.text }}>‹</Text>
        </Pressable>
        <Pressable onPress={() => setWeekOffset(0)} style={{ backgroundColor: weekOffset === 0 ? COLORS.primary : COLORS.card, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: weekOffset === 0 ? COLORS.primary : COLORS.border }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: weekOffset === 0 ? '#FFF' : COLORS.text }}>Diese Woche</Text>
        </Pressable>
        <Pressable onPress={() => setWeekOffset((w) => w + 1)} style={{ backgroundColor: COLORS.card, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 18, color: COLORS.text }}>›</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: SPACING.sm, textAlign: 'center' }}>Ø pro Tag</Text>
        <MacroRingsRow
          calories={currentPlan.days.reduce((a, d) => a + d.totalMacros.calories, 0) / 7}
          protein={currentPlan.days.reduce((a, d) => a + d.totalMacros.protein, 0) / 7}
          carbs={currentPlan.days.reduce((a, d) => a + d.totalMacros.carbs, 0) / 7}
          fat={currentPlan.days.reduce((a, d) => a + d.totalMacros.fat, 0) / 7}
          targetCalories={macroTarget.calories}
          targetProtein={macroTarget.protein}
          targetCarbs={macroTarget.carbs}
          targetFat={macroTarget.fat}
          colors={COLORS}
        />
      </View>

      {weekDateStrings.map((dateStr, i) => {
        const day = currentPlan.days.find((d) => d.date === dateStr);
        if (!day) return null;

        const isExpanded = expandedDay === i;
        const calColor = macroColor(day.totalMacros.calories, dailyTarget.calories, COLORS);
        const proColor = macroColor(day.totalMacros.protein, dailyTarget.protein, COLORS);
        const carbColor = macroColor(day.totalMacros.carbs, dailyTarget.carbs, COLORS);
        const fatColor = macroColor(day.totalMacros.fat, dailyTarget.fat, COLORS);

        return (
          <Pressable
            key={day.date}
            onPress={() => { select(); setExpandedDay(isExpanded ? null : i); }}
            style={{ backgroundColor: COLORS.card, borderRadius: 12, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}
          >
            <View style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <View style={{ backgroundColor: COLORS.primary, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>{DAY_NAMES[i] ?? '?'}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{DAY_FULL[i] ?? ''}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{day.date}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: calColor }}>{Math.round(day.totalMacros.calories)} kcal</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
                    P{Math.round(day.totalMacros.protein)} · K{Math.round(day.totalMacros.carbs)} · F{Math.round(day.totalMacros.fat)}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{day.meals.length} Mahlzeiten</Text>
                <Text style={{ fontSize: 12, color: isExpanded ? COLORS.primary : COLORS.muted }}>{isExpanded ? '▲ schließen' : '▼ anzeigen'}</Text>
              </View>
            </View>

            {isExpanded && day.meals.length > 0 && (
              <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}>
                {day.meals.map((slot) => (
                  <MealRow
                    key={`${day.date}-${slot.type}`}
                    slot={slot}
                    onPress={() => router.push(`/recipe/${slot.recipe.id}`)}
                  />
                ))}
              </View>
            )}

            {isExpanded && day.meals.length === 0 && (
              <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, padding: SPACING.md }}>
                <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center' }}>Keine Mahlzeiten</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}