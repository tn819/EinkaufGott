import { generateShoppingList, toggleChecked, togglePantry } from '../lib/shopping';
import { RECIPES } from '../data/recipes';
import type { PantryItem, ShoppingItem } from '../lib/types';

function pickRecipes(diet: string, count: number) {
  const filtered = RECIPES.filter((r) => {
    if (diet === 'vegan') return r.diet === 'vegan';
    if (diet === 'vegetarian') return r.diet === 'vegetarian' || r.diet === 'vegan';
    return true;
  });
  return filtered.slice(0, count);
}

describe('generateShoppingList', () => {
  it('consolidates duplicate ingredients across real recipes', () => {
    const r1 = RECIPES.find((r) => r.diet === 'omnivore' && r.ingredients.length >= 3);
    const r2 = RECIPES.find((r) => r.diet === 'omnivore' && r.ingredients.length >= 3 && r.id !== r1!.id);
    const planRecipes = [
      { recipe: r1!, scaledServings: r1!.servings },
      { recipe: r2!, scaledServings: r2!.servings },
    ];
    const items = generateShoppingList(planRecipes, []);

    const r1Names = new Set(r1!.ingredients.map((i) => i.name));
    const shared = r2!.ingredients.find((i) => r1Names.has(i.name) && i.unit === r1!.ingredients.find((ri) => ri.name === i.name)!.unit);
    if (shared) {
      const consolidated = items.find((i) => i.ingredient === shared.name);
      expect(consolidated).toBeDefined();
      expect(consolidated!.recipeIds.length).toBeGreaterThanOrEqual(2);
    }

    expect(items.length).toBeGreaterThan(0);
  });

  it('marks items as in pantry when matching — using real recipe data', () => {
    const recipe = RECIPES.find((r) => r.ingredients.length > 0)!;
    const firstIngredient = recipe.ingredients[0];
    const pantry: PantryItem[] = [
      {
        id: 'p1',
        ingredient: firstIngredient.name,
        amount: firstIngredient.amount * 10,
        unit: firstIngredient.unit,
        category: firstIngredient.category,
        addedAt: '2026-04-09',
      },
    ];
    const planRecipes = [{ recipe, scaledServings: recipe.servings }];
    const items = generateShoppingList(planRecipes, pantry);

    const pantryItem = items.find((i) => i.ingredient === firstIngredient.name);
    expect(pantryItem?.inPantry).toBe(true);

    const nonPantryItem = items.find((i) => i.ingredient !== firstIngredient.name);
    if (nonPantryItem) {
      expect(nonPantryItem.inPantry).toBe(false);
    }
  });

  it('scales ingredients proportionally when servings differ from base', () => {
    const recipe = RECIPES.find((r) => r.servings >= 2)!;
    const scaleFactor = 2;
    const planRecipes = [{ recipe, scaledServings: recipe.servings * scaleFactor }];
    const items = generateShoppingList(planRecipes, []);

    for (const origIng of recipe.ingredients) {
      const item = items.find((i) => i.ingredient === origIng.name);
      expect(item).toBeDefined();
      expect(item!.amount).toBeCloseTo(origIng.amount * scaleFactor, 0);
    }
  });

  it('sorts items by category order', () => {
    const recipes = pickRecipes('omnivore', 3);
    const planRecipes = recipes.map((r) => ({ recipe: r, scaledServings: r.servings }));
    const items = generateShoppingList(planRecipes, []);

    const categoryOrder = ['fleisch', 'fisch', 'milchprodukte', 'gemüse', 'obst',
      'getreide', 'hülsenfrüchte', 'nüsse', 'öle_fette', 'gewürze',
      'säuwarenten', 'getränke', 'tiefkühl', 'konserven', 'sonstiges'];
    const categories = items.map((i) => i.category);
    for (let i = 1; i < categories.length; i++) {
      expect(categoryOrder.indexOf(categories[i])).toBeGreaterThanOrEqual(categoryOrder.indexOf(categories[i - 1]));
    }
  });

  it('returns empty list for empty recipes', () => {
    const items = generateShoppingList([], []);
    expect(items).toHaveLength(0);
  });

  it('generates shopping list from a full week plan', () => {
    const { generateMealPlan } = require('../lib/meals/generator');
    const plan = generateMealPlan({
      calories: 2200,
      protein: 150,
      carbs: 250,
      fat: 73,
      maxCookTime: 45,
      diet: 'omnivore',
      mealsPerDay: 3,
    });
    const allSlots = plan.days.flatMap((d: any) => d.meals);
    const planRecipes = allSlots.map((s: any) => ({ recipe: s.recipe, scaledServings: s.scaledServings }));
    const items = generateShoppingList(planRecipes, []);

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.ingredient.length).toBeGreaterThan(0);
      expect(item.amount).toBeGreaterThan(0);
      expect(item.unit).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.recipeIds.length).toBeGreaterThan(0);
    }
  });
});

describe('toggleChecked', () => {
  const items: ShoppingItem[] = [
    { id: '1', ingredient: 'Butter', amount: 100, unit: 'g', category: 'milchprodukte', recipeIds: ['r1'], checked: false, inPantry: false },
    { id: '2', ingredient: 'Reis', amount: 500, unit: 'g', category: 'getreide', recipeIds: ['r1', 'r2'], checked: false, inPantry: false },
  ];

  it('toggles checked state for a single item', () => {
    const result = toggleChecked(items, '1');
    expect(result[0].checked).toBe(true);
    expect(result[1].checked).toBe(false);
  });

  it('toggles back to unchecked', () => {
    const toggled = toggleChecked(items, '1');
    const untoggled = toggleChecked(toggled, '1');
    expect(untoggled[0].checked).toBe(false);
  });

  it('leaves other items unchanged', () => {
    const result = toggleChecked(items, '2');
    expect(result[0].checked).toBe(false);
    expect(result[1].checked).toBe(true);
  });
});

describe('togglePantry', () => {
  const items: ShoppingItem[] = [
    { id: '1', ingredient: 'Butter', amount: 100, unit: 'g', category: 'milchprodukte', recipeIds: ['r1'], checked: false, inPantry: false },
    { id: '2', ingredient: 'Reis', amount: 500, unit: 'g', category: 'getreide', recipeIds: ['r1'], checked: false, inPantry: true },
  ];

  it('toggles pantry state for a non-pantry item', () => {
    const result = togglePantry(items, '1');
    expect(result[0].inPantry).toBe(true);
  });

  it('toggles pantry state for an already-pantry item', () => {
    const result = togglePantry(items, '2');
    expect(result[1].inPantry).toBe(false);
  });

  it('leaves other items unchanged', () => {
    const result = togglePantry(items, '1');
    expect(result[1].inPantry).toBe(true);
  });
});