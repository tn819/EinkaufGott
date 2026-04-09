import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAppStore } from '../../lib/store';
import { COLORS, SPACING } from '../../lib/theme';
import { generateShoppingList, toggleChecked } from '../../lib/shopping';
import type { IngredientCategory } from '../../lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  fleisch: '🥩 Fleisch & Fisch',
  fisch: '🐟 Fisch',
  milchprodukte: '🧀 Milchprodukte',
  gemüse: '🥬 Gemüse',
  obst: '🍎 Obst',
  getreide: '🌾 Getreide & Nudeln',
  hülsenfrüchte: '🫘 Hülsenfrüchte',
  nüsse: '🥜 Nüsse & Samen',
  öle_fette: '🫒 Öle & Fette',
  gewürze: '🧂 Gewürze',
  säuwarenten: '🫙 Saucen & Würzmittel',
  getränke: '🥤 Getränke',
  tiefkühl: '❄️ Tiefkühl',
  konserven: '🥫 Konserven',
  sonstiges: '📦 Sonstiges',
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

export default function ShoppingScreen() {
  const { currentPlan, shoppingList, setShoppingList, pantry } = useAppStore();

  const items = useMemo(() => {
    if (!currentPlan) return [];

    const allSlots = currentPlan.days.flatMap((d) => d.meals);
    const newItems = generateShoppingList(
      allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings })),
      pantry,
    );
    setShoppingList(newItems);
    return newItems;
  }, [currentPlan, pantry]);

  if (!currentPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>🛒</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm }}>Keine Einkaufsliste</Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>Erstelle zuerst einen Wochenplan, um eine Einkaufsliste zu generieren.</Text>
      </View>
    );
  }

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = shoppingList.filter((i) => i.category === cat && !i.inPantry);
    if (catItems.length > 0) acc.push({ category: cat, items: catItems });
    return acc;
  }, [] as { category: string; items: typeof shoppingList }[]);

  const pantryItems = shoppingList.filter((i) => i.inPantry);
  const checkedItems = shoppingList.filter((i) => i.checked && !i.inPantry);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text }}>Einkaufsliste</Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{shoppingList.length} Artikel für deinen Wochenplan</Text>
        </View>
        {pantryItems.length > 0 && (
          <Pressable onPress={() => {
            setShoppingList(shoppingList.map((i) => i.inPantry ? { ...i, inPantry: false } : i));
          }} style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
            <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>⛺ Vorrat zeigen</Text>
          </Pressable>
        )}
      </View>

      {grouped.map(({ category, items }) => (
        <View key={category} style={{ marginBottom: SPACING.md }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs }}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>
          <View style={{ backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setShoppingList(toggleChecked(shoppingList, item.id))}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: item.checked ? COLORS.bg : COLORS.card }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: item.checked ? COLORS.primary : COLORS.border, backgroundColor: item.checked ? COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {item.checked && <Text style={{ fontSize: 12, color: '#FFF', fontWeight: '700' }}>✓</Text>}
                  </View>
                  <Text style={{ fontSize: 14, color: item.checked ? COLORS.muted : COLORS.text, textDecorationLine: item.checked ? 'line-through' : 'none' }}>
                    {item.ingredient}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  {Math.round(item.amount * 10) / 10} {UNIT_LABELS[item.unit] ?? item.unit}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {checkedItems.length > 0 && (
        <View style={{ marginTop: SPACING.md, marginBottom: SPACING.xl, backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: SPACING.lg, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '600' }}>
            ✅ {checkedItems.length} von {shoppingList.filter((i) => !i.inPantry).length} Artikel erledigt
          </Text>
        </View>
      )}
    </ScrollView>
  );
}