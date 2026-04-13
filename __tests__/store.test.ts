import type { PantryItem, ShoppingItem, ReweAuthState, MacroTarget, MealPlan } from '../lib/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { useAppStore } from '../lib/store';
import { generateMealPlan } from '../lib/meals/generator';
import { generateShoppingList } from '../lib/shopping';
import { RECIPES } from '../data/recipes';

const DEFAULT_TARGET: MacroTarget = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 73,
  maxCookTime: 45,
  diet: 'omnivore',
  mealsPerDay: 3,
};

describe('useAppStore', () => {
  beforeEach(() => {
    const store = useAppStore.getState();
    store.setMacroTarget(DEFAULT_TARGET);
    store.setCurrentPlan(null);
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

  it('updates macro target to different diets', () => {
    const veganTarget: MacroTarget = { ...DEFAULT_TARGET, diet: 'vegan', protein: 120, fat: 55 };
    useAppStore.getState().setMacroTarget(veganTarget);
    expect(useAppStore.getState().macroTarget).toEqual(veganTarget);

    const vegetarianTarget: MacroTarget = { ...DEFAULT_TARGET, diet: 'vegetarian' };
    useAppStore.getState().setMacroTarget(vegetarianTarget);
    expect(useAppStore.getState().macroTarget).toEqual(vegetarianTarget);
  });

  it('adds and removes pantry items', () => {
    const realRecipe = RECIPES.find((r) => r.ingredients.length > 0)!;
    const firstIng = realRecipe.ingredients[0];

    const item: PantryItem = {
      id: 'p1',
      ingredient: firstIng.name,
      amount: firstIng.amount * 10,
      unit: firstIng.unit,
      category: firstIng.category,
      addedAt: '2026-04-09',
    };
    useAppStore.getState().addPantryItem(item);
    expect(useAppStore.getState().pantry).toContainEqual(item);

    useAppStore.getState().removePantryItem('p1');
    expect(useAppStore.getState().pantry).not.toContainEqual(item);
  });

  it('sets shopping list from real generated plan', () => {
    const plan = generateMealPlan(DEFAULT_TARGET);
    const allSlots = plan.days.flatMap((d) => d.meals);
    const planRecipes = allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings }));
    const shoppingItems = generateShoppingList(planRecipes, []);

    const items: ShoppingItem[] = shoppingItems.map((item, i) => ({
      ...item,
      id: `sl-${i}`,
    }));

    useAppStore.getState().setShoppingList(items);
    expect(useAppStore.getState().shoppingList.length).toBeGreaterThan(0);
    expect(useAppStore.getState().shoppingList[0].ingredient.length).toBeGreaterThan(0);
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

  it('sets and clears current plan using real generator', () => {
    const plan = generateMealPlan(DEFAULT_TARGET);
    useAppStore.getState().setCurrentPlan(plan);
    const stored = useAppStore.getState().currentPlan!;
    expect(stored).not.toBeNull();
    expect(stored.days).toHaveLength(7);
    expect(stored.macroTarget).toEqual(DEFAULT_TARGET);

    for (const day of stored.days) {
      expect(day.meals.length).toBeGreaterThan(0);
      expect(day.totalMacros.calories).toBeGreaterThan(0);
    }

    useAppStore.getState().setCurrentPlan(null);
    expect(useAppStore.getState().currentPlan).toBeNull();
  });

  it('preserves plan macro target across diet changes', () => {
    const veganTarget: MacroTarget = { ...DEFAULT_TARGET, diet: 'vegan' };
    useAppStore.getState().setMacroTarget(veganTarget);
    const plan = generateMealPlan(veganTarget);
    useAppStore.getState().setCurrentPlan(plan);

    const stored = useAppStore.getState().currentPlan!;
    expect(stored.macroTarget.diet).toBe('vegan');
    for (const day of stored.days) {
      for (const meal of day.meals) {
        expect(meal.recipe.diet).toBe('vegan');
      }
    }
  });
});