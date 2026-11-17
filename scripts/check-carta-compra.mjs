import fs from 'node:fs';
import assert from 'node:assert/strict';
const get=p=>fs.readFileSync(p,'utf8');
const carta=get('client/src/pages/CartaInmersiva.tsx');
const home=get('client/src/pages/Home.tsx');
const compra=get('client/src/pages/CartaCompra.tsx');
const styles=get('client/src/pages/carta-compra.css');
const navigation=get('client/src/lib/navigation.tsx');
const main=get('client/src/main.tsx');
for(const [name,text,part] of [
['Compra integrada',carta,'<CartaCompra'],['Barra ver pedido',carta,'b3-ci-buybar'],
['Intro 1.9 segundos',home,'1900'],['Splash preparando carta',home,'PREPARANDO TU CARTA'],
['Redirección al piloto',main,"'/carta'"],['Rutas ocultas',navigation,'B3_CARTA_PILOT'],
['Subflujo carrito',compra,"step==='cart'"],['Subflujo entrega',compra,"step==='delivery'"],
['Subflujo contacto',compra,"step==='contact'"],['Subflujo pago',compra,"step==='payment'"],
['Confirmación bloqueada',compra,'<button disabled type="button">Confirmar pedido'],
['Diseño confinado',styles,'.b3-website--menu .b3-ci-buyflow'],['Carrito persistente',home,'usePersistentCart'],
['Fichas animadas',home,'<ProductDetail'],['Giro Canvas',home,'<SpinCanvas'],['Historias',home,'4500']])
assert.ok(text.includes(part),'Falta: '+name);
assert.ok(!compra.includes('navigate('),'El proceso no debe salir a otra ruta');
assert.ok(!compra.includes('fetch('),'No realizar pedidos hasta integrar backend');
console.log('Compra de Carta en web-app: PASS (verificación estática).');

const subtotalArg = carta.match(/export function CartaInmersiva\(\{[^}]*\btotal\b[^}]*\}\s*:\s*Props\)/);
assert.ok(subtotalArg, 'La Carta debe recibir el subtotal del carrito');
assert.ok(carta.includes('const productCount = matching.length;'), 'El contador del catálogo debe ser independiente');
assert.ok(carta.includes("{productCount} {productCount === 1 ? 'producto' : 'productos'}"), 'El texto de cantidad debe usar productCount');
assert.ok(!carta.includes("const total = matching.length;"), 'No redeclarar total del carrito');
assert.ok(carta.includes('total={total}'), 'El resumen utiliza el importe del pedido');
assert.ok(carta.includes('soles(total)'), 'La barra de compra muestra el subtotal en soles');
console.log('Regresión: contador de productos separado del subtotal: PASS.');
