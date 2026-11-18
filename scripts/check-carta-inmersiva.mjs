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
 ['FLIP',carta,"layoutId: 'b3-image-' + product.id"],
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

assert.ok(carta.includes('<CartaCompra'),'Compra dentro del marco de Carta');
assert.ok(carta.includes('b3-ci-buybar'),'Barra de Mi pedido');

assert.ok(carta.includes('<VideoGiroDemo fallbackImage={lead?.imageUrl}/>'),'Video de demostración dentro de Carta');
const giro = fs.readFileSync('client/src/pages/VideoGiroDemo.tsx','utf8');
assert.ok(giro.includes('IntersectionObserver') && giro.includes('video.pause()'),'Control de consumo fuera de pantalla');
assert.ok(giro.includes('mediaError') && giro.includes('fallbackImage'),'Fallback si falta video');
assert.ok(giro.includes('!reduced') && giro.includes('loop muted playsInline'),'Accesibilidad y reproducción silenciosa');
assert.ok(carta.includes('B3_CARTA_PILOT && <VideoGiroDemo'),'Video visible durante el piloto, sin depender del catálogo demo');
assert.ok(carta.includes('href="#b3-video-giro"'),'Acceso visible al video desde el inicio');
assert.ok(giro.includes('id="b3-video-giro"'),'Ancla de video');
const clip = fs.statSync('client/public/media/b3-giro-demo.mp4');
const poster = fs.statSync('client/public/media/b3-giro-poster.webp');
assert.ok(clip.size > 50000 && clip.size < 200000,'Video real optimizado incluido en GitHub');
assert.ok(poster.size > 1000 && poster.size < 100000,'Poster incluido en GitHub');

// Regression: the Stories component must not reference an undeclared demo variable.
assert.ok(home.includes('function Stories({ stories, onProduct, demo }'), 'Demo declarado en Historias');
assert.ok(home.includes('onProduct={openById} demo={demo}/>'), 'Propiedad demo transmitida a Historias');

assert.ok(carta.includes('function FlipDishPhoto('), 'Imagen giratoria integrada');
assert.ok(carta.includes('setFlipped(previous => !previous)'), 'El giro es reversible');
assert.ok(styles.includes('.b3-ci-flip-inner.is-flipped'), 'Transformacion CSS 3D');
assert.ok(carta.includes('const mainButton ='), 'Comprar con ficha original');

const previewVideo = fs.readFileSync('client/src/pages/VideoGiroDemo.tsx','utf8');
assert.ok(previewVideo.includes('b3-medio-pollo-giro.mp4'), 'Video nuevo incluido en GitHub');
assert.ok(previewVideo.includes('b3-giro-demo.mp4'), 'Video existente como respaldo');
assert.ok(previewVideo.includes('setUseExistingClip(true)'), 'Fallback automatico cuando falta video nuevo');


// Control de correspondencia catálogo-fotografías: todas deben estar publicadas en public/menu.
const menuMap = [...catalog.matchAll(/photo: '([^']+)'/g)].map(match => match[1]);
assert.equal(menuMap.length, 14, 'La demo debe tener exactamente 14 artículos visuales');
for (const name of menuMap) {
  const photo = fs.statSync('client/public/menu/' + name + '.webp');
  assert.ok(photo.size > 4000, 'Foto requerida y optimizada: ' + name);
}
const medioVideo = fs.statSync('client/public/media/b3-medio-pollo-giro.mp4');
const medioPoster = fs.statSync('client/public/media/b3-medio-pollo-poster.webp');
assert.ok(medioVideo.size > 50000 && medioVideo.size < 300000, 'Video nuevo real, optimizado y versionado');
assert.ok(medioPoster.size > 5000, 'Poster del video nuevo versionado');
console.log('14 imágenes y video publicados en GitHub: PASS.');

const jumpSource = carta.slice(carta.indexOf('const moveTo = '),carta.indexOf('const available =',carta.indexOf('const moveTo = ')));
assert.ok(jumpSource.includes('window.scrollTo({ top,'), 'Las categorias desplazan verticalmente la pagina');
assert.ok(jumpSource.includes('rail.scrollTo({ left,'), 'El chip desplaza solo su rail horizontal');
assert.ok(!jumpSource.includes('.scrollIntoView('), 'Nunca desplazar documento desde la barra de chips');
assert.ok(jumpSource.includes('wasSheetOpen') && jumpSource.includes('requestAnimationFrame'), 'La hoja de categorias libera el bloqueo antes de desplazar');
assert.ok(carta.includes('className="b3-ci-flip-back-heading"'), 'Reverso con descripcion editorial breve');
assert.ok(carta.includes('className="b3-ci-flip-includes"'), 'Componentes de plato ordenados');
assert.ok(carta.includes('className="b3-ci-flip-bottom"'), 'Pie de reverso premium');
assert.ok(styles.includes('object-fit:contain;'), 'Fotografias sin recortes');
console.log('Categoria: ejes de scroll separados; fotos completas y reverso refinado: PASS');
