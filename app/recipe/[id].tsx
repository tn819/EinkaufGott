import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAppStore } from '../../lib/store';
import { COLORS, SPACING } from '../../lib/theme';
import type { Recipe, Ingredient } from '../../lib/types';
import { RECIPES } from '../../data/recipes';

function ingredientLine(ing: Ingredient): string {
  const unitMap: Record<string, string> = {
    'g': 'g', 'kg': 'kg', 'ml': 'ml', 'l': 'l',
    'stück': '', 'el': 'EL', 'tl': 'TL', 'prise': 'Prise',
    'bund': 'Bund', 'dose': 'Dose', 'packung': 'Packung',
  };
  const unitStr = unitMap[ing.unit] ?? ing.unit;
  const sep = unitStr ? ' ' : '';
  return `${ing.amount}${sep}${unitStr} ${ing.name}`;
}

function macroBadge(label: string, value: number, unit: string, color: string) {
  return (
    <View style={{ flex: 1, backgroundColor: `${color}15`, borderRadius: 10, paddingVertical: SPACING.sm, alignItems: 'center' }}>
      <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color }}>{Math.round(value)}</Text>
      <Text style={{ fontSize: 10, color: COLORS.muted }}>{unit}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  return null;
}

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const dietLabel: Record<string, string> = { omnivore: '🥩 Alles', vegetarian: '🥗 Vegetarisch', vegan: '🌱 Vegan' };
  const diffLabel: Record<string, string> = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwierig' };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg }}>
      <View style={{ marginBottom: SPACING.lg }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs }}>{recipe.titleDe}</Text>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md }}>{recipe.description}</Text>

        <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.md }}>
          <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>{dietLabel[recipe.diet]}</Text>
          </View>
          <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>⏱ {recipe.totalTime} Min</Text>
          </View>
          <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>{diffLabel[recipe.difficulty]}</Text>
          </View>
          <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>🍽 {recipe.servings} Port.</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl }}>
        {macroBadge('Kcal', recipe.macros.calories, '', COLORS.text)}
        {macroBadge('Protein', recipe.macros.protein, 'g', COLORS.protein)}
        {macroBadge('Carbs', recipe.macros.carbs, 'g', COLORS.carbs)}
        {macroBadge('Fett', recipe.macros.fat, 'g', COLORS.fat)}
      </View>

      <View style={{ marginBottom: SPACING.lg }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm }}>Zutaten</Text>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border }}>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs, borderBottomColor: COLORS.border, borderBottomWidth: i < recipe.ingredients.length - 1 ? 1 : 0 }}>
              <Text style={{ fontSize: 14, color: COLORS.text }}>{ing.name}</Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{ingredientLine(ing)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: SPACING.xl }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm }}>Zubereitung</Text>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border }}>
          {recipe.instructions.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>{i + 1}</Text>
              </View>
              <Text style={{ fontSize: 14, color: COLORS.text, flex: 1, lineHeight: 20 }}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, flex: 1, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Vorbereitung</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>{recipe.prepTime} Min</Text>
        </View>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, flex: 1, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Kochen</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>{recipe.cookTime} Min</Text>
        </View>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, flex: 1, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Gesamt</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>{recipe.totalTime} Min</Text>
        </View>
      </View>
    </ScrollView>
  );
}