import { generateMealPlan } from '../lib/meals/generator';
import { RECIPES } from '../data/recipes';
import type { MacroTarget, MealPlan } from '../lib/types';

describe('findAlternatives', () => {
  const omnivoreTarget: MacroTarget = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 73,
    maxCookTime: 45,
    diet: 'omnivore',
    mealsPerDay: 3,
  };

  it('returns alternative recipes for a meal slot', () => {
    const { findAlternatives } = require('../lib/meals/generator');
    const plan = generateMealPlan(omnivoreTarget);
    const day = plan.days[0];
    const mealIndex = 0;
    const alternatives = findAlternatives(day, mealIndex, omnivoreTarget, RECIPES);

    expect(Array.isArray(alternatives)).toBe(true);
    expect(alternatives.length).toBeLessThanOrEqual(5);
    expect(alternatives.length).toBeGreaterThan(0);

    const originalMeal = day.meals[mealIndex];
    for (const alt of alternatives) {
      expect(alt.id).not.toBe(originalMeal.recipe.id);
      expect(alt.mealType).toContain(originalMeal.type);
    }
  });

  it('returns recipes within cook time limit', () => {
    const { findAlternatives } = require('../lib/meals/generator');
    const quickTarget: MacroTarget = { ...omnivoreTarget, maxCookTime: 20 };
    const plan = generateMealPlan(quickTarget);
    const day = plan.days[0];

    const alternatives = findAlternatives(day, 0, quickTarget, RECIPES);
    for (const alt of alternatives) {
      expect(alt.totalTime).toBeLessThanOrEqual(quickTarget.maxCookTime);
    }
  });

  it('respects diet preference', () => {
    const { findAlternatives } = require('../lib/meals/generator');
    const veganTarget: MacroTarget = { ...omnivoreTarget, diet: 'vegan' };
    const plan = generateMealPlan(veganTarget);
    const day = plan.days[0];

    const alternatives = findAlternatives(day, 0, veganTarget, RECIPES);
    for (const alt of alternatives) {
      expect(alt.diet).toBe('vegan');
    }
  });

  it('excludes the current recipe from alternatives', () => {
    const { findAlternatives } = require('../lib/meals/generator');
    const plan = generateMealPlan(omnivoreTarget);
    const day = plan.days[0];
    const currentRecipeId = day.meals[0].recipe.id;

    const alternatives = findAlternatives(day, 0, omnivoreTarget, RECIPES);
    const alternativeIds = alternatives.map((r: any) => r.id);
    expect(alternativeIds).not.toContain(currentRecipeId);
  });
});

describe('swapMeal', () => {
  const omnivoreTarget: MacroTarget = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 73,
    maxCookTime: 45,
    diet: 'omnivore',
    mealsPerDay: 3,
  };

  it('swaps a meal and recalculates day macros', () => {
    const { swapMeal, findAlternatives } = require('../lib/meals/generator');
    const originalPlan = generateMealPlan(omnivoreTarget);
    const day = originalPlan.days[0];

    const alternatives = findAlternatives(day, 0, omnivoreTarget, RECIPES);
    if (alternatives.length > 0) {
      const swappedPlan = swapMeal(originalPlan, 0, 0, alternatives[0]);
      expect(swappedPlan).not.toBe(originalPlan);
      expect(swappedPlan.days[0].meals[0].recipe.id).toBe(alternatives[0].id);
      expect(swappedPlan.days[0].meals[0].recipe.id).not.toBe(originalPlan.days[0].meals[0].recipe.id);

      const manualTotal = swappedPlan.days[0].meals.reduce(
        (acc: any, m: any) => ({
          calories: acc.calories + m.scaledMacros.calories,
          protein: acc.protein + m.scaledMacros.protein,
        }),
        { calories: 0, protein: 0 },
      );
      expect(swappedPlan.days[0].totalMacros.calories).toBeCloseTo(manualTotal.calories, -1);
    }
  });

  it('preserves other days and meals unchanged', () => {
    const { swapMeal, findAlternatives } = require('../lib/meals/generator');
    const originalPlan = generateMealPlan(omnivoreTarget);
    const day = originalPlan.days[0];

    const alternatives = findAlternatives(day, 0, omnivoreTarget, RECIPES);
    if (alternatives.length > 0) {
      const swappedPlan = swapMeal(originalPlan, 0, 0, alternatives[0]);

      for (let d = 1; d < originalPlan.days.length; d++) {
        expect(swappedPlan.days[d].date).toBe(originalPlan.days[d].date);
        expect(swappedPlan.days[d].meals.length).toBe(originalPlan.days[d].meals.length);
      }

      for (let m = 1; m < originalPlan.days[0].meals.length; m++) {
        expect(swappedPlan.days[0].meals[m].recipe.id).toBe(originalPlan.days[0].meals[m].recipe.id);
      }
    }
  });

  it('does not mutate the original plan', () => {
    const { swapMeal, findAlternatives } = require('../lib/meals/generator');
    const originalPlan = generateMealPlan(omnivoreTarget);
    const originalRecipeId = originalPlan.days[0].meals[0].recipe.id;
    const day = originalPlan.days[0];

    const alternatives = findAlternatives(day, 0, omnivoreTarget, RECIPES);
    if (alternatives.length > 0) {
      const before = JSON.stringify(originalPlan);
      swapMeal(originalPlan, 0, 0, alternatives[0]);
      const after = JSON.stringify(originalPlan);
      expect(before).toBe(after);
      expect(originalPlan.days[0].meals[0].recipe.id).toBe(originalRecipeId);
    }
  });
});