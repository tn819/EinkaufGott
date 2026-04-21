import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { generateMealPlan, findAlternatives, swapMeal } from '../../lib/meals/generator';
import { MacroRingsRow } from '../../lib/components';
import { useThemeColors, SPACING } from '../../lib/theme';
import { tap, success, select } from '../../lib/haptics';
import type { DayPlan, MealSlot, Recipe } from '../../lib/types';

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snack',
};

function MacroPill({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color }}>{Math.round(value)}<Text style={{ fontSize: 10, fontWeight: '400', color: COLORS.textSecondary }}> {unit}</Text></Text>
    </View>
  );
}

function MealCard({ slot, onPress, onLongPress }: { slot: MealSlot; onPress: () => void; onLongPress: () => void }) {
  const COLORS = useThemeColors();
  const dietEmoji: Record<string, string> = { omnivore: '🥩', vegetarian: '🥗', vegan: '🌱' };
  const cookTimeColor = slot.recipe.totalTime <= 15 ? '#2E7D32' : slot.recipe.totalTime <= 30 ? '#FF6F00' : '#D32F2F';
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => ({ backgroundColor: pressed ? COLORS.primaryLight : COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.9 : 1 })}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
        <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>{MEAL_LABELS[slot.type] ?? slot.type}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 12, color: cookTimeColor, fontWeight: '600' }}>⏱ {slot.recipe.totalTime}min</Text>
          <Text style={{ fontSize: 14 }}>{dietEmoji[slot.recipe.diet] ?? ''}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm }}>{slot.recipe.titleDe}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <MacroPill label="Kcal" value={slot.scaledMacros.calories} unit="kcal" color={COLORS.text} />
        <MacroPill label="P" value={slot.scaledMacros.protein} unit="g" color={COLORS.protein} />
        <MacroPill label="K" value={slot.scaledMacros.carbs} unit="g" color={COLORS.carbs} />
        <MacroPill label="F" value={slot.scaledMacros.fat} unit="g" color={COLORS.fat} />
      </View>
    </Pressable>
  );
}

function SwapModal({ recipe, alternatives, onSelect, onClose }: { recipe: Recipe; alternatives: Recipe[]; onSelect: (r: Recipe) => void; onClose: () => void }) {
  const COLORS = useThemeColors();
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.bg, paddingTop: 60 }}>
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>Tauschen</Text>
            <Pressable onPress={onClose} style={{ backgroundColor: COLORS.border, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
              <Text style={{ fontSize: 14, color: COLORS.text }}>Schließen</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.md }}>
            Ersetze <Text style={{ fontWeight: '600', color: COLORS.text }}>{recipe.titleDe}</Text> mit einer Alternative:
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
          {alternatives.map((alt) => {
            const dietEmoji: Record<string, string> = { omnivore: '🥩', vegetarian: '🥗', vegan: '🌱' };
            return (
              <Pressable
                key={alt.id}
                onPress={() => { tap(); onSelect(alt); }}
                style={({ pressed }) => ({ backgroundColor: pressed ? COLORS.primaryLight : COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.9 : 1 })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{alt.titleDe}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{MEAL_LABELS[alt.mealType[0]] ?? alt.mealType[0]} · ⏱ {alt.totalTime}min</Text>
                  </View>
                  <Text style={{ fontSize: 14 }}>{dietEmoji[alt.diet] ?? ''}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
                  <Text style={{ fontSize: 12, color: COLORS.text }}>{Math.round(alt.macros.calories)} kcal</Text>
                  <Text style={{ fontSize: 12, color: COLORS.protein }}>P {Math.round(alt.macros.protein)}g</Text>
                  <Text style={{ fontSize: 12, color: COLORS.carbs }}>K {Math.round(alt.macros.carbs)}g</Text>
                  <Text style={{ fontSize: 12, color: COLORS.fat }}>F {Math.round(alt.macros.fat)}g</Text>
                </View>
              </Pressable>
            );
          })}
          {alternatives.length === 0 && (
            <Text style={{ fontSize: 14, color: COLORS.muted, textAlign: 'center', padding: SPACING.xl }}>
              Keine Alternativen gefunden für diese Makros und Vorgaben.
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function DaySection({ day, index, onMealPress, onMealLongPress }: { day: DayPlan; index: number; onMealPress: (recipeId: string) => void; onMealLongPress: (dayIndex: number, mealIndex: number) => void }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ marginBottom: SPACING.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm, paddingHorizontal: SPACING.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <View style={{ backgroundColor: COLORS.primary, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>{DAY_NAMES[index] ?? '?'}</Text>
          </View>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{day.date}</Text>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
          {Math.round(day.totalMacros.calories)} kcal · P{Math.round(day.totalMacros.protein)} · K{Math.round(day.totalMacros.carbs)} · F{Math.round(day.totalMacros.fat)}
        </Text>
      </View>
      {day.meals.length === 0 ? (
        <Text style={{ fontSize: 14, color: COLORS.muted, textAlign: 'center', padding: SPACING.lg }}>Keine Mahlzeiten</Text>
      ) : (
        day.meals.map((slot, mi) => (
          <MealCard
            key={`${day.date}-${slot.type}`}
            slot={slot}
            onPress={() => onMealPress(slot.recipe.id)}
            onLongPress={() => onMealLongPress(index, mi)}
          />
        ))
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { currentPlan, macroTarget, setCurrentPlan } = useAppStore();
  const COLORS = useThemeColors();
  const router = useRouter();
  const [swapInfo, setSwapInfo] = useState<{ dayIndex: number; mealIndex: number } | null>(null);

  const handleGenerate = () => {
    const plan = generateMealPlan(macroTarget);
    setCurrentPlan(plan);
    success();
  };

  const handleMealPress = (recipeId: string) => {
    tap();
    router.push(`/recipe/${recipeId}`);
  };

  const handleLongPress = (dayIndex: number, mealIndex: number) => {
    select();
    setSwapInfo({ dayIndex, mealIndex });
  };

  if (!currentPlan || !swapInfo) {
    const showSwapModal = false;
    if (!currentPlan) {
      return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
          <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>🍽️</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm }}>Kein Plan vorhanden</Text>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 }}>
            Stelle deine Makros ein und generiere deinen Wochenplan.
          </Text>
          <Pressable onPress={handleGenerate} style={({ pressed }) => ({ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, transform: [{ scale: pressed ? 0.97 : 1 }], opacity: pressed ? 0.9 : 1 })}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Plan erstellen</Text>
          </Pressable>
        </View>
      );
    }
  }

  if (!currentPlan) return null;

  const weekTotals = currentPlan.days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.totalMacros.calories,
      protein: acc.protein + d.totalMacros.protein,
      carbs: acc.carbs + d.totalMacros.carbs,
      fat: acc.fat + d.totalMacros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const avgCal = Math.round(weekTotals.calories / 7);
  const avgP = Math.round(weekTotals.protein / 7);
  const avgC = Math.round(weekTotals.carbs / 7);
  const avgF = Math.round(weekTotals.fat / 7);

  const swapModalData = swapInfo ? (() => {
    const meal = currentPlan.days[swapInfo.dayIndex]?.meals[swapInfo.mealIndex];
    if (!meal) return null;
    const alternatives = findAlternatives(
      currentPlan.days[swapInfo.dayIndex],
      swapInfo.mealIndex,
      macroTarget,
    );
    return { recipe: meal.recipe, alternatives };
  })() : null;

  const handleSwap = (newRecipe: Recipe) => {
    if (!swapInfo || !currentPlan) return;
    const newPlan = swapMeal(currentPlan, swapInfo.dayIndex, swapInfo.mealIndex, newRecipe);
    setCurrentPlan(newPlan);
    setSwapInfo(null);
    success();
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
        <View style={{ marginBottom: SPACING.lg }}>
          <Pressable onPress={handleGenerate} style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignSelf: 'flex-end' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>🔄 Neu</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: SPACING.sm, textAlign: 'center' }}>Ø pro Tag</Text>
          <MacroRingsRow
            calories={avgCal}
            protein={avgP}
            carbs={avgC}
            fat={avgF}
            targetCalories={macroTarget.calories}
            targetProtein={macroTarget.protein}
            targetCarbs={macroTarget.carbs}
            targetFat={macroTarget.fat}
            colors={COLORS}
          />
        </View>

        {currentPlan.days.map((day, i) => (
          <DaySection key={day.date} day={day} index={i} onMealPress={handleMealPress} onMealLongPress={handleLongPress} />
        ))}
      </ScrollView>

      {swapModalData && (
        <SwapModal
          recipe={swapModalData.recipe}
          alternatives={swapModalData.alternatives}
          onSelect={handleSwap}
          onClose={() => setSwapInfo(null)}
        />
      )}
    </>
  );
}