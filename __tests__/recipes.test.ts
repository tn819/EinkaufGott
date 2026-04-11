import { RECIPES } from '../data/recipes';

describe('Recipe seed data integrity', () => {
  it('has at least 40 recipes', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(40);
  });

  it('has unique ids for all recipes', () => {
    const ids = RECIPES.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all recipes have valid diet type', () => {
    const validDiets = ['omnivore', 'vegetarian', 'vegan'];
    for (const recipe of RECIPES) {
      expect(validDiets).toContain(recipe.diet);
    }
  });

  it('all recipes have valid meal type', () => {
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    for (const recipe of RECIPES) {
      expect(recipe.mealType.length).toBeGreaterThan(0);
      for (const mt of recipe.mealType) {
        expect(validMealTypes).toContain(mt);
      }
    }
  });

  it('all recipes have valid difficulty', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    for (const recipe of RECIPES) {
      expect(validDifficulties).toContain(recipe.difficulty);
    }
  });

  it('all recipes have totalTime = prepTime + cookTime', () => {
    for (const recipe of RECIPES) {
      expect(recipe.totalTime).toBe(recipe.prepTime + recipe.cookTime);
    }
  });

  it('all recipes have macros within reasonable bounds', () => {
    for (const recipe of RECIPES) {
      expect(recipe.macros.calories).toBeGreaterThan(0);
      expect(recipe.macros.protein).toBeGreaterThan(0);
      expect(recipe.macros.carbs).toBeGreaterThanOrEqual(0);
      expect(recipe.macros.fat).toBeGreaterThanOrEqual(0);
      const calculatedCal = recipe.macros.protein * 4 + recipe.macros.carbs * 4 + recipe.macros.fat * 9;
      expect(Math.abs(recipe.macros.calories - calculatedCal)).toBeLessThan(calculatedCal * 0.15);
    }
  });

  it('all recipes have at least one ingredient', () => {
    for (const recipe of RECIPES) {
      expect(recipe.ingredients.length).toBeGreaterThan(0);
    }
  });

  it('all recipes have at least one instruction', () => {
    for (const recipe of RECIPES) {
      expect(recipe.instructions.length).toBeGreaterThan(0);
    }
  });

  it('all recipes have German title', () => {
    for (const recipe of RECIPES) {
      expect(recipe.titleDe.length).toBeGreaterThan(0);
    }
  });

  it('all ingredients have required fields', () => {
    for (const recipe of RECIPES) {
      for (const ing of recipe.ingredients) {
        expect(ing.name.length).toBeGreaterThan(0);
        expect(ing.nameEn.length).toBeGreaterThan(0);
        expect(ing.amount).toBeGreaterThan(0);
        expect(ing.category).toBeDefined();
      }
    }
  });

  it('has vegetarian and vegan recipes', () => {
    const vegRecipes = RECIPES.filter((r) => r.diet === 'vegetarian');
    const veganRecipes = RECIPES.filter((r) => r.diet === 'vegan');
    expect(vegRecipes.length).toBeGreaterThan(0);
    expect(veganRecipes.length).toBeGreaterThan(0);
  });

  it('has breakfast, lunch, dinner, and snack options', () => {
    const breakfasts = RECIPES.filter((r) => r.mealType.includes('breakfast'));
    const lunches = RECIPES.filter((r) => r.mealType.includes('lunch'));
    const dinners = RECIPES.filter((r) => r.mealType.includes('dinner'));
    const snacks = RECIPES.filter((r) => r.mealType.includes('snack'));
    expect(breakfasts.length).toBeGreaterThan(0);
    expect(lunches.length).toBeGreaterThan(0);
    expect(dinners.length).toBeGreaterThan(0);
    expect(snacks.length).toBeGreaterThan(0);
  });

  it('has quick recipes (≤15min) and longer recipes (30+min)', () => {
    const quick = RECIPES.filter((r) => r.totalTime <= 15);
    const longer = RECIPES.filter((r) => r.totalTime >= 30);
    expect(quick.length).toBeGreaterThan(0);
    expect(longer.length).toBeGreaterThan(0);
  });

  it('ingredient units are from valid set', () => {
    const validUnits = ['g', 'kg', 'ml', 'l', 'stück', 'el', 'tl', 'prise', 'bund', 'dose', 'packung'];
    for (const recipe of RECIPES) {
      for (const ing of recipe.ingredients) {
        expect(validUnits).toContain(ing.unit);
      }
    }
  });

  it('ingredient categories are from valid set', () => {
    const validCategories = ['fleisch', 'fisch', 'milchprodukte', 'gemüse', 'obst', 'getreide', 'hülsenfrüchte', 'nüsse', 'öle_fette', 'gewürze', 'säuwarenten', 'getränke', 'tiefkühl', 'konserven', 'sonstiges'];
    for (const recipe of RECIPES) {
      for (const ing of recipe.ingredients) {
        expect(validCategories).toContain(ing.category);
      }
    }
  });
});