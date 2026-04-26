import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColors, SPACING, RADII, SHADOWS } from '../../lib/theme';
import { tap } from '../../lib/haptics';
import { RECIPES } from '../../data/recipes';
import type { Recipe, Ingredient } from '../../lib/types';

function ingredientLine(ing: Ingredient): string {
  const unitMap: Record<string, string> = {
    'g': 'g', 'kg': 'kg', 'ml': 'ml', 'l': 'l',
    'stück': '', 'el': 'EL', 'tl': 'TL', 'prise': 'Prise',
    'bund': 'Bund', 'dose': 'Dose', 'packung': 'Packung',
  };
  const unitStr = unitMap[ing.unit] ?? ing.unit;
  const sep = unitStr ? ' ' : '';
  return `${ing.amount}${sep}${unitStr}`;
}

function macroBadge(label: string, value: number, unit: string, color: string) {
  const COLORS = useThemeColors();
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: COLORS.card, 
      borderRadius: RADII.lg, 
      paddingVertical: SPACING.lg, 
      alignItems: 'center',
      ...SHADOWS.soft,
      shadowColor: color,
      shadowOpacity: 0.1
    }}>
      <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color }}>{Math.round(value)}</Text>
      {unit && <Text style={{ fontSize: 9, fontWeight: '600', color: COLORS.muted }}>{unit}</Text>}
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const COLORS = useThemeColors();
  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>🔍</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm }}>Nicht gefunden</Text>
        <Pressable 
          onPress={() => { tap(); router.back(); }} 
          style={({ pressed }) => ({ 
            backgroundColor: COLORS.primary, 
            borderRadius: RADII.xl, 
            paddingHorizontal: 48, 
            paddingVertical: SPACING.lg,
            opacity: pressed ? 0.9 : 1
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFF' }}>Zurück</Text>
        </Pressable>
      </View>
    );
  }

  return <RecipeDetail recipe={recipe} />;
}

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const COLORS = useThemeColors();
  const dietLabel: Record<string, string> = { omnivore: '🥩 Alles', vegetarian: '🥗 Veggie', vegan: '🌱 Vegan' };
  const diffLabel: Record<string, string> = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwierig' };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
      <View style={{ marginBottom: SPACING.xl }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, lineHeight: 34 }}>{recipe.titleDe}</Text>
        <Text style={{ fontSize: 15, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 24, fontStyle: 'italic' }}>{recipe.description}</Text>

        <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.md }}>
          {[
            dietLabel[recipe.diet],
            `⏱ ${recipe.totalTime} Min`,
            diffLabel[recipe.difficulty],
            `🍽 ${recipe.servings} Port.`
          ].map((label, i) => (
            <View key={i} style={{ backgroundColor: COLORS.primaryLight, borderRadius: RADII.md, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xxl }}>
        {macroBadge('Kcal', recipe.macros.calories, '', COLORS.text)}
        {macroBadge('Protein', recipe.macros.protein, 'g', COLORS.protein)}
        {macroBadge('Carbs', recipe.macros.carbs, 'g', COLORS.carbs)}
        {macroBadge('Fett', recipe.macros.fat, 'g', COLORS.fat)}
      </View>

      <View style={{ marginBottom: SPACING.xxl }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.muted, marginBottom: SPACING.md, letterSpacing: 1.5, textTransform: 'uppercase' }}>ZUTATEN</Text>
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.xl, padding: SPACING.lg, ...SHADOWS.soft }}>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              paddingVertical: SPACING.md, 
              borderBottomColor: COLORS.bg, 
              borderBottomWidth: i < recipe.ingredients.length - 1 ? 1 : 0 
            }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 }}>{ing.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.textSecondary }}>{ingredientLine(ing)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: SPACING.xxl }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.muted, marginBottom: SPACING.md, letterSpacing: 1.5, textTransform: 'uppercase' }}>ZUBEREITUNG</Text>
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.xl, padding: SPACING.xl, ...SHADOWS.soft }}>
          {recipe.instructions.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.xl }}>
              <View style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 16, 
                backgroundColor: COLORS.primary, 
                alignItems: 'center', 
                justifyContent: 'center',
                ...SHADOWS.soft,
                shadowColor: COLORS.primary,
                shadowOpacity: 0.2
              }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>{i + 1}</Text>
              </View>
              <Text style={{ fontSize: 15, color: COLORS.text, flex: 1, lineHeight: 26, fontWeight: '500' }}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.md }}>
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.lg, padding: SPACING.lg, flex: 1, ...SHADOWS.soft, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>PREP</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text }}>{recipe.prepTime}<Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.muted }}>m</Text></Text>
        </View>
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.lg, padding: SPACING.lg, flex: 1, ...SHADOWS.soft, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>KOCHEN</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text }}>{recipe.cookTime}<Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.muted }}>m</Text></Text>
        </View>
        <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.lg, padding: SPACING.lg, flex: 1, ...SHADOWS.soft, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>TOTAL</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text }}>{recipe.totalTime}<Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.muted }}>m</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}
