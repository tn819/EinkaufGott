import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useAppStore } from '../../lib/store';
import { useThemeColors, SPACING, RADII, SHADOWS } from '../../lib/theme';
import { tap, success, select } from '../../lib/haptics';
import type { PantryItem } from '../../lib/types';

export default function PantryScreen() {
  const { pantry, addPantryItem, removePantryItem } = useAppStore();
  const COLORS = useThemeColors();
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const item: PantryItem = {
      id: Math.random().toString(36).substr(2, 9),
      ingredient: newItem.trim(),
      amount: 1,
      unit: 'stück',
      category: 'sonstiges',
      addedAt: new Date().toISOString(),
    };
    addPantryItem(item);
    setNewItem('');
    success();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
      <View style={{ marginBottom: SPACING.xl, marginTop: SPACING.md }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.text }}>Vorrat</Text>
        <Text style={{ fontSize: 14, color: COLORS.muted, fontWeight: '600' }}>{pantry.length} Artikel im Schrank</Text>
      </View>

      <View style={{ 
        backgroundColor: COLORS.card, 
        borderRadius: RADII.xl, 
        padding: SPACING.md, 
        marginBottom: SPACING.xxl, 
        flexDirection: 'row', 
        gap: SPACING.sm,
        ...SHADOWS.soft 
      }}>
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          placeholder="z.B. Salz, Öl, Reis..."
          placeholderTextColor={COLORS.muted}
          style={{ 
            flex: 1, 
            height: 48, 
            backgroundColor: COLORS.bg, 
            borderRadius: RADII.lg, 
            paddingHorizontal: SPACING.md, 
            color: COLORS.text,
            fontSize: 16,
            fontWeight: '600'
          }}
        />
        <Pressable 
          onPress={handleAdd} 
          style={({ pressed }) => ({ 
            backgroundColor: COLORS.primary, 
            borderRadius: RADII.lg, 
            width: 48, 
            height: 48, 
            alignItems: 'center', 
            justifyContent: 'center',
            ...SHADOWS.soft,
            shadowColor: COLORS.primary,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }]
          })}
        >
          <Text style={{ fontSize: 24, color: '#FFF', fontWeight: '300' }}>+</Text>
        </Pressable>
      </View>

      <View style={{ gap: SPACING.md }}>
        {pantry.length === 0 ? (
          <View style={{ padding: SPACING.xxl, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 24 }}>
              Dein Vorrat ist leer. Füge Basis-Zutaten hinzu, die du immer daheim hast.
            </Text>
          </View>
        ) : (
          pantry.sort((a, b) => a.ingredient.localeCompare(b.ingredient)).map((item) => (
            <View 
              key={item.id} 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                backgroundColor: COLORS.card, 
                padding: SPACING.lg, 
                borderRadius: RADII.lg, 
                ...SHADOWS.soft 
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>{item.ingredient}</Text>
              <Pressable 
                onPress={() => { tap(); removePantryItem(item.id); }} 
                style={({ pressed }) => ({ 
                  padding: SPACING.sm, 
                  backgroundColor: COLORS.primaryLight, 
                  borderRadius: RADII.sm,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.primary }}>LÖSCHEN</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
