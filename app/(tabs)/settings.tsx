import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { generateMealPlan } from '../../lib/meals/generator';
import { useThemeColors, SPACING, RADII, SHADOWS } from '../../lib/theme';
import { tap, success, select } from '../../lib/haptics';
import type { DietPreference, MacroTarget } from '../../lib/types';

function Stepper({ value, onChange, step = 1, min = 0 }: { value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg }}>
      <Pressable
        onPress={() => { tap(); onChange(Math.max(min, value - step)); }}
        style={({ pressed }) => ({ 
          backgroundColor: COLORS.card, 
          borderRadius: RADII.md, 
          width: 44, 
          height: 44, 
          alignItems: 'center', 
          justifyContent: 'center',
          ...SHADOWS.soft,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }]
        })}
      >
        <Text style={{ fontSize: 24, fontWeight: '300', color: COLORS.text }}>−</Text>
      </Pressable>
      <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, minWidth: 60, textAlign: 'center' }}>{value}</Text>
      <Pressable
        onPress={() => { tap(); onChange(value + step); }}
        style={({ pressed }) => ({ 
          backgroundColor: COLORS.primary, 
          borderRadius: RADII.md, 
          width: 44, 
          height: 44, 
          alignItems: 'center', 
          justifyContent: 'center',
          ...SHADOWS.soft,
          shadowColor: COLORS.primary,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }]
        })}
      >
        <Text style={{ fontSize: 24, fontWeight: '300', color: '#FFFFFF' }}>+</Text>
      </Pressable>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: RADII.xl, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOWS.soft }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.muted, marginBottom: SPACING.lg, textTransform: 'uppercase', letterSpacing: 1.5 }}>{title}</Text>
      {children}
    </View>
  );
}

function MacroInput({ label, value, onChange, color, unit = 'g' }: { label: string; value: number; onChange: (v: number) => void; color: string; unit?: string }) {
  const COLORS = useThemeColors();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.card, borderRadius: RADII.xl, padding: SPACING.md, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.soft, shadowColor: color, shadowOpacity: 0.1 }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => { tap(); onChange(Math.max(0, value - 5)); }} style={{ padding: 4 }}><Text style={{ fontSize: 18, color: COLORS.muted }}>−</Text></Pressable>
        <Text style={{ fontSize: 18, fontWeight: '800', color }}>{value}</Text>
        <Pressable onPress={() => { tap(); onChange(value + 5); }} style={{ padding: 4 }}><Text style={{ fontSize: 18, color: COLORS.muted }}>+</Text></Pressable>
      </View>
      <Text style={{ fontSize: 9, fontWeight: '600', color: COLORS.muted }}>{unit}</Text>
    </View>
  );
}

const DIETS: { key: DietPreference; label: string; emoji: string }[] = [
  { key: 'omnivore', label: 'Alles', emoji: '🥩' },
  { key: 'vegetarian', label: 'Veggie', emoji: '🥗' },
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
];

export default function SettingsScreen() {
  const { macroTarget, setMacroTarget, setCurrentPlan } = useAppStore();
  const COLORS = useThemeColors();
  const router = useRouter();
  const [local, setLocal] = useState<MacroTarget>(macroTarget);

  const update = (partial: Partial<MacroTarget>) => setLocal((prev) => ({ ...prev, ...partial }));

  const handleGenerate = () => {
    try {
      setMacroTarget(local);
      const plan = generateMealPlan(local);
      setCurrentPlan(plan);
      success();
      router.replace('/');
    } catch (e) {
      Alert.alert('Fehler', 'Plan konnte nicht erstellt werden.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
      <View style={{ marginBottom: SPACING.xl, marginTop: SPACING.md }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.text }}>Profil</Text>
        <Text style={{ fontSize: 14, color: COLORS.muted, fontWeight: '600' }}>Deine Tagesziele</Text>
      </View>

      <Section title="KALORIEN">
        <Stepper value={local.calories} onChange={(v) => update({ calories: v })} step={50} min={1200} />
      </Section>

      <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg }}>
        <MacroInput label="PROTEIN" value={local.protein} onChange={(v) => update({ protein: v })} color={COLORS.protein} />
        <MacroInput label="CARBS" value={local.carbs} onChange={(v) => update({ carbs: v })} color={COLORS.carbs} />
        <MacroInput label="FETT" value={local.fat} onChange={(v) => update({ fat: v })} color={COLORS.fat} />
      </View>

      <Section title="MAHLZEITEN & ZEIT">
        <View style={{ gap: SPACING.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textSecondary }}>Anzahl pro Tag</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => { select(); update({ mealsPerDay: num }); }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: local.mealsPerDay === num ? COLORS.primary : COLORS.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: local.mealsPerDay === num ? '#FFF' : COLORS.text }}>{num}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textSecondary }}>Max. Kochzeit</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
              <Stepper value={local.maxCookTime} onChange={(v) => update({ maxCookTime: v })} step={5} min={10} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.muted }}>MIN</Text>
            </View>
          </View>
        </View>
      </Section>

      <Section title="ERNÄHRUNG">
        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          {DIETS.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => { select(); update({ diet: d.key }); }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: local.diet === d.key ? COLORS.primary : COLORS.card,
                borderRadius: RADII.lg,
                paddingVertical: SPACING.lg,
                alignItems: 'center',
                ...SHADOWS.soft,
                shadowColor: local.diet === d.key ? COLORS.primary : COLORS.text,
                transform: [{ scale: pressed ? 0.95 : 1 }]
              })}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{d.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: local.diet === d.key ? '#FFF' : COLORS.text }}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Pressable
        onPress={handleGenerate}
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
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>Plan aktualisieren</Text>
      </Pressable>
    </ScrollView>
  );
}
