import { generateMealPlan } from '../lib/meals/generator';
import { RECIPES } from '../data/recipes';
import type { MacroTarget, DietPreference } from '../lib/types';

describe('generateMealPlan', () => {
  const omnivoreTarget: MacroTarget = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 73,
    maxCookTime: 45,
    diet: 'omnivore',
    mealsPerDay: 3,
  };

  const veganTarget: MacroTarget = {
    calories: 2000,
    protein: 120,
    carbs: 280,
    fat: 55,
    maxCookTime: 30,
    diet: 'vegan',
    mealsPerDay: 3,
  };

  const quickTarget: MacroTarget = {
    calories: 1800,
    protein: 130,
    carbs: 200,
    fat: 60,
    maxCookTime: 15,
    diet: 'omnivore',
    mealsPerDay: 3,
  };

  it('generates a 7-day plan', () => {
    const plan = generateMealPlan(omnivoreTarget);
    expect(plan.days).toHaveLength(7);
    expect(plan.macroTarget).toEqual(omnivoreTarget);
  });

  it('each day has meal slots', () => {
    const plan = generateMealPlan(omnivoreTarget);
    for (const day of plan.days) {
      expect(day.meals.length).toBeGreaterThan(0);
      expect(day.totalMacros.calories).toBeGreaterThan(0);
    }
  });

  it('respects diet preference - vegan only gets vegan recipes', () => {
    const plan = generateMealPlan(veganTarget);
    const allMeals = plan.days.flatMap((d) => d.meals);
    for (const meal of allMeals) {
      expect(meal.recipe.diet).toBe('vegan');
    }
  });

  it('respects diet preference - vegetarian gets vegetarian or vegan', () => {
    const vegetarianTarget: MacroTarget = { ...omnivoreTarget, diet: 'vegetarian' };
    const plan = generateMealPlan(vegetarianTarget);
    const allMeals = plan.days.flatMap((d) => d.meals);
    for (const meal of allMeals) {
      expect(['vegetarian', 'vegan']).toContain(meal.recipe.diet);
    }
  });

  it('respects max cook time', () => {
    const plan = generateMealPlan(quickTarget);
    const allMeals = plan.days.flatMap((d) => d.meals);
    for (const meal of allMeals) {
      expect(meal.recipe.totalTime).toBeLessThanOrEqual(quickTarget.maxCookTime);
    }
  });

  it('does not repeat recipes excessively within a day', () => {
    const plan = generateMealPlan(omnivoreTarget);
    for (const day of plan.days) {
      const recipeIds = day.meals.map((m) => m.recipe.id);
      const uniqueIds = new Set(recipeIds);
      expect(uniqueIds.size).toBeGreaterThanOrEqual(Math.min(recipeIds.length, 2));
    }
  });

  it('generates valid date strings for each day', () => {
    const plan = generateMealPlan(omnivoreTarget);
    for (const day of plan.days) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('calculates day totals from meal macros', () => {
    const plan = generateMealPlan(omnivoreTarget);
    for (const day of plan.days) {
      const manualTotal = day.meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.scaledMacros.calories,
          protein: acc.protein + m.scaledMacros.protein,
          carbs: acc.carbs + m.scaledMacros.carbs,
          fat: acc.fat + m.scaledMacros.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      expect(day.totalMacros.calories).toBeCloseTo(manualTotal.calories, -1);
      expect(day.totalMacros.protein).toBeCloseTo(manualTotal.protein, -1);
    }
  });

  it('has valid macro data in all seed recipes', () => {
    for (const recipe of RECIPES) {
      const calculatedCal = recipe.macros.protein * 4 + recipe.macros.carbs * 4 + recipe.macros.fat * 9;
      expect(calculatedCal).toBeGreaterThan(0);
      expect(Math.abs(recipe.macros.calories - calculatedCal)).toBeLessThan(calculatedCal * 0.15);
    }
  });

  it('seed recipes have valid totalTime = prepTime + cookTime', () => {
    for (const recipe of RECIPES) {
      expect(recipe.totalTime).toBe(recipe.prepTime + recipe.cookTime);
    }
  });

  it('seed recipes have valid ingredient data', () => {
    for (const recipe of RECIPES) {
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      for (const ing of recipe.ingredients) {
        expect(ing.name.length).toBeGreaterThan(0);
        expect(ing.nameEn.length).toBeGreaterThan(0);
        expect(ing.amount).toBeGreaterThan(0);
        expect(ing.unit).toBeDefined();
        expect(ing.category).toBeDefined();
      }
    }
  });

  it('handles mealsPerDay=1 (only dinner)', () => {
    const singleTarget: MacroTarget = { ...omnivoreTarget, mealsPerDay: 1 };
    const plan = generateMealPlan(singleTarget);
    for (const day of plan.days) {
      expect(day.meals.some((m) => m.type === 'dinner')).toBe(true);
    }
  });

  it('handles mealsPerDay=5 (all meal types)', () => {
    const fiveTarget: MacroTarget = { ...omnivoreTarget, mealsPerDay: 5 };
    const plan = generateMealPlan(fiveTarget);
    expect(plan.days[0].meals.length).toBeGreaterThanOrEqual(3);
  });
});