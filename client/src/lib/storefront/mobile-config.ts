import type { B3Category, B3Product } from './catalog';
import { getB3MobileApiBase } from './api-base';
import { normalizeMobileConfig, mergeProductsAdditively, POLLOS_B3_APP_ID } from './mobile-config-adapter';
import type { B3MobileUpdate } from './mobile-config-adapter';

/** La configuración, sus imágenes y el motor de pedidos usan VITE_B3_API_BASE_URL.
 * El túnel trycloudflare es temporal; cambiar únicamente la variable del .env.
 */
const STORAGE_KEY = 'b3-mobile-products-v1:' + POLLOS_B3_APP_ID;
type ProductCache = { products: B3Product[]; categories: B3Category[] };
function configuredEndpoint(): string {
  const endpoint = new URL(getB3MobileApiBase() + '/config');
  endpoint.searchParams.set('appId', POLLOS_B3_APP_ID);
  return endpoint.href;
}
export async function loadMobileConfig(signal?: AbortSignal): Promise<B3MobileUpdate> {
  const endpoint = configuredEndpoint();
  // Vite proxy avoids CORS in local development. Production must enable CORS
  // for the deployed website, or configure a same-origin reverse proxy.
  const url = import.meta.env.DEV ? '/b3-mobile-config?appId=' + encodeURIComponent(POLLOS_B3_APP_ID) : endpoint;
  const response = await fetch(url, {
    signal, credentials: 'omit', cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Error HTTP ' + response.status + ' consultando locales B3.');
  const body: unknown = await response.json();
  return normalizeMobileConfig(body, endpoint, import.meta.env.DEV);
}
const validCacheProduct = (value: unknown): value is B3Product => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<B3Product>;
  return typeof v.id === 'string' && v.id.length > 0 && typeof v.name === 'string'
    && typeof v.description === 'string' && typeof v.categoryId === 'string'
    && Array.isArray(v.variants) && v.variants.length > 0
    && v.variants.every(item => Number.isFinite(item.price) && item.price >= 0);
};
export function readCachedMobileProducts(): ProductCache {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { products: [], categories: [] };
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') throw new Error('Invalid cache');
    const value = saved as Partial<ProductCache>;
    return {
      products: Array.isArray(value.products) ? value.products.filter(validCacheProduct).slice(0, 250) : [],
      categories: Array.isArray(value.categories)
        ? value.categories.filter((c): c is B3Category => Boolean(c && typeof c.id === 'string' && typeof c.name === 'string')).slice(0, 80)
        : [],
    };
  } catch { return { products: [], categories: [] }; }
}
export function cacheMobileProducts(update: B3MobileUpdate): void {
  try {
    const old = readCachedMobileProducts();
    // Persist the additive set in this browser, without retaining obsolete store lists.
    const combined = mergeProductsAdditively(
      { products: old.products, categories: old.categories, stores: [], stories: [] },
      update.products, update.categories,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      products: combined.products.slice(-250), categories: combined.categories,
    }));
  } catch { /* localStorage can be disabled; live response still works. */ }
}
