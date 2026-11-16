/**
 * Public storefront adapter. It deliberately does NOT assume that the Android
 * app's administration API has a particular URL, protocol or authentication.
 * A full, approved endpoint URL must be supplied by the integrator.
 * Never put administrative credentials in VITE_* variables.
 */
export type ProductKind = 'pollo' | 'combo' | 'bebida' | 'postre' | 'otro';
export type ProductVariant = { id: string; label: string; price: number; available?: boolean };
export type ProductOption = { id: string; label: string; price: number; available?: boolean };
export type B3Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  kind: ProductKind;
  imageUrl?: string;
  videoUrl?: string;
  spinFrames?: string[];
  featured?: boolean;
  available: boolean;
  variants: ProductVariant[];
  sauces?: ProductOption[];
  sauceLimit?: number;
  extras?: ProductOption[];
};
export type B3Category = { id: string; name: string };
export type B3Story = { id: string; title: string; subtitle: string; imageUrl?: string; videoUrl?: string; productId?: string; tone?: string };
export type B3Store = { id: string; name: string; address: string; hoursLabel?: string; open?: boolean; available?: boolean };
export type B3Catalog = { products: B3Product[]; categories: B3Category[]; stories: B3Story[]; stores: B3Store[]; comboDiscounts?: { plateDrink?: number; withDessert?: number } };

const illustrative = [
  { id: 'plato', label: 'Una elección con sabor', tone: 'red' },
  { id: 'brasa', label: 'El ritual de la brasa', tone: 'charcoal' },
  { id: 'compartir', label: 'Momentos para compartir', tone: 'amber' },
  { id: 'bebida', label: 'El acompañamiento ideal', tone: 'red' },
  { id: 'favoritos', label: 'Vuelve por tus favoritos', tone: 'charcoal' },
];

/** DEV ONLY: isolated specimens used for design and interaction testing.
 * Nothing in this fixture is an approved B3 menu, price, offer or location. */
export const designFixtures: B3Catalog = {
  categories: [
    { id: 'pollo', name: 'Pollos a la brasa' },
    { id: 'combo', name: 'Combos' },
    { id: 'bebida', name: 'Bebidas' },
    { id: 'postre', name: 'Postres' },
  ],
  products: [
    { id: 'demo-brasa', name: 'Pollo a la brasa', description: 'Ficha demostrativa para probar el diseño. Contenido y precios no oficiales.', categoryId: 'pollo', kind: 'pollo', featured: true, available: true,
      variants: [{ id: 'cuarto', label: '1/4 de pollo', price: 24.90 }, { id: 'medio', label: '1/2 pollo', price: 41.90 }, { id: 'entero', label: 'Pollo entero', price: 79.90 }],
      sauces: ['Ají', 'Mayonesa', 'Huacatay', 'Rocoto', 'Ketchup'].map((label, id) => ({ id: `s${id}`, label, price: 0 })), sauceLimit: 3,
      extras: [{ id: 'papas', label: 'Papas adicionales', price: 6 }, { id: 'ensalada', label: 'Ensalada', price: 5 }] },
    { id: 'demo-combo', name: 'Combo para compartir', description: 'Ejemplo de composición visual; no es una promoción publicada.', categoryId: 'combo', kind: 'combo', available: true,
      variants: [{ id: 'unico', label: 'Para compartir', price: 58.90 }] },
    { id: 'demo-parrilla', name: 'Opción a la parrilla', description: 'Producto de prueba. La carta real llegará desde administración.', categoryId: 'pollo', kind: 'otro', available: true,
      variants: [{ id: 'individual', label: 'Personal', price: 22.00 }] },
    { id: 'demo-bebida', name: 'Bebida para acompañar', description: 'Producto de muestra sin disponibilidad comercial real.', categoryId: 'bebida', kind: 'bebida', available: true,
      variants: [{ id: 'vaso', label: 'Vaso', price: 7.00 }, { id: 'jarra', label: 'Jarra', price: 14.00 }] },
    { id: 'demo-postre', name: 'Un toque dulce', description: 'Concepto demostrativo. No representa la carta oficial.', categoryId: 'postre', kind: 'postre', available: true,
      variants: [{ id: 'personal', label: 'Porción', price: 12.00 }] },
  ],
  stories: illustrative.map((item) => ({ id: item.id, title: item.label, subtitle: 'Descubre una forma distinta de explorar Pollos B3.', tone: item.tone })),
  stores: [],
  comboDiscounts: {},
};

export const editorialStories: B3Story[] = illustrative.map((item) => ({ id: item.id, title: item.label, subtitle: 'Pollos B3 · Santa Anita', tone: item.tone }));

function validUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value, window.location.origin); return url.protocol === 'https:' || (url.protocol === 'http:' && location.hostname === 'localhost'); } catch { return false; }
}
function isProduct(item: unknown): item is B3Product {
  if (!item || typeof item !== 'object') return false;
  const p = item as Partial<B3Product>;
  return typeof p.id === 'string' && typeof p.name === 'string' && typeof p.categoryId === 'string' && typeof p.description === 'string' &&
    Array.isArray(p.variants) && p.variants.length > 0 && p.variants.every(v => typeof v.id === 'string' && typeof v.label === 'string' && Number.isFinite(v.price) && v.price >= 0);
}
export async function loadPublicCatalog(signal?: AbortSignal): Promise<B3Catalog | null> {
  const url = import.meta.env.VITE_B3_PUBLIC_CATALOG_URL as string | undefined;
  if (!validUrl(url)) return null;
  const result = await fetch(url, { signal, credentials: 'omit', headers: { Accept: 'application/json' } });
  if (!result.ok) throw new Error(`No fue posible consultar el catálogo (${result.status}).`);
  const body: unknown = await result.json();
  if (!body || typeof body !== 'object') throw new Error('Formato de catálogo inválido.');
  const data = body as Partial<B3Catalog>;
  if (!Array.isArray(data.products) || !data.products.every(isProduct) || !Array.isArray(data.categories) || !Array.isArray(data.stores) || !Array.isArray(data.stories)) {
    throw new Error('El contrato público del catálogo no coincide con la versión web.');
  }
  return { products: data.products, categories: data.categories, stories: data.stories, stores: data.stores, comboDiscounts: data.comboDiscounts };
}
export const soles = (value: number) => `S/ ${value.toFixed(2)}`;
