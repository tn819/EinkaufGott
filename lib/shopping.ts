import type { ShoppingItem, PantryItem, Ingredient, IngredientCategory } from './types';

const CATEGORY_ORDER: IngredientCategory[] = [
  'fleisch', 'fisch', 'milchprodukte', 'gemüse', 'obst',
  'getreide', 'hülsenfrüchte', 'nüsse', 'öle_fette', 'gewürze',
  'säuwarenten', 'getränke', 'tiefkühl', 'konserven', 'sonstiges',
];

export function generateShoppingList(
  recipes: { recipe: any; scaledServings: number }[],
  pantry: PantryItem[],
): ShoppingItem[] {
  const consolidated = new Map<string, { name: string; totalAmount: number; unit: string; category: IngredientCategory; recipeIds: string[] }>();

  for (const { recipe, scaledServings } of recipes) {
    const factor = scaledServings / recipe.servings;
    for (const ing of recipe.ingredients as Ingredient[]) {
      const key = `${ing.name}|${ing.unit}`;
      const scaled = ing.amount * factor;
      const existing = consolidated.get(key);
      if (existing) {
        existing.totalAmount += scaled;
        if (!existing.recipeIds.includes(recipe.id)) existing.recipeIds.push(recipe.id);
      } else {
        consolidated.set(key, {
          name: ing.name,
          totalAmount: scaled,
          unit: ing.unit,
          category: ing.category,
          recipeIds: [recipe.id],
        });
      }
    }
  }

  const pantryNames = new Set(pantry.map((p) => p.ingredient.toLowerCase()));

  const items: ShoppingItem[] = Array.from(consolidated.values()).map((item, i) => ({
    id: `sl-${i}`,
    ingredient: item.name,
    amount: Math.round(item.totalAmount * 10) / 10,
    unit: item.unit as any,
    category: item.category,
    recipeIds: item.recipeIds,
    checked: false,
    inPantry: pantryNames.has(item.name.toLowerCase()),
  }));

  return items.sort((a, b) => {
    const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.ingredient.localeCompare(b.ingredient, 'de');
  });
}

export function toggleChecked(items: ShoppingItem[], id: string): ShoppingItem[] {
  return items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
}

export function togglePantry(items: ShoppingItem[], id: string): ShoppingItem[] {
  return items.map((i) => (i.id === id ? { ...i, inPantry: !i.inPantry, checked: i.inPantry ? i.checked : true } : i));
}