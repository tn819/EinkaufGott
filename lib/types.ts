export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  maxCookTime: number;
  diet: DietPreference;
  mealsPerDay: number;
}

export type DietPreference = 'omnivore' | 'vegetarian' | 'vegan';

export interface Recipe {
  id: string;
  title: string;
  titleDe: string;
  description: string;
  diet: DietPreference;
  tags: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mealType: MealType[];
  macros: MacrosPerServing;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MacrosPerServing {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Ingredient {
  name: string;
  nameEn: string;
  amount: number;
  unit: IngredientUnit;
  category: IngredientCategory;
  reweSearchTerm?: string;
}

export type IngredientUnit =
  | 'g' | 'kg' | 'ml' | 'l'
  | 'stück' | 'el' | 'tl' | 'prise' | 'bund' | 'dose' | 'packung';

export type IngredientCategory =
  | 'fleisch' | 'fisch' | 'milchprodukte' | 'gemüse' | 'obst'
  | 'getreide' | 'hülsenfrüchte' | 'nüsse' | 'öle_fette' | 'gewürze'
  | 'säuwarenten' | 'getränke' | 'tiefkühl' | 'konserven' | 'sonstiges';

export interface MealPlan {
  id: string;
  createdAt: string;
  targetDate: string;
  macroTarget: MacroTarget;
  days: DayPlan[];
}

export interface DayPlan {
  date: string;
  meals: MealSlot[];
  totalMacros: MacrosPerServing;
}

export interface MealSlot {
  type: MealType;
  recipe: Recipe;
  scaledServings: number;
  scaledMacros: MacrosPerServing;
}

export interface PantryItem {
  id: string;
  ingredient: string;
  amount: number;
  unit: IngredientUnit;
  category: IngredientCategory;
  addedAt: string;
  expiresAt?: string;
}

export interface ShoppingItem {
  id: string;
  ingredient: string;
  amount: number;
  unit: IngredientUnit;
  category: IngredientCategory;
  recipeIds: string[];
  reweProduct?: ReweProduct;
  checked: boolean;
  inPantry: boolean;
}

export interface ReweProduct {
  id: string;
  name: string;
  brand?: string;
  price: number;
  unit: string;
  imageUrl?: string;
  ean?: string;
  macrosPer100g?: MacrosPerServing;
}

export interface ReweAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  selectedStoreId?: string;
  selectedZipCode?: string;
}

export interface AppState {
  macroTarget: MacroTarget;
  setMacroTarget: (target: MacroTarget) => void;
  currentPlan: MealPlan | null;
  setCurrentPlan: (plan: MealPlan | null) => void;
  pantry: PantryItem[];
  addPantryItem: (item: PantryItem) => void;
  removePantryItem: (id: string) => void;
  shoppingList: ShoppingItem[];
  setShoppingList: (items: ShoppingItem[]) => void;
  reweAuth: ReweAuthState;
  setReweAuth: (auth: ReweAuthState) => void;
}