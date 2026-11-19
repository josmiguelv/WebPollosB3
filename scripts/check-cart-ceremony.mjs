import fs from 'node:fs';
import assert from 'node:assert/strict';

const home=fs.readFileSync('client/src/pages/Home.tsx','utf8');
const carta=fs.readFileSync('client/src/pages/CartaInmersiva.tsx','utf8');
const css=fs.readFileSync('client/src/pages/carta-inmersiva.css','utf8');
const buy=fs.readFileSync('client/src/pages/CartaCompra.tsx','utf8');

for (const [label, source, expected] of [
  ['Viaje del sobre solo en Carta',home,"if (route === '/carta')"],
  ['Sobre creado como DOM temporal',home,"envelope.className = 'b3-order-envelope'"],
  ['El sobre parte del botón Agregar',home,"querySelector<HTMLElement>('.detail-add')"],
  ['Destino de la barra de Mi pedido',home,"querySelector<HTMLElement>('.b3-ci-buybar')"],
  ['Destino calculado para el primer producto',home,"const frameWidth = Math.min(624, window.innerWidth - 24)"],
  ['El vapor empieza al aterrizar',home,"animation.onfinish = () => { cleanup(); setCartArrival(sequence => sequence + 1); };"],
  ['Limpieza al salir de la página',home,"activeEnvelopeFlights.current.forEach(animation => animation.cancel())"],
  ['Respeta movimiento reducido',home,"if (reduceMotion()) { setCartArrival(sequence => sequence + 1); return; }"],
  ['No cambiar lógica de compra',home,"add(item);"],
  ['Cambia el contador en Carta',carta,"function AnimatedOrderSubtotal"],
  ['El subtotal visible anima su cifra',carta,"window.requestAnimationFrame(animate)"],
  ['Paso de señal de llegada',carta,"cartArrival: number;"],
  ['El vapor tiene una clave para reiniciarse',carta,"key={cartArrival} className=\"b3-ci-cart-vapor\""],
  ['Confirmación en la barra',carta,"Añadido al pedido"],
  ['Subtotal real accesible',carta,"aria-label={\"Subtotal \"+soles(total)}"],
  ['Sobre con bordes cuidados',css,".b3-order-envelope{"],
  ['Vapor discreto',css,"@keyframes b3-ci-vapor-rise"],
  ['No alterar flujo de checkout',buy,"step==='payment'"],
  ['No habilitar pagos reales',buy,'<button disabled type="button">Confirmar pedido'],
]) assert.ok(source.includes(expected), label);
assert.ok(home.includes("if (reduceMotion()) return;"),'Mantener animación original fuera de Carta');
assert.ok(carta.includes('className="b3-ci-dish"'), 'No modificar tarjeta por fila');
assert.ok(carta.includes("layoutId: 'b3-image-' + product.id"), 'Mantener FLIP de foto');
assert.ok(home.includes("<SpinCanvas urls={product.spinFrames}"), 'Mantener giro Canvas');
console.log('PASS: sobre → subtotal → vapor, diseño y pagos conservados');
