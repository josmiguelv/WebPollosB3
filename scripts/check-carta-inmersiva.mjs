import fs from 'node:fs';
import assert from 'node:assert/strict';
const home = fs.readFileSync('client/src/pages/Home.tsx','utf8');
const carta = fs.readFileSync('client/src/pages/CartaInmersiva.tsx','utf8');
const styles = fs.readFileSync('client/src/pages/carta-inmersiva.css','utf8');
const catalog = fs.readFileSync('client/src/lib/storefront/catalog.ts','utf8');
for(const [name,source,token] of [
 ['Ruta exclusiva /carta',home,"route==='/carta'&& <CartaInmersiva"],
 ['Plato destacado',carta,'b3-ci-lead'],
 ['Carrusel horizontal',carta,'b3-ci-reel'],
 ['Lista de una columna',styles,'.b3-ci-dish'],
 ['Categories bottom sheet',carta,'b3-ci-sheet-layer'],
 ['Selector de categoría',carta,'moveTo(cat.id)'],
 ['Búsqueda',carta,'setQuery(event.target.value)'],
 ['Accesibilidad de tipografía',carta,'setLargeText'],
 ['Color de marca',styles,'#FE1601'],
 ['Ancho móvil centrado',styles,'max-width:656px'],
 ['Datos oficiales desde adaptador',catalog,'loadPublicCatalog'],
 ['FLIP',carta,'layoutId={`b3-image-${product.id}`}'],
 ['Modal de personalización',home,'<ProductDetail'],
 ['Giro Canvas',home,'<SpinCanvas'],
 ['Historias',home,'4500'],
 ['Carrito animado',home,'flyToCart'],
 ['Sin cambios en otras páginas',home,"route==='/locales'&& <><CommercialHero"],
]) { assert.ok(source.includes(token),'Falta '+name); console.log('PASS',name); }
assert.ok(!carta.includes('115 platos'),'No inventar conteos de productos');
assert.ok(!carta.includes('Jalea Mixta'),'No copiar menú de otro restaurante');
assert.ok(carta.includes('design-notice')&&carta.includes('FOTOGRAFÍA REFERENCIAL'),'Etiquetado demo');
console.log('Comprobación estática Carta Inmersiva: PASS.');
