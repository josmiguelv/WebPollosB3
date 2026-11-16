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
