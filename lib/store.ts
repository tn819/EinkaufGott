import { create } from 'zustand';
import type { AppState, MacroTarget, MealPlan, PantryItem, ShoppingItem, ReweAuthState } from './types';

const DEFAULT_MACROS: MacroTarget = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 73,
  maxCookTime: 45,
  diet: 'omnivore',
  mealsPerDay: 3,
};

export const useAppStore = create<AppState>((set) => ({
  macroTarget: DEFAULT_MACROS,
  setMacroTarget: (target: MacroTarget) => set({ macroTarget: target }),

  currentPlan: null,
  setCurrentPlan: (plan: MealPlan | null) => set({ currentPlan: plan }),

  pantry: [],
  addPantryItem: (item: PantryItem) =>
    set((state) => ({ pantry: [...state.pantry, item] })),
  removePantryItem: (id: string) =>
    set((state) => ({ pantry: state.pantry.filter((i) => i.id !== id) })),

  shoppingList: [],
  setShoppingList: (items: ShoppingItem[]) => set({ shoppingList: items }),

  reweAuth: { isAuthenticated: false },
  setReweAuth: (auth: ReweAuthState) => set({ reweAuth: auth }),
}));