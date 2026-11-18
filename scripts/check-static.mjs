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
 ['intro fuera del piloto 1,9s',home,'STANDARD_INTRO_MS = 1900'],
 ['intro piloto total 3s',home,'CARTA_SPLASH_TOTAL_MS = 3000'],
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
assert.ok(home.includes('CartPage') && home.includes('ComboBuilder') && home.includes('CartaInmersiva'),'Falta navegado de páginas reales');
assert.ok(commercialCSS.includes('@media(max-width:760px)'), 'Faltan estilos para móvil');
assert.ok(!home.includes('href="#carta"'),'No dejar enlace antiguo hacia carta en Home');
assert.ok(!get('../client/src/index.css').includes('@import "tailwindcss"'),'No se requiere tailwind');
for (const value of [router,commercial,commercialCSS]) assert.doesNotMatch(value,/\bNFC\b|\bQR\b|wordpress|manus/i,'Aparecen referencias prohibidas');
console.log('Verificación comercial multipágina y restricciones: PASS.');


// Carta inmersiva solo en /carta.
const ci = get('../client/src/pages/CartaInmersiva.tsx');
const ciCss = get('../client/src/pages/carta-inmersiva.css');
assert.ok(home.includes("route==='/carta'&& <CartaInmersiva"),'Carta inmersiva integrada');
assert.ok(!home.includes('function MenuSection('),'Se eliminó la Carta anterior del render');
assert.ok(ci.includes('b3-ci-shell')&&ci.includes('b3-ci-lead')&&ci.includes('b3-ci-dish'),'Carta vertical gastronómica');
assert.ok(ci.includes('b3-ci-sheet') && ci.includes('b3-ci-chips'),'Selector inferior de categorías');
assert.ok(ci.includes('setSearchOpen')&&ci.includes('setLargeText')&&ci.includes('setLightTheme'),'Controles funcionales');
assert.ok(ci.includes('layoutId={`b3-image-${product.id}`}'),'FLIP preservado');
assert.ok(ciCss.includes('max-width:656px')&&ciCss.includes('.b3-website--menu'),'Diseño central limitado a Carta');
assert.ok(home.includes("route==='/locales'&& <><CommercialHero"),'Locales intacto');
assert.ok(home.includes("route==='/combos'&& <><CommercialHero"),'Combos intacto');
console.log('Carta inmersiva Pollos B3 / v1.2.0: PASS.');

\n// Regression: JSX syntax must be parsed before deployment; text-pattern tests alone are insufficient.
import ts from 'typescript';
for (const name of ['Home.tsx','CartaInmersiva.tsx','CartaCompra.tsx','VideoGiroDemo.tsx']) {
  const path = new URL('../client/src/pages/' + name, import.meta.url);
  const source = ts.createSourceFile(name, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  assert.equal(source.parseDiagnostics.length, 0,
    name + ' contiene un error de sintaxis JSX: ' + source.parseDiagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')).join('; '));
  console.log('PASS sintaxis TSX:',name);
}
