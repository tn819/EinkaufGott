import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppStore } from '../../lib/store';
import { useThemeColors, SPACING, RADII, SHADOWS } from '../../lib/theme';
import { tap, success, select, impact, heavy } from '../../lib/haptics';
import { lookupBarcode } from '../../lib/pantry/barcode';
import type { PantryItem } from '../../lib/types';

function ExpiryBadge({ date }: { date?: string }) {
  const COLORS = useThemeColors();
  if (!date) return null;

  const expiry = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let color = COLORS.success;
  let label = `${diffDays} Tage`;

  if (diffDays <= 0) {
    color = COLORS.error;
    label = 'Abgelaufen';
  } else if (diffDays <= 3) {
    color = COLORS.warning;
    label = 'Bald abgelaufen';
  }

  return (
    <View style={{ backgroundColor: `${color}15`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

export default function PantryScreen() {
  const { pantry, addPantryItem, removePantryItem } = useAppStore();
  const COLORS = useThemeColors();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [newItem, setNewItem] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleAddManual = () => {
    if (!newItem.trim()) return;
    const item: PantryItem = {
      id: Math.random().toString(36).substr(2, 9),
      ingredient: newItem.trim(),
      amount: 1,
      unit: 'stück',
      category: 'sonstiges',
      addedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
    };
    addPantryItem(item);
    setNewItem('');
    success();
  };

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (isScanning) return;
    setIsScanning(true);
    impact();

    const product = await lookupBarcode(data);
    if (product) {
      const item: PantryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ingredient: product.ingredient!,
        amount: 1,
        unit: 'stück',
        category: product.category || 'sonstiges',
        addedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Assume 14 days for scanned items
      };
      addPantryItem(item);
      success();
      setIsScannerVisible(false);
      Alert.alert('Gefunden!', `${item.ingredient} wurde zum Vorrat hinzugefügt.`);
    } else {
      heavy();
      Alert.alert('Nicht gefunden', 'Produkt wurde nicht in der Datenbank gefunden.');
    }
    
    setTimeout(() => setIsScanning(false), 2000);
  };

  const openScanner = async () => {
    const { granted } = await requestPermission();
    if (granted) {
      setIsScannerVisible(true);
      select();
    } else {
      Alert.alert('Kamera-Zugriff', 'Wir benötigen Zugriff auf deine Kamera, um Barcodes zu scannen.');
    }
  };

  return (
    <>
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
            onPress={handleAddManual} 
            style={({ pressed }) => ({ 
              backgroundColor: COLORS.primaryLight, 
              borderRadius: RADII.lg, 
              width: 48, 
              height: 48, 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            })}
          >
            <Text style={{ fontSize: 24, color: COLORS.primary, fontWeight: '300' }}>+</Text>
          </Pressable>
          <Pressable 
            onPress={openScanner} 
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
            <Text style={{ fontSize: 20 }}>📷</Text>
          </Pressable>
        </View>

        <View style={{ gap: SPACING.md }}>
          {pantry.length === 0 ? (
            <View style={{ padding: SPACING.xxl, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 24 }}>
                Dein Vorrat ist leer. Scanne Produkte oder füge Basis-Zutaten manuell hinzu.
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
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>{item.ingredient}</Text>
                    <ExpiryBadge date={item.expiresAt} />
                  </View>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.category}</Text>
                </View>
                <Pressable 
                  onPress={() => { tap(); removePantryItem(item.id); }} 
                  style={({ pressed }) => ({ 
                    padding: SPACING.sm, 
                    backgroundColor: COLORS.primaryLight, 
                    borderRadius: RADII.sm,
                    opacity: pressed ? 0.7 : 1
                  })}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.primary }}>LÖSCHEN</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={isScannerVisible} animationType="slide" presentationStyle="fullScreen">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={StyleSheet.absoluteFill}
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8'],
            }}
          />
          <View style={{ position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>Barcode scannen</Text>
            <Pressable onPress={() => setIsScannerVisible(false)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 }}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Abbrechen</Text>
            </Pressable>
          </View>
          <View style={{ position: 'absolute', bottom: 100, left: 40, right: 40, alignItems: 'center' }}>
            <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 24, backgroundColor: 'transparent' }} />
            <Text style={{ color: '#FFF', marginTop: 20, textAlign: 'center', opacity: 0.8 }}>Halte den Barcode in den Rahmen</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
