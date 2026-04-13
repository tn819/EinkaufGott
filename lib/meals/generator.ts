import type { Recipe, MacroTarget, MealPlan, DayPlan, MealSlot, MacrosPerServing } from '../types';
import { RECIPES } from '../../data/recipes';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function scaleMacros(macros: MacrosPerServing, factor: number): MacrosPerServing {
  return {
    calories: Math.round(macros.calories * factor),
    protein: Math.round(macros.protein * factor * 10) / 10,
    carbs: Math.round(macros.carbs * factor * 10) / 10,
    fat: Math.round(macros.fat * factor * 10) / 10,
    fiber: macros.fiber ? Math.round(macros.fiber * factor * 10) / 10 : undefined,
  };
}

function sumMacros(macroList: MacrosPerServing[]): MacrosPerServing {
  return macroList.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: Math.round((acc.protein + m.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
      fat: Math.round((acc.fat + m.fat) * 10) / 10,
      fiber: acc.fiber !== undefined || m.fiber !== undefined
        ? Math.round(((acc.fiber ?? 0) + (m.fiber ?? 0)) * 10) / 10
        : undefined,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 } as MacrosPerServing,
  );
}

function macroDistance(macros: MacrosPerServing, target: MacrosPerServing): number {
  return (
    Math.abs(macros.calories - target.calories) / target.calories +
    Math.abs(macros.protein - target.protein) / target.protein +
    Math.abs(macros.carbs - target.carbs) / target.carbs +
    Math.abs(macros.fat - target.fat) / target.fat
  );
}

function getRecipesForDietAndTime(
  recipes: Recipe[],
  diet: MacroTarget['diet'],
  maxCookTime: number,
  mealType?: string,
): Recipe[] {
  const dietHierarchy: Record<string, string[]> = {
    vegan: ['vegan'],
    vegetarian: ['vegan', 'vegetarian'],
    omnivore: ['vegan', 'vegetarian', 'omnivore'],
  };

  const allowedDiets = dietHierarchy[diet] ?? ['vegan', 'vegetarian', 'omnivore'];

  return recipes.filter((r) => {
    if (!allowedDiets.includes(r.diet)) return false;
    if (r.totalTime > maxCookTime) return false;
    if (mealType && !r.mealType.includes(mealType as any)) return false;
    return true;
  });
}

function pickMealForSlot(
  candidates: Recipe[],
  targetMacros: MacrosPerServing,
  usedRecipeIds: Set<string>,
): { recipe: Recipe; scaledServings: number; scaledMacros: MacrosPerServing } | null {
  let best: { recipe: Recipe; scaledServings: number; scaledMacros: MacrosPerServing; distance: number } | null = null;

  for (const recipe of candidates) {
    if (usedRecipeIds.has(recipe.id) && candidates.length > 2) continue;

    const baseMacros = recipe.macros;
    const idealFactor = targetMacros.calories / baseMacros.calories;
    const factor = Math.max(0.5, Math.min(2.0, idealFactor));
    const scaled = scaleMacros(baseMacros, factor);
    const distance = macroDistance(scaled, targetMacros);

    if (!best || distance < best.distance) {
      best = { recipe, scaledServings: Math.round(factor * recipe.servings * 10) / 10, scaledMacros: scaled, distance };
    }
  }

  return best ? { recipe: best.recipe, scaledServings: best.scaledServings, scaledMacros: best.scaledMacros } : null;
}

export function generateMealPlan(target: MacroTarget, startDate?: string): MealPlan {
  const allRecipes = RECIPES;
  const mealSlots: { type: string; fraction: number }[] = [];

  if (target.mealsPerDay <= 1) {
    mealSlots.push({ type: 'dinner', fraction: 1.0 });
  } else if (target.mealsPerDay === 2) {
    mealSlots.push({ type: 'lunch', fraction: 0.4 }, { type: 'dinner', fraction: 0.6 });
  } else if (target.mealsPerDay === 3) {
    mealSlots.push({ type: 'breakfast', fraction: 0.25 }, { type: 'lunch', fraction: 0.35 }, { type: 'dinner', fraction: 0.4 });
  } else if (target.mealsPerDay === 4) {
    mealSlots.push({ type: 'breakfast', fraction: 0.2 }, { type: 'lunch', fraction: 0.3 }, { type: 'dinner', fraction: 0.35 }, { type: 'snack', fraction: 0.15 });
  } else {
    mealSlots.push({ type: 'breakfast', fraction: 0.2 }, { type: 'lunch', fraction: 0.25 }, { type: 'dinner', fraction: 0.35 }, { type: 'snack', fraction: 0.1 }, { type: 'snack', fraction: 0.1 });
  }

  const days: DayPlan[] = [];
  const baseDate = startDate ? new Date(startDate) : new Date();

  for (let d = 0; d < 7; d++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);

    const usedRecipeIds = new Set<string>();
    const meals: MealSlot[] = [];
    const dayMacros: MacrosPerServing[] = [];

    for (const slot of mealSlots) {
      const slotTarget: MacrosPerServing = {
        calories: Math.round(target.calories * slot.fraction),
        protein: Math.round(target.protein * slot.fraction * 10) / 10,
        carbs: Math.round(target.carbs * slot.fraction * 10) / 10,
        fat: Math.round(target.fat * slot.fraction * 10) / 10,
      };

      const candidates = getRecipesForDietAndTime(allRecipes, target.diet, target.maxCookTime, slot.type);

      const picked = pickMealForSlot(candidates, slotTarget, usedRecipeIds);

      if (picked) {
        usedRecipeIds.add(picked.recipe.id);
        meals.push({
          type: slot.type as any,
          recipe: picked.recipe,
          scaledServings: picked.scaledServings,
          scaledMacros: picked.scaledMacros,
        });
        dayMacros.push(picked.scaledMacros);
      }
    }

    days.push({
      date: dateStr,
      meals,
      totalMacros: sumMacros(dayMacros),
    });
  }

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    targetDate: baseDate.toISOString().slice(0, 10),
    macroTarget: target,
    days,
  };
}

export function findAlternatives(
  dayPlan: DayPlan,
  mealIndex: number,
  target: MacroTarget,
  allRecipes: Recipe[] = RECIPES,
): Recipe[] {
  const meal = dayPlan.meals[mealIndex];
  if (!meal) return [];

  const targetMacros = meal.scaledMacros;
  const candidates = getRecipesForDietAndTime(allRecipes, target.diet, target.maxCookTime, meal.type);

  return candidates
    .filter((r) => r.id !== meal.recipe.id)
    .map((r) => {
      const idealFactor = targetMacros.calories / r.macros.calories;
      const factor = Math.max(0.5, Math.min(2.0, idealFactor));
      const scaled = scaleMacros(r.macros, factor);
      const distance = macroDistance(scaled, targetMacros);
      return { recipe: r, distance };
    })
    .filter((entry) => {
      const distance = entry.distance;
      const maxAllowed = 0.6;
      return distance <= maxAllowed;
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map((entry) => entry.recipe);
}

export function swapMeal(
  plan: MealPlan,
  dayIndex: number,
  mealIndex: number,
  newRecipe: Recipe,
): MealPlan {
  const target = plan.macroTarget;
  const mealSlots: { type: string; fraction: number }[] = [];

  if (target.mealsPerDay <= 1) {
    mealSlots.push({ type: 'dinner', fraction: 1.0 });
  } else if (target.mealsPerDay === 2) {
    mealSlots.push({ type: 'lunch', fraction: 0.4 }, { type: 'dinner', fraction: 0.6 });
  } else if (target.mealsPerDay === 3) {
    mealSlots.push({ type: 'breakfast', fraction: 0.25 }, { type: 'lunch', fraction: 0.35 }, { type: 'dinner', fraction: 0.4 });
  } else if (target.mealsPerDay === 4) {
    mealSlots.push({ type: 'breakfast', fraction: 0.2 }, { type: 'lunch', fraction: 0.3 }, { type: 'dinner', fraction: 0.35 }, { type: 'snack', fraction: 0.15 });
  } else {
    mealSlots.push({ type: 'breakfast', fraction: 0.2 }, { type: 'lunch', fraction: 0.25 }, { type: 'dinner', fraction: 0.35 }, { type: 'snack', fraction: 0.1 }, { type: 'snack', fraction: 0.1 });
  }

  const oldMeal = plan.days[dayIndex].meals[mealIndex];
  const slotTarget: MacrosPerServing = {
    calories: Math.round(target.calories * (mealSlots[mealIndex]?.fraction ?? 0.3)),
    protein: Math.round(target.protein * (mealSlots[mealIndex]?.fraction ?? 0.3) * 10) / 10,
    carbs: Math.round(target.carbs * (mealSlots[mealIndex]?.fraction ?? 0.3) * 10) / 10,
    fat: Math.round(target.fat * (mealSlots[mealIndex]?.fraction ?? 0.3) * 10) / 10,
  };

  const idealFactor = slotTarget.calories / newRecipe.macros.calories;
  const factor = Math.max(0.5, Math.min(2.0, idealFactor));
  const scaledMacros = scaleMacros(newRecipe.macros, factor);
  const scaledServings = Math.round(factor * newRecipe.servings * 10) / 10;

  const newDays = plan.days.map((day, di) => {
    if (di !== dayIndex) return day;

    const newMeals = day.meals.map((m, mi) => {
      if (mi !== mealIndex) return m;
      return {
        ...m,
        recipe: newRecipe,
        scaledServings,
        scaledMacros,
      };
    });

    return {
      ...day,
      meals: newMeals,
      totalMacros: sumMacros(newMeals.map((m) => m.scaledMacros)),
    };
  });

  return {
    ...plan,
    days: newDays,
  };
}