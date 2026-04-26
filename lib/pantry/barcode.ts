import { PantryItem, IngredientCategory, IngredientUnit } from '../types';

export interface OFFProduct {
  product_name_de?: string;
  product_name?: string;
  brands?: string;
  categories_tags?: string[];
  nutriments?: {
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    energy_kcal_100g?: number;
  };
}

export async function lookupBarcode(ean: string): Promise<Partial<PantryItem> | null> {
  try {
    const response = await fetch(`https://de.openfoodfacts.org/api/v0/product/${ean}.json`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p: OFFProduct = data.product;
    const name = p.product_name_de || p.product_name || 'Unbekanntes Produkt';
    
    // Simple category mapping logic
    let category: IngredientCategory = 'sonstiges';
    const tags = p.categories_tags || [];
    if (tags.some(t => t.includes('dairy') || t.includes('cheese'))) category = 'milchprodukte';
    else if (tags.some(t => t.includes('meat'))) category = 'fleisch';
    else if (tags.some(t => t.includes('vegetable'))) category = 'gemüse';
    else if (tags.some(t => t.includes('fruit'))) category = 'obst';

    return {
      ingredient: name,
      category,
      amount: 1,
      unit: 'stück',
    };
  } catch (error) {
    console.error('Barcode lookup failed:', error);
    return null;
  }
}
