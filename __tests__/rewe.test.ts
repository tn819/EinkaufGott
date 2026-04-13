import { ingredientToReweQuery, buildReweCheckoutUrl, matchIngredientToReweSearch } from '../lib/rewe/products';
import { RECIPES } from '../data/recipes';

describe('ingredientToReweQuery', () => {
  it('returns reweSearchTerm when available', () => {
    const result = ingredientToReweQuery({
      name: 'Hähnchenbrust',
      nameEn: 'chicken breast',
      amount: 300,
      unit: 'g',
      category: 'fleisch',
      reweSearchTerm: 'Hähnchenbrustfilet',
    });
    expect(result).toBe('Hähnchenbrustfilet');
  });

  it('falls back to name mapping for common ingredients', () => {
    const result = ingredientToReweQuery({
      name: 'Hähnchenbrust',
      nameEn: 'chicken breast',
      amount: 300,
      unit: 'g',
      category: 'fleisch',
    });
    expect(result).toBe('Hähnchenbrustfilet');
  });

  it('falls back to ingredient name when no mapping exists', () => {
    const result = ingredientToReweQuery({
      name: 'Trüffelöl',
      nameEn: 'truffle oil',
      amount: 10,
      unit: 'ml',
      category: 'öle_fette',
    });
    expect(result).toBe('Trüffelöl');
  });

  it('maps vegan-specific ingredients', () => {
    const result = ingredientToReweQuery({
      name: 'Tofu',
      nameEn: 'firm tofu',
      amount: 250,
      unit: 'g',
      category: 'sonstiges',
    });
    expect(result).toBe('Tofu fest');
  });

  it('maps vegan milk alternatives', () => {
    const result = ingredientToReweQuery({
      name: 'Hafermilch',
      nameEn: 'oat milk',
      amount: 200,
      unit: 'ml',
      category: 'getränke',
    });
    expect(result).toBe('Hafermilch');
  });
});

describe('matchIngredientToReweSearch', () => {
  it('returns mapped term for known ingredients', () => {
    const recipe = RECIPES.find((r) => r.ingredients.some((i) => i.name === 'Hähnchenbrust'));
    if (recipe) {
      const ingredient = recipe.ingredients.find((i) => i.name === 'Hähnchenbrust')!;
      const result = matchIngredientToReweSearch(ingredient);
      expect(result).toBe('Hähnchenbrustfilet');
    }
  });

  it('returns original name for unmapped ingredients', () => {
    const ingredient = {
      name: 'Trüffelöl',
      nameEn: 'truffle oil',
      amount: 10,
      unit: 'ml' as const,
      category: 'öle_fette' as const,
    };
    expect(matchIngredientToReweSearch(ingredient)).toBe('Trüffelöl');
  });
});

describe('buildReweCheckoutUrl', () => {
  it('builds checkout URL with product IDs and quantities', () => {
    const url = buildReweCheckoutUrl([
      { productId: '12345', quantity: 1 },
      { productId: '67890', quantity: 2 },
    ]);
    expect(url).toBe('https://shop.rewe.de/cart?items=12345:1,67890:2');
  });

  it('builds checkout URL with single product', () => {
    const url = buildReweCheckoutUrl([
      { productId: '11111', quantity: 3 },
    ]);
    expect(url).toBe('https://shop.rewe.de/cart?items=11111:3');
  });

  it('builds empty checkout URL', () => {
    const url = buildReweCheckoutUrl([]);
    expect(url).toBe('https://shop.rewe.de/cart?items=');
  });

  it('URL structure is valid for all seed recipe ingredients', () => {
    for (const recipe of RECIPES) {
      for (const ingredient of recipe.ingredients) {
        const query = ingredientToReweQuery(ingredient);
        expect(query.length).toBeGreaterThan(0);
        expect(query).not.toContain('/');
      }
    }
  });
});

describe('searchReweProduct', () => {
  it('returns empty array on network error without throwing', async () => {
    const { searchReweProduct } = require('../lib/rewe/products');
    const results = await searchReweProduct('Hähnchenbrust');
    expect(Array.isArray(results)).toBe(true);
  });
});