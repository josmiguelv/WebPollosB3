import fs from 'node:fs';
import assert from 'node:assert/strict';
const android = fs.readFileSync('client/public/b3-order-availability-android.js','utf8');
const bridge = fs.readFileSync('client/src/lib/storefront/web-order-transport.ts','utf8');
const vite = fs.readFileSync('vite.config.ts','utf8');
assert.ok(android.includes("function normalizeOrderForm(form)"), 'Contrato del formulario Android conservado');
assert.ok(android.includes("const labels=['Productos','Subtotal','Dirección y referencia']"), 'FORM actual de tres campos, no inventar variantes');
assert.ok(android.includes("type:'FORM'"), 'Se exige tipo FORM');
assert.ok(android.includes("messageIdempotencyKey"), 'Idempotencia separada del FORM');
assert.ok(android.includes("messageDeliveryUncertain"), 'Incertidumbre sin reenvío duplicado');
assert.ok(android.includes("operationalConversationStatus"), 'Cierre de conversación comprobado');
assert.ok(android.includes("root.sessionStorage.getItem(INTERACTION_KEY"), 'Identificadores sensibles solo durante sesión web');
assert.ok(!android.includes("root.localStorage.setItem(INTERACTION_KEY"), 'No conservar la interacción y el contacto en almacenamiento permanente web');
for(const operation of ['INTERACTION_CREATE','INTERACTION_MESSAGE','INTERACTION_STATUS','INTERACTION_CANCEL','DELIVERY_QUOTE','AGENT_AVAILABILITY']) {
  assert.ok(bridge.includes(operation), 'Operación sin transportar: '+operation);
}
assert.ok(bridge.includes("headers['X-Order-Access-Key']"), 'Usar acceso por interacción');
assert.ok(bridge.includes("headers['Idempotency-Key']"), 'Usar claves idempotentes');
assert.ok(bridge.includes("credentials:'omit'"), 'Sin cookies administrativas');
assert.ok(bridge.includes("redirect:'error'"), 'Sin redirects entre proveedores');
assert.ok(!bridge.includes("localStorage.setItem"), 'El transporte nunca persiste secretos');
assert.ok(vite.includes("'/b3-mobile-api'"), 'Proxy API en Vite de desarrollo');
console.log('PASS: motor Android reutilizado, FORM y transporte web aislado (sin activar pedidos).');
