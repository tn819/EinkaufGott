import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAppStore } from '../../lib/store';
import { useThemeColors, SPACING } from '../../lib/theme';
import { tap, success, heavy, select } from '../../lib/haptics';
import type { IngredientCategory, IngredientUnit, PantryItem } from '../../lib/types';

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

const UNIT_OPTIONS: { value: IngredientUnit; label: string }[] = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'stück', label: 'Stück' },
  { value: 'el', label: 'EL' },
  { value: 'tl', label: 'TL' },
  { value: 'prise', label: 'Prise' },
  { value: 'bund', label: 'Bund' },
  { value: 'dose', label: 'Dose' },
  { value: 'packung', label: 'Packung' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function PantryScreen() {
  const { pantry, addPantryItem, removePantryItem } = useAppStore();
  const COLORS = useThemeColors();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<IngredientUnit>('stück');
  const [category, setCategory] = useState<IngredientCategory>('sonstiges');

  const handleAdd = () => {
    if (!name.trim()) return;
    const parsedAmount = parseFloat(amount) || 1;
    const item: PantryItem = {
      id: generateId(),
      ingredient: name.trim(),
      amount: parsedAmount,
      unit,
      category,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    addPantryItem(item);
    success();
    setName('');
    setAmount('');
    setUnit('stück');
    setCategory('sonstiges');
    setShowAdd(false);
  };

  const handleDelete = (id: string, ingredientName: string) => {
    heavy();
    Alert.alert(
      'Entfernen',
      `"${ingredientName}" aus dem Vorrat entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Entfernen', style: 'destructive', onPress: () => removePantryItem(id) },
      ],
    );
  };

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = pantry.filter((i) => i.category === cat);
    if (catItems.length > 0) acc.push({ category: cat, items: catItems });
    return acc;
  }, [] as { category: string; items: PantryItem[] }[]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: showAdd ? 400 : 100 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{pantry.length} Artikel in deinem Vorrat</Text>
        <Pressable
          onPress={() => { select(); setShowAdd(!showAdd); }}
          style={{ backgroundColor: showAdd ? COLORS.border : COLORS.primary, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: showAdd ? COLORS.text : '#FFF' }}>{showAdd ? 'Fertig' : '+ Hinzufügen'}</Text>
        </Pressable>
      </View>

      {showAdd && (
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md }}>Neuer Artikel</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="z.B. Butter, Reis, Hähnchen..."
            placeholderTextColor={COLORS.muted}
            style={{ backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm }}
          />

          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm }}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Menge"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border }}
            />
            <View style={{ backgroundColor: COLORS.bg, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.xs }}>
                {UNIT_OPTIONS.map((u) => (
                  <Pressable
                    key={u.value}
                    onPress={() => setUnit(u.value)}
                    style={{ paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, backgroundColor: unit === u.value ? COLORS.primary : 'transparent', borderRadius: 6 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: unit === u.value ? '700' : '400', color: unit === u.value ? '#FFF' : COLORS.textSecondary }}>{u.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.xs, marginBottom: SPACING.md }}>
            {CATEGORY_ORDER.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={{ paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, backgroundColor: category === cat ? COLORS.primary : COLORS.bg, borderRadius: 6, borderWidth: 1, borderColor: category === cat ? COLORS.primary : COLORS.border }}
              >
                <Text style={{ fontSize: 11, fontWeight: category === cat ? '600' : '400', color: category === cat ? '#FFF' : COLORS.textSecondary }}>
                  {(CATEGORY_LABELS[cat] ?? cat).replace(/^[^\s]+ /, '')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={handleAdd}
            disabled={!name.trim()}
            style={{ backgroundColor: name.trim() ? COLORS.primary : COLORS.border, borderRadius: 8, paddingVertical: SPACING.md, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: name.trim() ? '#FFF' : COLORS.muted }}>Hinzufügen</Text>
          </Pressable>
        </View>
      )}

      {pantry.length === 0 && !showAdd && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl }}>
          <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>🏠</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm }}>Vorrat ist leer</Text>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>
            Füge Artikel hinzu, die du bereits zu Hause hast.{'\n'}Diese werden von der Einkaufsliste abgezogen.
          </Text>
        </View>
      )}

      {grouped.map(({ category, items }) => (
        <View key={category} style={{ marginBottom: SPACING.md }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs }}>
            {CATEGORY_LABELS[category] ?? category}
          </Text>
          <View style={{ backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
            {items.map((item) => {
              const unitLabel: Record<string, string> = {
                'g': 'g', 'kg': 'kg', 'ml': 'ml', 'l': 'l',
                'stück': '', 'el': 'EL', 'tl': 'TL', 'prise': 'Prise',
                'bund': 'Bund', 'dose': 'Dose', 'packung': 'Packung',
              };
              return (
                <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: COLORS.text }}>{item.ingredient}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>Hinzugefügt: {item.addedAt}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{Math.round(item.amount * 10) / 10} {unitLabel[item.unit] ?? item.unit}</Text>
                    <Pressable onPress={() => handleDelete(item.id, item.ingredient)} style={{ backgroundColor: COLORS.error + '15', borderRadius: 6, paddingHorizontal: SPACING.sm, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 12, color: COLORS.error, fontWeight: '600' }}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}