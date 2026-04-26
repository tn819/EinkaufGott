import { lookupBarcode } from '../lib/pantry/barcode';

// Mock global fetch
global.fetch = jest.fn();

describe('Barcode Scanner Logic', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('successfully looks up a product from Open Food Facts', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        status: 1,
        product: {
          product_name_de: 'Test Apfel',
          categories_tags: ['en:fruits'],
        }
      })
    });

    const result = await lookupBarcode('12345678');
    expect(result).not.toBeNull();
    expect(result?.ingredient).toBe('Test Apfel');
    expect(result?.category).toBe('obst');
  });

  it('returns null if product is not found', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ status: 0 })
    });

    const result = await lookupBarcode('00000000');
    expect(result).toBeNull();
  });

  it('defaults to "sonstiges" for unknown categories', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        status: 1,
        product: {
          product_name: 'Unknown Item',
          categories_tags: ['en:some-weird-category'],
        }
      })
    });

    const result = await lookupBarcode('88888888');
    expect(result?.category).toBe('sonstiges');
  });
});
