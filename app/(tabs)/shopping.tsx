import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useAppStore } from '../../lib/store';
import { useThemeColors, SPACING, RADII, SHADOWS } from '../../lib/theme';
import { tap, success, impact } from '../../lib/haptics';
import { generateShoppingList, toggleChecked } from '../../lib/shopping';
import { ingredientToReweQuery } from '../../lib/rewe/products';
import { RECIPES } from '../../data/recipes';
import type { IngredientCategory, Ingredient } from '../../lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  fleisch: '🥩 FLEISCH & FISCH',
  fisch: '🐟 FISCH',
  milchprodukte: '🧀 MILCHPRODUKTE',
  gemüse: '🥬 GEMÜSE',
  obst: '🍎 OBST',
  getreide: '🌾 GETREIDE & NUDELN',
  hülsenfrüchte: '🫘 HÜLSENFRÜCHTE',
  nüsse: '🥜 NÜSSE & SAMEN',
  öle_fette: '🫒 ÖLE & FETTE',
  gewürze: '🧂 GEWÜRZE',
  säuwarenten: '🫙 SAUCEN',
  getränke: '🥤 GETRÄNKE',
  tiefkühl: '❄️ TIEFKÜHL',
  konserven: '🥫 KONSERVEN',
  sonstiges: '📦 SONSTIGES',
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'fleisch', 'fisch', 'milchprodukte', 'gemüse', 'obst',
  'getreide', 'hülsenfrüchte', 'nüsse', 'öle_fette', 'gewürze',
  'säuwarenten', 'getränke', 'tiefkühl', 'konserven', 'sonstiges',
];

const UNIT_LABELS: Record<string, string> = {
  'g': 'g', 'kg': 'kg', 'ml': 'ml', 'l': 'l',
  'stück': '', 'el': 'EL', 'tl': 'TL', 'prise': 'Prise',
  'bund': 'Bund', 'dose': 'Dose', 'packung': 'Packung',
};

function getReweQuery(ingredientName: string): string {
  const allIngredients = RECIPES.flatMap((r) => r.ingredients);
  const found = allIngredients.find((i) => i.name === ingredientName);
  if (found) return ingredientToReweQuery(found);
  return ingredientName;
}

export default function ShoppingScreen() {
  const { currentPlan, shoppingList, setShoppingList, pantry } = useAppStore();
  const COLORS = useThemeColors();

  useMemo(() => {
    if (!currentPlan) return;
    const allSlots = currentPlan.days.flatMap((d) => d.meals);
    const newItems = generateShoppingList(
      allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings })),
      pantry,
    );
    setShoppingList(newItems);
  }, [currentPlan, pantry]);

  const handleReweCart = () => {
    impact();
    const nonPantry = shoppingList.filter((i) => !i.inPantry);
    if (nonPantry.length === 0) return;
    const query = getReweQuery(nonPantry[0].ingredient);
    Linking.openURL(`https://shop.rewe.de/search?search=${encodeURIComponent(query)}`).catch(() => {
      Alert.alert('Fehler', 'REWE konnte nicht geöffnet werden.');
    });
  };

  if (!currentPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <View style={{ width: 120, height: 120, backgroundColor: COLORS.primaryLight, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, ...SHADOWS.soft, shadowColor: COLORS.primary }}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm }}>Einkaufsliste leer</Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>Erstelle einen Plan, um Artikel zu sehen.</Text>
      </View>
    );
  }

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = shoppingList.filter((i) => i.category === cat && !i.inPantry);
    if (catItems.length > 0) acc.push({ category: cat, items: catItems });
    return acc;
  }, [] as { category: string; items: typeof shoppingList }[]);

  const nonPantryItems = shoppingList.filter((i) => !i.inPantry);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
      <View style={{ marginBottom: SPACING.xl, marginTop: SPACING.md }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.text }}>Einkauf</Text>
        <Text style={{ fontSize: 14, color: COLORS.muted, fontWeight: '600' }}>{nonPantryItems.length} Artikel benötigt</Text>
      </View>

      {grouped.map(({ category, items }) => (
        <View key={category} style={{ marginBottom: SPACING.xl }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.muted, marginBottom: SPACING.sm, paddingLeft: SPACING.xs, letterSpacing: 1 }}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>
          <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.xl, ...SHADOWS.soft, overflow: 'hidden' }}>
            {items.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={() => { tap(); setShoppingList(toggleChecked(shoppingList, item.id)); }}
                style={({ pressed }) => ({ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: SPACING.lg, 
                  borderBottomWidth: idx === items.length - 1 ? 0 : 1, 
                  borderBottomColor: COLORS.bg,
                  backgroundColor: item.checked ? COLORS.primaryLight : COLORS.card,
                  opacity: pressed ? 0.8 : 1
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 }}>
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 8, 
                    borderWidth: 2, 
                    borderColor: item.checked ? COLORS.primary : COLORS.border, 
                    backgroundColor: item.checked ? COLORS.primary : 'transparent', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {item.checked && <Text style={{ fontSize: 12, color: '#FFF', fontWeight: '900' }}>✓</Text>}
                  </View>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: item.checked ? '500' : '600',
                    color: item.checked ? COLORS.muted : COLORS.text, 
                    textDecorationLine: item.checked ? 'line-through' : 'none', 
                    flex: 1 
                  }}>
                    {item.ingredient}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textSecondary }}>
                  {Math.round(item.amount * 10) / 10} <Text style={{ fontSize: 11, fontWeight: '500', color: COLORS.muted }}>{UNIT_LABELS[item.unit] ?? item.unit}</Text>
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {nonPantryItems.length > 0 && (
        <Pressable
          onPress={handleReweCart}
          style={({ pressed }) => ({
            backgroundColor: COLORS.primary,
            borderRadius: RADII.xl,
            paddingVertical: SPACING.xl,
            alignItems: 'center',
            ...SHADOWS.medium,
            shadowColor: COLORS.primary,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>🛒 In den Warenkorb</Text>
          <Text style={{ fontSize: 12, color: '#E8F5E9', marginTop: 4, fontWeight: '600' }}>REWE Lieferdienst öffnen</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
