/**
 * Único origen configurable para las APIs móviles públicas de Pollos B3.
 * VITE_B3_API_BASE_URL acepta https://dominio o https://dominio/api/v1/mobile.
 * Las rutas reales están definidas en código; solo cambia el host.
 * Nunca colocar claves o tokens administrativos en variables VITE_.
 */
export const DEFAULT_B3_API_BASE_URL = 'https://surprise-kong-stories-brand.trycloudflare.com';

export function getB3ApiOrigin(): string {
  const configured =
    (import.meta.env.VITE_B3_API_BASE_URL as string | undefined)?.trim()
    || (import.meta.env.VITE_B3_MOBILE_CONFIG_URL as string | undefined)?.trim()
    || DEFAULT_B3_API_BASE_URL;
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('La URL de la API de Pollos B3 debe utilizar HTTPS sin credenciales.');
  }
  return url.origin;
}
export function getB3MobileApiBase(): string {
  return getB3ApiOrigin() + '/api/v1/mobile';
}
