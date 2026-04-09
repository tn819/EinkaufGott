# 🛒 EinkaufGott

German meal prep app — macro targets → weekly meal plans → REWE Lieferdienst cart.

Plan your gains, order your grains.

## What it does

EinkaufGott generates weekly meal plans that hit your exact macro targets (protein, carbs, fat, calories) within your maximum cook time, then builds a shopping list and pre-fills your REWE Lieferdienst cart.

```
Set Macros → Generate Week Plan → Check Pantry → Fill REWE Cart → Checkout
     ✅              ✅                ⚠️                ✅            ✅
```

### Core features

- **Macro targets** — Set daily P/C/F/calorie goals, diet preference (Alles / Vegetarisch / Vegan), max cook time, meals per day
- **Meal plan generator** — Rule-based optimizer picks recipes that best fit your macro targets, scales portions, generates a 7-day plan
- **Cook time filter** — Only recipes within your time budget. 15 min? 45 min? Your call
- **42 German recipes** — Omnivore, vegetarian, and vegan with accurate per-serving macros. German ingredients, German instructions
- **Shopping list** — Auto-consolidates ingredients from the entire week, grouped by supermarket aisle (Fleisch, Gemüse, Milchprodukte...)
- **Pantry check** — Mark items you already have, they disappear from the shopping list
- **REWE integration** — Ingredient → REWE product matching. Deep-link to REWE Lieferdienst checkout with cart pre-filled

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Expo (React Native) + Expo Router |
| State | Zustand |
| Language | TypeScript |
| Recipes | Local seed DB (Chef koch API integration planned) |
| Nutrition | BLS 4.0 (planned) for ingredient-level macro calculation |
| REWE | `rewerse-engineering` product search + deep-link checkout |
| Persistence | AsyncStorage (planned) |

## Project structure

```
app/
  (tabs)/
    index.tsx        — Home: weekly plan overview with macro totals
    settings.tsx     — Macro target input (P/C/F, cook time, diet)
    shopping.tsx     — Shopping list grouped by category
  recipe/
    [id].tsx         — Recipe detail (ingredients, steps, macros, cook time)
  _layout.tsx        — Root layout
data/
  recipes.ts         — Seed recipe database (42 German recipes)
lib/
  types.ts           — TypeScript types (Recipe, MacroTarget, MealPlan, etc.)
  store.ts           — Zustand store
  theme.ts           — Design tokens (COLORS, SPACING)
  meals/
    generator.ts     — Meal plan generation algorithm
  rewe/
    products.ts      — REWE product search + checkout URL builder
  shopping.ts        — Shopping list generation + pantry deduction
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
```

## Recipe data strategy

V1 uses a local seed database. Future versions will integrate:

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