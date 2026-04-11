import { generateShoppingList, toggleChecked } from '../lib/shopping';
import type { PantryItem } from '../lib/types';

const mockRecipes = [
  {
    id: 'test-1',
    title: 'Test Chicken',
    titleDe: 'Test-Hähnchen',
    description: 'Test recipe',
    diet: 'omnivore' as const,
    tags: ['high-protein'],
    servings: 2,
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    difficulty: 'easy' as const,
    mealType: ['dinner'] as Array<'breakfast' | 'lunch' | 'dinner' | 'snack'>,
    macros: { calories: 500, protein: 40, carbs: 30, fat: 20 },
    ingredients: [
      { name: 'Hähnchenbrust', nameEn: 'chicken breast', amount: 300, unit: 'g' as const, category: 'fleisch' as const },
      { name: 'Reis', nameEn: 'rice', amount: 150, unit: 'g' as const, category: 'getreide' as const },
      { name: 'Oliveöl', nameEn: 'olive oil', amount: 1, unit: 'el' as const, category: 'öle_fette' as const },
    ],
    instructions: ['Cook rice.', 'Fry chicken.'],
  },
  {
    id: 'test-2',
    title: 'Test Salad',
    titleDe: 'Test-Salat',
    description: 'Test recipe 2',
    diet: 'vegan' as const,
    tags: ['quick'],
    servings: 1,
    prepTime: 5,
    cookTime: 0,
    totalTime: 5,
    difficulty: 'easy' as const,
    mealType: ['lunch'] as Array<'breakfast' | 'lunch' | 'dinner' | 'snack'>,
    macros: { calories: 250, protein: 10, carbs: 20, fat: 15 },
    ingredients: [
      { name: 'Salat', nameEn: 'lettuce', amount: 100, unit: 'g' as const, category: 'gemüse' as const },
      { name: 'Oliveöl', nameEn: 'olive oil', amount: 1, unit: 'el' as const, category: 'öle_fette' as const },
    ],
    instructions: ['Mix.'],
  },
];

describe('generateShoppingList', () => {
  it('consolidates duplicate ingredients across recipes', () => {
    const planRecipes = [
      { recipe: mockRecipes[0], scaledServings: 2 },
      { recipe: mockRecipes[1], scaledServings: 1 },
    ];
    const items = generateShoppingList(planRecipes, []);
    const olive = items.find((i) => i.ingredient === 'Oliveöl');
    expect(olive).toBeDefined();
    expect(olive!.amount).toBe(2);
    expect(olive!.recipeIds).toHaveLength(2);
  });

  it('marks items as in pantry when matching', () => {
    const pantry: PantryItem[] = [
      {
        id: 'p1',
        ingredient: 'Hähnchenbrust',
        amount: 500,
        unit: 'g',
        category: 'fleisch',
        addedAt: '2026-04-09',
      },
    ];
    const planRecipes = [{ recipe: mockRecipes[0], scaledServings: 2 }];
    const items = generateShoppingList(planRecipes, pantry);
    const chicken = items.find((i) => i.ingredient === 'Hähnchenbrust');
    expect(chicken?.inPantry).toBe(true);
    const rice = items.find((i) => i.ingredient === 'Reis');
    expect(rice?.inPantry).toBe(false);
  });

  it('scales ingredients when servings change', () => {
    const planRecipes = [{ recipe: mockRecipes[0], scaledServings: 4 }];
    const items = generateShoppingList(planRecipes, []);
    const chicken = items.find((i) => i.ingredient === 'Hähnchenbrust');
    expect(chicken!.amount).toBe(600);
    const rice = items.find((i) => i.ingredient === 'Reis');
    expect(rice!.amount).toBe(300);
  });

  it('sorts items by category order', () => {
    const planRecipes = [{ recipe: mockRecipes[0], scaledServings: 2 }];
    const items = generateShoppingList(planRecipes, []);
    const categories = items.map((i) => i.category);
    expect(categories.indexOf('fleisch')).toBeLessThan(categories.indexOf('getreide'));
    expect(categories.indexOf('getreide')).toBeLessThan(categories.indexOf('öle_fette'));
  });

  it('returns empty list for empty recipes', () => {
    const items = generateShoppingList([], []);
    expect(items).toHaveLength(0);
  });
});

describe('toggleChecked', () => {
  const items = [
    { id: '1', ingredient: 'A', amount: 1, unit: 'g' as const, category: 'fleisch' as const, recipeIds: ['r1'], checked: false, inPantry: false },
    { id: '2', ingredient: 'B', amount: 2, unit: 'g' as const, category: 'gemüse' as const, recipeIds: ['r1'], checked: false, inPantry: false },
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