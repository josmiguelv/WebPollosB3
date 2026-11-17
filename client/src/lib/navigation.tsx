import { useEffect, useState } from 'react';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';

/** Client-side navigation keeps the cart, selected delivery mode and chat session mounted.
 * Direct paths are served through the server's SPA fallback (nginx.conf).
 */
export const B3_CARTA_PILOT = import.meta.env.VITE_B3_CARTA_PILOT !== 'false';
export const publicRoutes = ['/', '/carta', '/combos', '/promociones', '/locales', '/carrito', '/checkout', '/pedidos', '/mi-cuenta', '/nosotros', '/ayuda'] as const;
export type PublicRoute = typeof publicRoutes[number];
const allowed = new Set<string>(publicRoutes);
export function routeFromPath(path: string): PublicRoute | '/404' {
  if (B3_CARTA_PILOT) return '/carta';
  const cleaned = path.replace(/\/+$/, '') || '/';
  return allowed.has(cleaned) ? cleaned as PublicRoute : '/404';
}
export function navigate(path: PublicRoute) {
  if (typeof window === 'undefined') return;
  if (B3_CARTA_PILOT) path = '/carta';
  if (window.location.pathname !== path) window.history.pushState({ }, '', path);
  window.dispatchEvent(new Event('b3:navigation'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
export function useRoute(): PublicRoute | '/404' {
  const [path, setPath] = useState<PublicRoute | '/404'>(() => routeFromPath(window.location.pathname));
  useEffect(() => {
    const sync = () => setPath(routeFromPath(window.location.pathname));
    window.addEventListener('popstate', sync);
    window.addEventListener('b3:navigation', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('b3:navigation', sync); };
  }, []);
  return path;
}
export function SiteLink({ to, onClick, children, ...props }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: PublicRoute }) {
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank') return;
    event.preventDefault(); navigate(to);
  };
  return <a href={to} onClick={follow} {...props}>{children}</a>;
}

export const pageTitles: Record<PublicRoute, string> = {
  '/': 'Inicio', '/carta':'Carta interactiva', '/combos':'Arma tu combo', '/promociones':'Promociones', '/locales':'Nuestros locales',
  '/carrito':'Tu carrito', '/checkout':'Finalizar pedido', '/pedidos':'Mis pedidos', '/mi-cuenta':'Mi cuenta', '/nosotros':'Pollos B3', '/ayuda':'Ayuda y atención',
};
