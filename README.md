# 🛒 EinkaufGott

German meal prep app — macro targets → weekly meal plans → REWE Lieferdienst cart.

Plan your gains, order your grains.

## What it does

EinkaufGott generates weekly meal plans that hit your exact macro targets (protein, carbs, fat, calories) within your maximum cook time, then builds a shopping list and pre-fills your REWE Lieferdienst cart.

```
Set Macros → Generate Week Plan → Check Pantry → Fill REWE Cart → Checkout
     ✅              ✅                ✅              ✅            ✅
```

### Core features

- **Macro targets** — Set daily P/C/F/calorie goals, diet preference (Alles / Vegetarisch / Vegan), max cook time, meals per day
- **Meal plan generator** — Rule-based optimizer picks recipes that best fit your macro targets, scales portions, generates a 7-day plan
- **Meal swap** — Long-press any meal to see alternatives matching the same slot's macros and swap instantly
- **Cook time filter** — Only recipes within your time budget. 15 min? 45 min? Your call
- **100 German recipes** — Omnivore, vegetarian, and vegan with accurate per-serving macros. German ingredients, German instructions
- **Weekly calendar** — Expandable day cards, week navigation, pull-to-refresh, color-coded macro indicators
- **Macro progress rings** — SVG rings showing daily/weekly macro progress against targets (green ≤10%, amber ≤25%, red >25% deviation)
- **Shopping list** — Auto-consolidates ingredients from the entire week, grouped by supermarket aisle (Fleisch, Gemüse, Milchprodukte...), checked items tracked
- **Pantry inventory** — Add items you already have, categories, unit picker. Pantry items auto-excluded from shopping list
- **REWE integration** — Ingredient → REWE product matching with match badges. Deep-link to REWE Lieferdienst search
- **Dark mode** — Full system-level dark mode support. All screens reactive via `useThemeColors()` hook
- **Haptic feedback** — Contextual haptics: tap for buttons, select for picker changes, impact for significant actions, success for completions, heavy for destructive actions
- **Press animations** — Meal cards and swap alternatives scale on press for tactile feel

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Expo 54 (React Native 0.81) + Expo Router 6 |
| State | Zustand 5 + AsyncStorage persistence |
| Language | TypeScript 5.9 |
| SVG | react-native-svg 15 (macro progress rings) |
| Haptics | expo-haptics 15 |
| Recipes | Local seed DB (100 German recipes; Chefkoch API planned) |
| Nutrition | BLS 4.0 (planned) for ingredient-level macro calculation |
| REWE | Product search + deep-link to `shop.rewe.de` |
| CI/CD | GitHub Actions (jest + tsc + web build), EAS Build (OTA channels) |

## Project structure

```
app/
  (tabs)/
    index.tsx        — Home: weekly plan with meal cards, swap modal
    plan.tsx         — Wochenplan: calendar view with expandable days
    shopping.tsx     — Einkauf: shopping list + REWE integration
    pantry.tsx       — Vorrat: pantry inventory, add/remove items
    settings.tsx     — Profil: macro target input, diet, cook time
    _layout.tsx      — Tab layout (5 tabs, dark mode reactive)
  recipe/
    [id].tsx         — Recipe detail (ingredients, steps, macros)
  _layout.tsx        — Root layout (Stack)
data/
  recipes.ts         — Seed recipe database (100 German recipes)
lib/
  types.ts           — All TypeScript types (Recipe, MacroTarget, MealPlan, etc.)
  store.ts           — Zustand store with AsyncStorage persistence
  theme.ts           — LIGHT_COLORS / DARK_COLORS / useThemeColors() / SPACING
  haptics.ts         — Semantic haptic wrappers (tap, impact, heavy, success, select)
  components.tsx     — MacroRing, MacroRingsRow (SVG, accepts ThemeColors)
  meals/
    generator.ts     — generateMealPlan(), findAlternatives(), swapMeal()
  rewe/
    products.ts      — ingredientToReweQuery(), buildReweCheckoutUrl(), searchReweProduct()
  shopping.ts        — generateShoppingList(), toggleChecked(), togglePantry()
__tests__/
  generator.test.ts  — Meal plan generation, alternatives, swap
  swap.test.ts       — findAlternatives + swapMeal logic
  shopping.test.ts   — Shopping list generation, consolidations
  store.test.ts      — Zustand store state management
  rewe.test.ts       — REWE product search + checkout URL building
  recipes.test.ts    — Recipe data integrity, macro sums, constraints
  pantry.test.ts     — Pantry add/remove, shopping list deduction
  integration.test.ts — End-to-end: macros → plan → shopping list → pantry
```

## Getting started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web (port 8082)
npx expo start --web --port 8082

# Production web build
npx expo export --platform web
```

## Testing

```bash
# Run all tests (75 tests across 8 suites)
npx jest --no-cache

# Run a specific test file
npx jest --no-cache __tests__/generator.test.ts

# Watch mode (reruns on file changes)
npm run test:watch

# Type check (must pass with 0 errors)
npx tsc --noEmit

# Full verification (run both before committing)
npx jest --no-cache && npx tsc --noEmit
```

### Test philosophy

- **No mocking of internal logic.** All tests use real `RECIPES` data, real `generateMealPlan()`, and real store state.
- **AsyncStorage is the only external mock** — it's React Native infrastructure, not app logic.
- **Network calls** (`searchReweProduct`) are tested for graceful failure only. No happy-path mocking of external APIs.
- **Every feature needs:** integration test (end-to-end flow) + unit tests (pure functions).

### Manual testing checklist

| Screen | What to verify |
|--------|---------------|
| **Profil** (Settings) | Change calories/protein/carbs/fat with steppers. Switch diet (Alles/Vegetarisch/Vegan). Tap "Wochenplan erstellen" — plan generates with haptic success feedback |
| **Heute** (Home) | Macro rings show weekly averages with color coding. Meal cards display per-meal macros. Long-press a meal → swap modal opens. Tap a meal → recipe detail. Dark mode toggles correctly |
| **Wochenplan** (Plan) | Day cards expand/collapse with haptic select. Week nav arrows shift dates. Pull-to-refresh regenerates plan. Color-coded macros per day |
| **Einkauf** (Shopping) | Items grouped by category. Tap to check off (crossed out, haptic tap). REWE match badges visible. "In den Warenkorb" opens REWE search |
| **Vorrat** (Pantry) | Add items with name, amount, unit, category picker. Delete items with confirmation alert (haptic heavy). Items appear grouped by category |
| **Recipe detail** | Full ingredient list, step-by-step instructions, macro badges, cook time breakdown. Back button works with haptic tap |
| **Dark mode** | Toggle device dark mode → all 6 screens + tab bar update reactively. Cards, text, backgrounds all switch |

### Testing dark mode

1. Open iOS Simulator → Features → Toggle Appearance (or Cmd+Shift+A)
2. On Android emulator → Settings → Developer → Dark appearance
3. On web → browser DevTools → toggle `prefers-color-scheme: dark`

All screens should switch between `LIGHT_COLORS` and `DARK_COLORS` from `lib/theme.ts`.

## Recipe data strategy

V1 uses a local seed database of 100 German recipes. Future versions will integrate:

1. **Chefkoch.de v2 API** — Germany's largest recipe site (300K+ recipes), diet filters, German language
2. **BLS 4.0** — German federal nutrition database (7,140 foods, 138 nutrients, CC BY 4.0) for precise macro recalculation when scaling portions
3. **Open Food Facts DE** — Barcode lookups and REWE product matching

See the [issues](https://github.com/tn819/EinkaufGott/issues) for the full roadmap.

## REWE Lieferdienst integration

REWE has no public API. We use a three-layer approach:

1. **Product search** — `rewerse-engineering` (Go) or Pepesto API for ingredient → REWE SKU mapping
2. **Cart fill** — Add matched products to REWE basket via reverse-engineered API (based on `korb` CLI approach)
3. **Checkout** — Deep-link to `shop.rewe.de` where user confirms delivery slot and pays

User never enters payment data in our app. We handle the cart, REWE handles checkout.

## Naming

**EinkaufGott** (pronounced *EIN-kauf-got*) — German for "shopping god". Because calculating macros and ordering groceries is a divine act.

## License

MIT