import type { Ingredient, ReweProduct } from '../types';

const REWE_API_BASE = 'https://mobile-api.rewe.de/api/v2';

interface ReweSearchResult {
  productId: string;
  name: string;
  brand?: string;
  price: number;
  unit: string;
  imageUrl?: string;
  ean?: string;
}

export async function searchReweProduct(query: string, storeId?: string): Promise<ReweSearchResult[]> {
  try {
    const url = `${REWE_API_BASE}/search?query=${encodeURIComponent(query)}${storeId ? `&storeId=${storeId}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ReweMobile/6.0',
      },
    });

    if (!response.ok) {
      console.warn('REWE search failed:', response.status);
      return [];
    }

    const data = await response.json();
    return (data.products ?? data.items ?? []).slice(0, 5).map((p: any) => ({
      productId: String(p.id ?? p.productId ?? ''),
      name: p.productName ?? p.name ?? '',
      brand: p.brandName ?? p.brand ?? undefined,
      price: p.currentPrice ?? p.price ?? 0,
      unit: p.unit ?? p.quantity ?? '',
      imageUrl: p.images?.[0]?.url ?? p.imageUrl ?? undefined,
      ean: p.ean ?? undefined,
    }));
  } catch (error) {
    console.warn('REWE search error:', error);
    return [];
  }
}

export function buildReweCheckoutUrl(products: { productId: string; quantity: number }[]): string {
  const params = products
    .map((p) => `${p.productId}:${p.quantity}`)
    .join(',');
  return `https://shop.rewe.de/cart?items=${params}`;
}

export function matchIngredientToReweSearch(ingredient: Ingredient): string {
  if (ingredient.reweSearchTerm) return ingredient.reweSearchTerm;

  const nameMap: Record<string, string> = {
    'Hähnchenbrust': 'Hähnchenbrustfilet',
    'Rinderhack': 'Rinder Hackfleisch',
    'Putenschnitzel': 'Putenbrust',
    'Lachsfilet': 'Lachs frisch',
    'Thunfisch im eigenen Saft': 'Thunfisch eigenen Saft',
    'Garnelen': 'Garnelen geschält',
    'Magerquark': 'Magerquark',
    'Griechischer Joghurt': 'Griechischer Joghurt',
    'Hüttenkäse': 'Hüttenkäse',
    'Feta': 'Feta',
    'Mozzarella': 'Mozzarella',
    'Parmesan': 'Parmesan frisch',
    'Sahne': 'Schlagsahne',
    'Butter': 'Butter',
    'Sauerrahm': 'Sauerrahm',
    'Proteinpulver Vanille': 'Proteinpulver Vanille',
    'Basmatireis': 'Basmatireis',
    'Quinoa': 'Quinoa',
    'Vollkornnudeln': 'Vollkornnudeln',
    'Nudeln': 'Nudeln',
    'Sobanudeln': 'Soba Nudeln',
    'Haferflocken': 'Haferflocken',
    'Fusilli': 'Fusilli Nudeln',
    'Tortilla-Wrap': 'Tortilla Wraps',
    'Vollkornbrot': 'Vollkornbrot',
    'Reiswaffeln': 'Reiswaffeln',
    'Granola': 'Granola Müsli',
    'Blätterteig': 'Blätterteig',
    'Kokosmilch': 'Kokosmilch',
    'Hafermilch': 'Hafermilch',
    'Gemüsebrühe': 'Gemüsebrühe',
    'Passierte Tomaten': 'Passierte Tomaten',
    'Tomatenmark': 'Tomatenmark',
    'Sojasauce': 'Sojasauce',
    'Erdnussbutter': 'Erdnussbutter',
    'Tahini': 'Tahini Sesammus',
    'Reisessig': 'Reisessig',
    'Balsamico': 'Balsamico Essig',
    'Joghurtdressing': 'Joghurt Dressing',
    'Rote Linsen': 'Rote Linsen',
    'Kidneybohnen': 'Kidneybohnen Dose',
    'Kichererbsen': 'Kichererbsen Dose',
    'Schwarze Bohnen': 'Schwarze Bohnen Dose',
    'Edamame': 'Edamame',
    'Tofu': 'Tofu fest',
    'Chiasamen': 'Chiasamen',
    'Hanfsamen': 'Hanfsamen',
    'Leinsamen': 'Leinsamen',
    'Honig': 'Honig',
    'Ahornsirup': 'Ahornsirup',
    'Oliveöl': 'Olivenöl',
    'Sesamöl': 'Sesamöl',
    'Paprika': 'Paprika',
    'Brokkoli': 'Brokkoli',
    'Zucchini': 'Zucchini',
    'Spinat': 'Blattspinat',
    'Kartoffeln': 'Kartoffeln',
    'Süßkartoffel': 'Süßkartoffel',
    'Champignons': 'Champignons',
    'Tomate': 'Tomaten',
    'Gurke': 'Gurke',
    'Karotte': 'Karotten',
    'Rotkohl': 'Rotkohl',
    'Grüner Spargel': 'grüner Spargel',
    'Zwiebel': 'Zwiebeln',
    'Rote Zwiebel': 'rote Zwiebeln',
    'Knoblauch': 'Knoblauch',
    'Ingwer': 'Ingwer',
    'Salat': 'Blattsalat',
    'Mixsalat': 'Mixed Salat',
    'Basilikum': 'Basilikum frisch',
    'Banane': 'Banane',
    'Apfel': 'Apfel',
    'Heidelbeeren': 'Heidelbeeren',
    'Blaubeeren': 'Blaubeeren',
    'Mango': 'Mango',
    'Limette': 'Limette',
    'Zitrone': 'Zitrone',
    'Eier': 'Eier',
    'Walnüsse': 'Walnüsse',
    'Mandeln': 'Mandeln',
    'Rosinen': 'Rosinen',
    'Oliven': 'Oliven',
    'Mais': 'Mais',
    'Cherrytomaten': 'Cherrytomaten',
    'Gefrorene Beeren': 'gefrorene Beeren',
    'Salz': 'Salz',
    'Pfeffer': 'Pfeffer',
    'Paprikapulver': 'Paprikapulver',
    'Kreuzkümmel': 'Kreuzkümmel',
    'Currypulver': 'Currypulver',
    'Chilipulver': 'Chili',
    'Kurkuma': 'Kurkuma',
    'Oregano': 'Oregano',
    'Backpulver': 'Backpulver',
  };

  if (nameMap[ingredient.name]) return nameMap[ingredient.name];
  return ingredient.name;
}

export function ingredientToReweQuery(ingredient: Ingredient): string {
  return matchIngredientToReweSearch(ingredient);
}