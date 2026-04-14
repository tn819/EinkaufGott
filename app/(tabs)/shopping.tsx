import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useAppStore } from '../../lib/store';
import { useThemeColors, SPACING } from '../../lib/theme';
import { tap, success, impact } from '../../lib/haptics';
import { generateShoppingList, toggleChecked } from '../../lib/shopping';
import { ingredientToReweQuery } from '../../lib/rewe/products';
import { RECIPES } from '../../data/recipes';
import type { IngredientCategory, Ingredient } from '../../lib/types';

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

const REWE_NAME_MAP: Record<string, string> = {
  'Hähnchenbrust': 'Hähnchenbrustfilet',
  'Rinderhack': 'Rinder Hackfleisch',
  'Putenschnitzel': 'Putenbrust',
  'Lachsfilet': 'Lachs frisch',
  'Thunfisch im eigenen Saft': 'Thunfisch eigenen Saft',
  'Garnelen': 'Garnelen geschält',
  'Magerquark': 'Magerquark',
  'Griechischer Joghurt': 'Griechischer Joghurt',
  'Butter': 'Butter',
  'Basmatireis': 'Basmatireis',
  'Haferflocken': 'Haferflocken',
  'Nudeln': 'Nudeln',
  'Tofu': 'Tofu fest',
  'Olivenöl': 'Olivenöl',
  'Sojasauce': 'Sojasauce',
  'Eier': 'Eier',
  'Milch': 'Milch',
};

function isReweMatched(ingredientName: string): boolean {
  if (REWE_NAME_MAP[ingredientName]) return true;
  const allIngredients = RECIPES.flatMap((r) => r.ingredients);
  const found = allIngredients.find((i) => i.name === ingredientName && i.reweSearchTerm);
  return !!found;
}

function getReweQuery(ingredientName: string): string {
  if (REWE_NAME_MAP[ingredientName]) return REWE_NAME_MAP[ingredientName];
  const allIngredients = RECIPES.flatMap((r) => r.ingredients);
  const found = allIngredients.find((i) => i.name === ingredientName);
  if (found) return ingredientToReweQuery(found);
  return ingredientName;
}

export default function ShoppingScreen() {
  const { currentPlan, shoppingList, setShoppingList, pantry } = useAppStore();
  const COLORS = useThemeColors();

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

  const handleReweCart = () => {
    impact();
    const nonPantry = shoppingList.filter((i) => !i.inPantry);
    if (nonPantry.length === 0) return;

    const firstItem = nonPantry[0];
    const query = getReweQuery(firstItem.ingredient);
    const url = `https://shop.rewe.de/search?search=${encodeURIComponent(query)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Fehler', 'REWE Lieferdienst konnte nicht geöffnet werden.');
    });
  };

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
  const nonPantryItems = shoppingList.filter((i) => !i.inPantry);
  const reweMatched = nonPantryItems.filter((i) => isReweMatched(i.ingredient));
  const reweUnmatched = nonPantryItems.filter((i) => !isReweMatched(i.ingredient));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
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

      {nonPantryItems.length > 0 && (
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>REWE Suche</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                {reweMatched.length} von {nonPantryItems.length} Artikel gefunden
              </Text>
            </View>
            {reweUnmatched.length > 0 && (
              <Text style={{ fontSize: 11, color: COLORS.warning }}>
                {reweUnmatched.length} ohne Treffer
              </Text>
            )}
          </View>
        </View>
      )}

      {grouped.map(({ category, items }) => (
        <View key={category} style={{ marginBottom: SPACING.md }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs }}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>
          <View style={{ backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
            {items.map((item) => {
              const matched = isReweMatched(item.ingredient);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => { tap(); setShoppingList(toggleChecked(shoppingList, item.id)); }}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: item.checked ? COLORS.bg : COLORS.card }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: item.checked ? COLORS.primary : COLORS.border, backgroundColor: item.checked ? COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {item.checked && <Text style={{ fontSize: 12, color: '#FFF', fontWeight: '700' }}>✓</Text>}
                    </View>
                    <Text style={{ fontSize: 14, color: item.checked ? COLORS.muted : COLORS.text, textDecorationLine: item.checked ? 'line-through' : 'none', flex: 1 }}>
                      {item.ingredient}
                    </Text>
                    {matched && <Text style={{ fontSize: 10, color: COLORS.success, fontWeight: '600' }}>✓ REWE</Text>}
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: SPACING.sm }}>
                    {Math.round(item.amount * 10) / 10} {UNIT_LABELS[item.unit] ?? item.unit}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      {checkedItems.length > 0 && (
        <View style={{ marginTop: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: SPACING.lg, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '600' }}>
            ✅ {checkedItems.length} von {nonPantryItems.length} Artikel erledigt
          </Text>
        </View>
      )}

      {nonPantryItems.length > 0 && (
        <Pressable
          onPress={handleReweCart}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            paddingVertical: SPACING.lg,
            alignItems: 'center',
            marginTop: SPACING.sm,
            marginBottom: SPACING.xl,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>🛒 In den Warenkorb</Text>
          <Text style={{ fontSize: 12, color: '#E8F5E9', marginTop: 2 }}>REWE Lieferdienst öffnen</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}