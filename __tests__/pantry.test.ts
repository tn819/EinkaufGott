import { useAppStore } from '../lib/store';
import type { PantryItem } from '../lib/types';
import { generateShoppingList } from '../lib/shopping';
import { generateMealPlan } from '../lib/meals/generator';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const DEFAULT_TARGET = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 73,
  maxCookTime: 45,
  diet: 'omnivore' as const,
  mealsPerDay: 3,
};

describe('Pantry store operations', () => {
  beforeEach(() => {
    const store = useAppStore.getState();
    for (const item of store.pantry) {
      store.removePantryItem(item.id);
    }
  });

  it('adds and removes pantry items', () => {
    const item: PantryItem = {
      id: 'pantry-test-1',
      ingredient: 'Butter',
      amount: 250,
      unit: 'g',
      category: 'milchprodukte',
      addedAt: '2026-04-13',
    };

    useAppStore.getState().addPantryItem(item);
    expect(useAppStore.getState().pantry).toContainEqual(item);

    useAppStore.getState().removePantryItem('pantry-test-1');
    expect(useAppStore.getState().pantry).not.toContainEqual(item);
  });

  it('adds multiple items and removes specific one', () => {
    const item1: PantryItem = {
      id: 'p1',
      ingredient: 'Butter',
      amount: 250,
      unit: 'g',
      category: 'milchprodukte',
      addedAt: '2026-04-13',
    };
    const item2: PantryItem = {
      id: 'p2',
      ingredient: 'Reis',
      amount: 500,
      unit: 'g',
      category: 'getreide',
      addedAt: '2026-04-13',
    };

    useAppStore.getState().addPantryItem(item1);
    useAppStore.getState().addPantryItem(item2);
    expect(useAppStore.getState().pantry).toHaveLength(2);

    useAppStore.getState().removePantryItem('p1');
    expect(useAppStore.getState().pantry).toHaveLength(1);
    expect(useAppStore.getState().pantry[0].ingredient).toBe('Reis');
  });

  it('pantry items are excluded from shopping list', () => {
    const store = useAppStore.getState();
    const plan = generateMealPlan(DEFAULT_TARGET);
    store.setCurrentPlan(plan);

    const firstRecipe = plan.days[0].meals[0].recipe;
    const firstIngredient = firstRecipe.ingredients[0];

    const pantryItem: PantryItem = {
      id: 'p-pantry',
      ingredient: firstIngredient.name,
      amount: firstIngredient.amount * 10,
      unit: firstIngredient.unit,
      category: firstIngredient.category,
      addedAt: '2026-04-13',
    };
    store.addPantryItem(pantryItem);

    const allSlots = plan.days.flatMap((d) => d.meals);
    const pantry = useAppStore.getState().pantry;
    const items = generateShoppingList(
      allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings })),
      pantry,
    );

    const matched = items.find((i) => i.ingredient === firstIngredient.name);
    if (matched) {
      expect(matched.inPantry).toBe(true);
    }

    store.removePantryItem('p-pantry');
    store.setCurrentPlan(null);
  });

  it('preserves pantry across plan regeneration', () => {
    const item: PantryItem = {
      id: 'p-persist',
      ingredient: 'Butter',
      amount: 500,
      unit: 'g',
      category: 'milchprodukte',
      addedAt: '2026-04-13',
    };

    useAppStore.getState().addPantryItem(item);
    const plan = generateMealPlan(DEFAULT_TARGET);
    useAppStore.getState().setCurrentPlan(plan);
    useAppStore.getState().setCurrentPlan(null);

    expect(useAppStore.getState().pantry).toContainEqual(item);

    useAppStore.getState().removePantryItem('p-persist');
  });
});