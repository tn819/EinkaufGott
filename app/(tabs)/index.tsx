import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { findAlternatives, swapMeal, generateMealPlan } from '../../lib/meals/generator';
import { MacroRingsRow } from '../../lib/components';
import { useThemeColors, SPACING, SHADOWS, RADII } from '../../lib/theme';
import { tap, success, select } from '../../lib/haptics';
import type { DayPlan, MealSlot, Recipe } from '../../lib/types';

const DAY_NAMES = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'FRÜHSTÜCK',
  lunch: 'MITTAG',
  dinner: 'ABEND',
  snack: 'SNACK',
};

function MacroPill({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ alignItems: 'flex-start', flex: 1 }}>
      <Text style={{ fontSize: 9, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '800', color }}>
        {Math.round(value)}
        <Text style={{ fontSize: 10, fontWeight: '500', color: COLORS.textSecondary }}> {unit}</Text>
      </Text>
    </View>
  );
}

function MealCard({ slot, onPress, onLongPress }: { slot: MealSlot; onPress: () => void; onLongPress: () => void }) {
  const COLORS = useThemeColors();
  const dietEmoji: Record<string, string> = { omnivore: '🥩', vegetarian: '🥗', vegan: '🌱' };
  const cookTimeColor = slot.recipe.totalTime <= 15 ? COLORS.success : slot.recipe.totalTime <= 30 ? COLORS.warning : COLORS.error;
  
  return (
    <Pressable 
      onPress={onPress} 
      onLongPress={onLongPress} 
      style={({ pressed }) => ({ 
        backgroundColor: COLORS.card, 
        borderRadius: RADII.xl, 
        padding: SPACING.lg, 
        marginBottom: SPACING.md, 
        ...SHADOWS.soft,
        transform: [{ scale: pressed ? 0.98 : 1 }], 
        opacity: pressed ? 0.9 : 1 
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
        <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: RADII.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 }}>{MEAL_LABELS[slot.type] ?? slot.type}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: cookTimeColor, fontWeight: '700' }}>⏱ {slot.recipe.totalTime}m</Text>
          <Text style={{ fontSize: 14 }}>{dietEmoji[slot.recipe.diet] ?? ''}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg, lineHeight: 22 }}>{slot.recipe.titleDe}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.bg, paddingTop: SPACING.md }}>
        <MacroPill label="Kcal" value={slot.scaledMacros.calories} unit="kcal" color={COLORS.text} />
        <MacroPill label="P" value={slot.scaledMacros.protein} unit="g" color={COLORS.protein} />
        <MacroPill label="K" value={slot.scaledMacros.carbs} unit="g" color={COLORS.carbs} />
        <MacroPill label="F" value={slot.scaledMacros.fat} unit="g" color={COLORS.fat} />
      </View>
    </Pressable>
  );
}

function DaySection({ day, index, onMealPress, onMealLongPress }: { day: DayPlan; index: number; onMealPress: (recipeId: string) => void; onMealLongPress: (dayIndex: number, mealIndex: number) => void }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ marginBottom: SPACING.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, paddingHorizontal: SPACING.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <View style={{ backgroundColor: COLORS.primary, borderRadius: RADII.md, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', ...SHADOWS.soft, shadowColor: COLORS.primary }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFF' }}>{DAY_NAMES[index] ?? '?'}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{day.date}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textSecondary }}>Tagesziel</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.text }}>{Math.round(day.totalMacros.calories)} <Text style={{ fontSize: 10, color: COLORS.muted }}>kcal</Text></Text>
          <Text style={{ fontSize: 11, color: COLORS.muted }}>P {Math.round(day.totalMacros.protein)} · K {Math.round(day.totalMacros.carbs)} · F {Math.round(day.totalMacros.fat)}</Text>
        </View>
      </View>
      {day.meals.length === 0 ? (
        <View style={{ padding: SPACING.xl, alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADII.xl, ...SHADOWS.soft }}>
          <Text style={{ fontSize: 14, color: COLORS.muted, fontStyle: 'italic' }}>Keine Mahlzeiten geplant</Text>
        </View>
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

function SwapModal({ recipe, alternatives, onSelect, onClose }: { recipe: Recipe; alternatives: Recipe[]; onSelect: (r: Recipe) => void; onClose: () => void }) {
  const COLORS = useThemeColors();
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text }}>Alternativen</Text>
          <Pressable onPress={onClose} style={{ padding: SPACING.sm }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primary }}>Fertig</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg }}>
            Ersetze <Text style={{ fontWeight: '800', color: COLORS.text }}>{recipe.titleDe}</Text> mit:
          </Text>
          {alternatives.map((alt) => (
            <Pressable
              key={alt.id}
              onPress={() => { tap(); onSelect(alt); }}
              style={({ pressed }) => ({ 
                backgroundColor: COLORS.card, 
                borderRadius: RADII.lg, 
                padding: SPACING.lg, 
                marginBottom: SPACING.md, 
                ...SHADOWS.soft,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }]
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 }}>{alt.titleDe}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>⏱ {alt.totalTime}m</Text>
              </View>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: SPACING.md }}>{Math.round(alt.macros.calories)} kcal · P {Math.round(alt.macros.protein)}g · K {Math.round(alt.macros.carbs)}g · F {Math.round(alt.macros.fat)}g</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
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

  if (!currentPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <View style={{ width: 120, height: 120, backgroundColor: COLORS.primaryLight, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, ...SHADOWS.soft, shadowColor: COLORS.primary }}>
          <Text style={{ fontSize: 48 }}>🍽️</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' }}>Dein Wochenplan</Text>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xxl, lineHeight: 24, paddingHorizontal: SPACING.xl }}>
          Wir erstellen dir einen personalisierten Plan basierend auf deinen Zielen.
        </Text>
        <Pressable 
          onPress={handleGenerate} 
          style={({ pressed }) => ({ 
            backgroundColor: COLORS.primary, 
            borderRadius: RADII.xl, 
            paddingVertical: SPACING.lg, 
            paddingHorizontal: 48, 
            ...SHADOWS.medium,
            shadowColor: COLORS.primary,
            transform: [{ scale: pressed ? 0.96 : 1 }], 
            opacity: pressed ? 0.9 : 1 
          })}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFF' }}>Plan generieren</Text>
        </Pressable>
      </View>
    );
  }

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
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.md }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.text }}>Wochenplan</Text>
            <Text style={{ fontSize: 14, color: COLORS.muted, fontWeight: '600' }}>Mindful Meal Prep</Text>
          </View>
          <Pressable 
            onPress={handleGenerate} 
            style={({ pressed }) => ({ 
              backgroundColor: COLORS.card, 
              borderRadius: RADII.md, 
              paddingHorizontal: SPACING.md, 
              paddingVertical: SPACING.sm, 
              ...SHADOWS.soft,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.primary }}>REFRESH</Text>
          </Pressable>
        </View>

        <View style={{ 
          backgroundColor: COLORS.card, 
          borderRadius: RADII.xl, 
          paddingVertical: SPACING.xl, 
          paddingHorizontal: SPACING.md, 
          marginBottom: SPACING.xxl, 
          ...SHADOWS.medium,
          shadowOpacity: 0.05
        }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.muted, marginBottom: SPACING.lg, textAlign: 'center', letterSpacing: 1 }}>DURCHSCHNITT / TAG</Text>
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
