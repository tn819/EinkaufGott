import type { PantryItem, ShoppingItem, ReweAuthState, MacroTarget, MealPlan } from '../lib/types';

// Mock AsyncStorage before importing store
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { useAppStore } from '../lib/store';

describe('useAppStore', () => {
  // Reset store state between tests
  beforeEach(() => {
    const store = useAppStore.getState();
    store.setMacroTarget({
      calories: 2200,
      protein: 150,
      carbs: 250,
      fat: 73,
      maxCookTime: 45,
      diet: 'omnivore',
      mealsPerDay: 3,
    });
    store.setCurrentPlan(null);
    // Reset pantry by removing all items
    for (const item of store.pantry) {
      store.removePantryItem(item.id);
    }
    store.setShoppingList([]);
    store.setReweAuth({ isAuthenticated: false });
  });

  it('has correct default macro target values', () => {
    const { macroTarget } = useAppStore.getState();
    expect(macroTarget.calories).toBe(2200);
    expect(macroTarget.protein).toBe(150);
    expect(macroTarget.carbs).toBe(250);
    expect(macroTarget.fat).toBe(73);
    expect(macroTarget.maxCookTime).toBe(45);
    expect(macroTarget.diet).toBe('omnivore');
    expect(macroTarget.mealsPerDay).toBe(3);
  });

  it('updates macro target', () => {
    const newTarget: MacroTarget = {
      calories: 2500,
      protein: 180,
      carbs: 280,
      fat: 80,
      maxCookTime: 30,
      diet: 'vegan',
      mealsPerDay: 4,
    };
    useAppStore.getState().setMacroTarget(newTarget);
    expect(useAppStore.getState().macroTarget).toEqual(newTarget);
  });

  it('adds and removes pantry items', () => {
    const item: PantryItem = {
      id: 'p1',
      ingredient: 'Hähnchenbrust',
      amount: 500,
      unit: 'g',
      category: 'fleisch',
      addedAt: '2026-04-09',
    };
    useAppStore.getState().addPantryItem(item);
    expect(useAppStore.getState().pantry).toContainEqual(item);

    useAppStore.getState().removePantryItem('p1');
    expect(useAppStore.getState().pantry).not.toContainEqual(item);
  });

  it('sets shopping list', () => {
    const items: ShoppingItem[] = [
      {
        id: 'sl-1',
        ingredient: 'Hähnchenbrust',
        amount: 300,
        unit: 'g',
        category: 'fleisch',
        recipeIds: ['omn-001'],
        checked: false,
        inPantry: false,
      },
    ];
    useAppStore.getState().setShoppingList(items);
    expect(useAppStore.getState().shoppingList).toEqual(items);
  });

  it('sets REWE auth state', () => {
    const auth: ReweAuthState = {
      isAuthenticated: true,
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      selectedStoreId: 'store-123',
      selectedZipCode: '10115',
    };
    useAppStore.getState().setReweAuth(auth);
    expect(useAppStore.getState().reweAuth).toEqual(auth);
  });

  it('starts with null plan', () => {
    expect(useAppStore.getState().currentPlan).toBeNull();
  });

  it('sets and clears current plan', () => {
    const plan: MealPlan = {
      id: 'test-plan',
      createdAt: '2026-04-11',
      targetDate: '2026-04-11',
      macroTarget: useAppStore.getState().macroTarget,
      days: [],
    };
    useAppStore.getState().setCurrentPlan(plan);
    expect(useAppStore.getState().currentPlan).toEqual(plan);

    useAppStore.getState().setCurrentPlan(null);
    expect(useAppStore.getState().currentPlan).toBeNull();
  });
});