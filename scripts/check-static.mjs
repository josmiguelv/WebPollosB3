import fs from 'node:fs';
import assert from 'node:assert/strict';
const get = path => fs.readFileSync(new URL(path, import.meta.url),'utf8');
const home = get('../client/src/pages/Home.tsx');
const media = get('../client/src/features/menu/SpinCanvas.tsx');
const styles = get('../client/src/pages/premium.css');
const data = get('../client/src/lib/storefront/catalog.ts');
const html = get('../client/index.html');
for (const [feature, text, token] of [
 ['marca',html,'Pollos B3'],
 ['intro 1,9s',home,'1900'],
 ['historias 4,5s',home,'4500'],
 ['fichas compartidas',home,'layoutId'],
 ['giro por cuadros',media,'requestAnimationFrame'],
 ['zoom 2,3',media,'2.3'],
 ['autogiro 3,5s',media,'3500'],
 ['recomendador',home,'¿Cuánta hambre tienes?'],
 ['carrito animado',home,'cart-flying-dot'],
 ['delivery opcional',home,'navigator.geolocation'],
 ['chat WEB',home,'VITE_TUVERSO_WEB_EMBED_URL'],
 ['adaptador de administración',data,'VITE_B3_PUBLIC_CATALOG_URL'],
 ['adaptación móvil',styles,'@media(max-width:700px)']
]) { assert.ok(text.includes(token),`Falta ${feature}`); console.log('OK',feature); }
for(const text of [home,html]) {
  assert.doesNotMatch(text,/manus|wordpress|__manus__|debug-collector/i,'Marcador de plantilla no eliminado');
}
assert.ok(!fs.existsSync(new URL('../client/public/__manus__/', import.meta.url)));
console.log('Verificaciones estáticas superadas. No sustituyen pruebas de compilación/runtime.');

const router = get('../client/src/lib/navigation.tsx');
const commercial = get('../client/src/pages/CommercialViews.tsx');
const commercialCSS = get('../client/src/pages/commercial.css');
const menuCSS = get('../client/src/pages/menu-express.css');
for (const path of ['/carta','/combos','/locales','/carrito','/checkout','/pedidos','/mi-cuenta','/ayuda']) {
  assert.ok(router.includes(`'${path}'`), `Falta ruta ${path}`);
}
for (const component of ['CartPage','CheckoutPage','OrdersPage','AccountPage','FeaturedIntro','HomePathways']) {
  assert.ok(commercial.includes(`function ${component}`),`Falta vista ${component}`);
}
assert.ok(home.includes('useRoute()'),'Falta integración del router en la web');
assert.ok(home.includes('CartPage') && home.includes('ComboBuilder') && home.includes('MenuSection'),'Falta navegado de páginas reales');
assert.ok(commercialCSS.includes('@media(max-width:760px)'), 'Faltan estilos para móvil');
assert.ok(!home.includes('href="#carta"'),'No dejar enlace antiguo hacia carta en Home');
assert.ok(!get('../client/src/index.css').includes('@import "tailwindcss"'),'No se requiere tailwind');
for (const value of [router,commercial,commercialCSS]) assert.doesNotMatch(value,/\bNFC\b|\bQR\b|wordpress|manus/i,'Aparecen referencias prohibidas');
console.log('Verificación comercial multipágina y restricciones: PASS.');


// Carta gastronómica: nueva experiencia exclusiva de /carta.
const gastroCSS = get('../client/src/pages/menu-gastronomica.css');
assert.ok(home.includes('b3-website--menu'), 'Falta estado exclusivo de carta');
assert.ok(home.includes('className="gastro-menu layout-gutter"'), 'Falta estructura gastronómica');
assert.ok(home.includes('className="gastro-product-grid"'), 'Falta cuadrícula de productos');
assert.ok(home.includes('className="gastro-categories"'), 'Falta filtro por categorías');
assert.ok(home.includes('className="gastro-search"'), 'Falta buscador de productos');
assert.ok(home.includes("layoutId={'b3-image-' + product.id}"), 'Falta layoutId animado en Carta');
assert.ok(home.includes("onClick={() => open(product)}"), 'Falta apertura de ficha original');
assert.ok(!home.includes('<CommercialHero eyebrow="CARTA / EXPERIENCIA INTERACTIVA"'), 'La carta todavía tiene hero alto');
assert.ok(menuCSS.includes('.b3-website--menu .microstrip'), 'Falta ocultar franja en Carta');
assert.ok(gastroCSS.includes('.b3-website--menu .gastro-product-card'), 'Falta diseño foto-prioritario');
assert.ok(gastroCSS.includes('@media(max-width:700px)'), 'Falta optimización móvil en Carta');
assert.ok(home.includes("route==='/locales'&& <><CommercialHero"), 'No debe modificarse la cabecera de Locales');
assert.ok(home.includes("route==='/combos'&& <><CommercialHero"), 'No debe modificarse la cabecera de Combos');
console.log('Carta gastronómica y preservación de otras páginas: PASS.');
