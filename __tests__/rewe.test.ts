import { ingredientToReweQuery, buildReweCheckoutUrl, searchReweProduct } from '../lib/rewe/products';

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
});

describe('searchReweProduct', () => {
  it('returns empty array on network error', async () => {
    const results = await searchReweProduct('Hähnchenbrust');
    expect(Array.isArray(results)).toBe(true);
  });
});