import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAppStore } from '../../lib/store';
import { generateMealPlan } from '../../lib/meals/generator';
import { useThemeColors, SPACING } from '../../lib/theme';
import { tap, success, select } from '../../lib/haptics';
import type { DietPreference, MacroTarget } from '../../lib/types';

function Stepper({ value, onChange, step = 1, min = 0 }: { value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
      <Pressable
        onPress={() => { tap(); onChange(Math.max(min, value - step)); }}
        style={{ backgroundColor: COLORS.border, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 20, color: COLORS.text }}>−</Text>
      </Pressable>
      <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, minWidth: 50, textAlign: 'center' }}>{value}</Text>
      <Pressable
        onPress={() => { tap(); onChange(value + step); }}
        style={{ backgroundColor: COLORS.primary, borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 20, color: '#FFFFFF' }}>+</Text>
      </Pressable>
    </View>
  );
}

function MacroInput({ label, value, onChange, color, unit = 'g' }: { label: string; value: number; onChange: (v: number) => void; color: string; unit?: string }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: `${color}30` }}>
      <Text style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <Stepper value={value} onChange={onChange} step={5} min={0} />
      <Text style={{ fontSize: 11, color: COLORS.muted }}>{unit}</Text>
    </View>
  );
}

const DIETS: { key: DietPreference; label: string; emoji: string }[] = [
  { key: 'omnivore', label: 'Alles', emoji: '🥩' },
  { key: 'vegetarian', label: 'Vegetarisch', emoji: '🥗' },
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
];

export default function SettingsScreen() {
  const { macroTarget, setMacroTarget, setCurrentPlan } = useAppStore();
  const COLORS = useThemeColors();
  const [local, setLocal] = useState<MacroTarget>(macroTarget);

  const update = (partial: Partial<MacroTarget>) => setLocal((prev) => ({ ...prev, ...partial }));

  const handleGenerate = () => {
    setMacroTarget(local);
    const plan = generateMealPlan(local);
    setCurrentPlan(plan);
    success();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm }}>Deine Makros</Text>
      <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl }}>Stelle deine Tagesziele ein</Text>

      <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg }}>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md }}>Kalorien</Text>
        <Stepper value={local.calories} onChange={(v) => update({ calories: v })} step={50} min={1200} />
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
        <MacroInput label="Protein" value={local.protein} onChange={(v) => update({ protein: v })} color={COLORS.protein} />
        <MacroInput label="Kohlenhydrate" value={local.carbs} onChange={(v) => update({ carbs: v })} color={COLORS.carbs} />
        <MacroInput label="Fett" value={local.fat} onChange={(v) => update({ fat: v })} color={COLORS.fat} />
      </View>

      <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg }}>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md }}>Max. Kochzeit pro Mahlzeit</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <Stepper value={local.maxCookTime} onChange={(v) => update({ maxCookTime: v })} step={5} min={10} />
          <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Min</Text>
        </View>
      </View>

      <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg }}>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md }}>Mahlzeiten pro Tag</Text>
        <Stepper value={local.mealsPerDay} onChange={(v) => update({ mealsPerDay: Math.min(5, v) })} step={1} min={1} />
      </View>

      <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.xl }}>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md }}>Ernährung</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {DIETS.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => { select(); update({ diet: d.key }); }}
              style={{
                flex: 1,
                backgroundColor: local.diet === d.key ? COLORS.primary : COLORS.bg,
                borderRadius: 10,
                paddingVertical: SPACING.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: local.diet === d.key ? COLORS.primary : COLORS.border,
              }}
            >
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{d.emoji}</Text>
              <Text style={{ fontSize: 13, fontWeight: local.diet === d.key ? '700' : '400', color: local.diet === d.key ? '#FFF' : COLORS.text }}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={handleGenerate}
        style={{
          backgroundColor: COLORS.primary,
          borderRadius: 12,
          paddingVertical: SPACING.lg,
          alignItems: 'center',
          marginBottom: SPACING.xl,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Wochenplan erstellen</Text>
      </Pressable>
    </ScrollView>
  );
}