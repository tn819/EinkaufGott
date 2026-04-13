import { generateMealPlan } from '../lib/meals/generator';
import { generateShoppingList, toggleChecked, togglePantry } from '../lib/shopping';
import { ingredientToReweQuery, buildReweCheckoutUrl } from '../lib/rewe/products';
import { RECIPES } from '../data/recipes';
import type { MacroTarget, DietPreference } from '../lib/types';

describe('End-to-end flow: macros → plan → shopping list → REWE', () => {
  const omnivoreTarget: MacroTarget = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 73,
    maxCookTime: 45,
    diet: 'omnivore',
    mealsPerDay: 3,
  };

  it('generates a full plan, shopping list, and REWE checkout URL', () => {
    const plan = generateMealPlan(omnivoreTarget);
    expect(plan.days).toHaveLength(7);

    const allSlots = plan.days.flatMap((d) => d.meals);
    expect(allSlots.length).toBeGreaterThanOrEqual(21);

    const shoppingItems = generateShoppingList(
      allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings })),
      [],
    );
    expect(shoppingItems.length).toBeGreaterThan(0);

    for (const item of shoppingItems) {
      expect(item.ingredient.length).toBeGreaterThan(0);
      expect(item.amount).toBeGreaterThan(0);
      expect(item.recipeIds.length).toBeGreaterThan(0);
    }

    const reweQueries = shoppingItems.map((item) => {
      const recipe = RECIPES.find((r) => r.ingredients.some((i) => i.name === item.ingredient));
      const ingredient = recipe?.ingredients.find((i) => i.name === item.ingredient);
      if (!ingredient) return null;
      return ingredientToReweQuery(ingredient);
    }).filter(Boolean);

    expect(reweQueries.length).toBeGreaterThan(0);

    const mockProducts = reweQueries.slice(0, 5).map((_, i) => ({
      productId: `product-${i}`,
      quantity: 1,
    }));
    const url = buildReweCheckoutUrl(mockProducts);
    expect(url).toContain('shop.rewe.de/cart');
    expect(url).toContain('items=');
  });

  it('shopping list correctly excludes pantry items', () => {
    const plan = generateMealPlan(omnivoreTarget);
    const allSlots = plan.days.flatMap((d) => d.meals);
    const firstRecipe = allSlots[0].recipe;
    const pantryIngredient = firstRecipe.ingredients[0];

    const pantry = [{
      id: 'p1',
      ingredient: pantryIngredient.name,
      amount: pantryIngredient.amount * 10,
      unit: pantryIngredient.unit,
      category: pantryIngredient.category,
      addedAt: '2026-04-09',
    }];

    const items = generateShoppingList(
      allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings })),
      pantry,
    );

    const pantryItem = items.find((i) => i.ingredient === pantryIngredient.name);
    expect(pantryItem?.inPantry).toBe(true);

    const checkedItems = toggleChecked(items, items[0].id);
    expect(checkedItems[0].checked).toBe(true);
  });

  it('vegan plan produces only vegan meals and valid shopping list', () => {
    const veganTarget: MacroTarget = { ...omnivoreTarget, diet: 'vegan' };
    const plan = generateMealPlan(veganTarget);

    for (const day of plan.days) {
      for (const meal of day.meals) {
        expect(meal.recipe.diet).toBe('vegan');
      }
    }

    const allSlots = plan.days.flatMap((d) => d.meals);
    const items = generateShoppingList(
      allSlots.map((s) => ({ recipe: s.recipe, scaledServings: s.scaledServings })),
      [],
    );
    expect(items.length).toBeGreaterThan(0);
  });
});