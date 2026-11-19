import type { B3Catalog, B3Category, B3Product, B3Store, ProductKind } from './catalog';

/** Conversion of the publicly documented mobile/config response; no browser or network dependencies.
 * Stores are authoritative; products are additive (upsert by id, never delete absent ids).
 */
export const POLLOS_B3_APP_ID = 'com.integrab2g.pollosb3';

export type B3MobileUpdate = {
  revision?: number;
  stores: B3Store[];
  products: B3Product[];
  categories: B3Category[];
};
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const cleanText = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
const decimal = (value: unknown): number | undefined => {
  if (typeof value !== 'number' && typeof value !== 'string') return;
  if (typeof value === 'string' && !value.trim()) return;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : undefined;
};
const slug = (value: string) => value.toLocaleLowerCase('es-PE').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function classifyCategory(value: unknown): { id: string; label: string; kind: ProductKind } {
  const label = cleanText(value) || 'Otros';
  const id = slug(label);
  if (/^pollo(s)?$/.test(id) || id === 'pollo-a-la-brasa') return { id: 'pollo', label: 'Menú', kind: 'pollo' };
  if (/^combo(s)?$/.test(id)) return { id: 'combo', label: 'Combos', kind: 'combo' };
  if (/^bebida(s)?$/.test(id) || id === 'gaseosas') return { id: 'bebida', label: 'Bebidas', kind: 'bebida' };
  return { id: 'mobile-' + (id || 'otros'), label, kind: 'otro' };
}
function imageUrl(value: unknown, sourceUrl: string, imageProxy: boolean): string | undefined {
  const path = cleanText(value);
  if (!path) return;
  try {
    const endpoint = new URL(sourceUrl);
    const image = new URL(path, endpoint.origin);
    // Do not use untrusted external hosts returned inside a product record.
    if (image.protocol !== 'https:' || image.origin !== endpoint.origin) return;
    const prefix = '/api/v1/mobile/images/';
    if (imageProxy && image.pathname.startsWith(prefix)) {
      return '/b3-mobile-images/' + image.pathname.slice(prefix.length) + image.search;
    }
    return image.href;
  } catch { return; }
}
function readWeeklyHours(value: unknown): Record<string, { open: string; close: string }> | undefined {
  const weekly = object(value);
  if (!weekly) return;
  const result: Record<string, {open:string;close:string}> = {};
  for (const [day, entry] of Object.entries(weekly)) {
    const hours = object(entry);
    if (hours && /^\d{2}:\d{2}$/.test(cleanText(hours.open)) && /^\d{2}:\d{2}$/.test(cleanText(hours.close))) {
      result[day] = { open: cleanText(hours.open), close: cleanText(hours.close) };
    }
  }
  return Object.keys(result).length ? result : undefined;
}
export function normalizeMobileConfig(
  payload: unknown,
  sourceUrl: string,
  imageProxy = false,
): B3MobileUpdate {
  const data = object(payload);
  if (!data || data.ready !== true || data.appId !== POLLOS_B3_APP_ID) {
    throw new Error('La configuración móvil no está lista o pertenece a otra aplicación.');
  }
  if (data.schemaVersion !== undefined && data.schemaVersion !== 1) {
    throw new Error('La versión del contrato móvil no es compatible.');
  }
  if (!Array.isArray(data.stores) || (data.products !== undefined && !Array.isArray(data.products))) {
    throw new Error('La API no devolvió listas válidas de locales y productos.');
  }
  const stores: B3Store[] = [];
  const seenStores = new Set<string>();
  for (const value of data.stores) {
    const raw = object(value);
    const id = cleanText(raw?.id);
    const name = cleanText(raw?.name);
    const address = cleanText(raw?.address);
    if (!raw || !id || !name || !address) {
      // Never clear a previously displayed list using a malformed store response.
      throw new Error('La API devolvió un local incompleto. Se conservan los locales anteriores.');
    }
    if (seenStores.has(id)) continue;
    seenStores.add(id);
    const lng = typeof raw.longitude === 'number' && Number.isFinite(raw.longitude) ? raw.longitude : undefined;
    const latitude = typeof raw.latitude === 'number' && Number.isFinite(raw.latitude) ? raw.latitude : undefined;
    const radius = decimal(raw.radiusKm) ?? decimal(raw.radius_km);
    const deliveryRate = decimal(raw.deliveryRatePerKmPen) ?? decimal(raw.delivery_rate_per_km_pen);
    const fee = decimal(raw.deliveryFeePen) ?? decimal(raw.delivery_fee_pen);
    const closing = cleanText(raw.closesAt);
    const weeklyHours = readWeeklyHours(raw.weeklyHours ?? raw.openingHours ?? raw.opening_hours);
    const open = typeof raw.isOpen === 'boolean' ? raw.isOpen : undefined;
    const pricing = cleanText(raw.deliveryPricingMode ?? raw.delivery_pricing_mode);
    stores.push({
      id, name, address,
      available: raw.active !== false,
      ...(open === undefined ? {} : { open }),
      ...(closing && /^\d{2}:\d{2}$/.test(closing) ? { hoursLabel: 'Cierre: ' + closing } : {}),
      ...(latitude === undefined ? {} : { latitude }),
      ...(lng === undefined ? {} : { longitude: lng }),
      ...(radius === undefined ? {} : { radiusKm: radius }),
      ...(weeklyHours ? { weeklyHours } : {}),
      ...(typeof raw.pickup_enabled === 'boolean' ? { pickupEnabled: raw.pickup_enabled } : {}),
      ...(typeof raw.delivery_enabled === 'boolean' ? { deliveryEnabled: raw.delivery_enabled } : {}),
      ...(typeof raw.dine_in_enabled === 'boolean' ? { dineInEnabled: raw.dine_in_enabled } : {}),
      ...(pricing ? { deliveryPricingMode: pricing } : {}),
      ...(deliveryRate === undefined ? {} : { deliveryRatePerKmPen: deliveryRate }),
      ...(raw.deliveryFeePen === null || raw.delivery_fee_pen === null
        ? { deliveryFeePen: null }
        : fee === undefined ? {} : { deliveryFeePen: fee }),
    });
  }
  const categories: B3Category[] = [];
  const products: B3Product[] = [];
  const seenProducts = new Set<string>();
  const apiProducts: unknown[] = Array.isArray(data.products) ? data.products : [];
  for (const item of apiProducts) {
    const raw = object(item);
    const id = cleanText(raw?.id);
    const name = cleanText(raw?.name);
    const price = decimal(raw?.pricePen) ?? decimal(raw?.price_pen);
    if (!raw || !id || !name || price === undefined || seenProducts.has(id)) continue;
    seenProducts.add(id);
    const category = classifyCategory(raw.category);
    if (!categories.some(c => c.id === category.id)) categories.push({ id: category.id, name: category.label });
    products.push({
      id, name,
      description: cleanText(raw.description),
      categoryId: category.id,
      kind: category.kind,
      imageUrl: imageUrl(raw.image_url ?? raw.imageUrl, sourceUrl, imageProxy),
      available: raw.active !== false && raw.available !== false,
      featured: false,
      variants: [{ id: 'regular', label: 'Presentación', price }],
    });
  }
  return {
    revision: typeof data.revision === 'number' && Number.isFinite(data.revision) ? data.revision : undefined,
    stores, categories, products,
  };
}
/** Existing products survive even if the API stops listing them. Matching ids update in place. */
export function mergeProductsAdditively(
  base: B3Catalog, products: B3Product[], categories: B3Category[],
): B3Catalog {
  const mergedProducts = new Map(base.products.map(item => [item.id, item]));
  for (const product of products) mergedProducts.set(product.id, product);
  const mergedCategories = new Map(base.categories.map(item => [item.id, item]));
  for (const category of categories) {
    if (!mergedCategories.has(category.id)) mergedCategories.set(category.id, category);
  }
  return { ...base, products: [...mergedProducts.values()], categories: [...mergedCategories.values()] };
}
/** Successful mobile response replaces ALL local stores; product merging never deletes. */
export function applyMobileConfig(base: B3Catalog, update: B3MobileUpdate): B3Catalog {
  return { ...mergeProductsAdditively(base, update.products, update.categories), stores: update.stores };
}
