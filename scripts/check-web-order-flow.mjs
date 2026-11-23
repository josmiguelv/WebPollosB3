import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const flow=fs.readFileSync('client/src/lib/storefront/web-order-flow.ts','utf8');
const adapter=fs.readFileSync('client/src/lib/storefront/mobile-config-adapter.ts','utf8');
const types=fs.readFileSync('client/src/lib/storefront/catalog.ts','utf8');
for(const part of [
  'validatePublishedCart','UUID.test(item.productId)','data.revision',
  "variable:'Productos'","variable:'Subtotal'","variable:'Dirección y referencia'",
  "client.prepareInteraction","api.prepareInteraction",
  "api.createInteraction(entry)","api.sendInteractionMessage(entry)",
  "api.checkAgentAvailability","api.pollInteraction(entry)",
  "api.beginPaymentWait(entry)", "api.cancelInteraction(entry,{reason:'CANCEL'})",
]) {
  // client.prepareInteraction was renamed to api.prepareInteraction;
  if(part==='client.prepareInteraction')continue;
  assert.ok(flow.includes(part),'Falta regla '+part);
}
assert.ok(!flow.includes("type:'TEXT'"), 'El formulario no se degrada a TEXT');
assert.ok(flow.includes("if(store.consultOrderAvailability!==true)"), 'Sólo consultar agente si está activado');
assert.ok(adapter.includes("consultOrderAvailability"), 'Leer la configuración de aprobación por sede');
assert.ok(adapter.includes("paymentMethods"), 'Leer medios publicados');
assert.ok(types.includes("revision?: number"), 'Guardar versión publicada');
const parsed=ts.createSourceFile('web-order-flow.ts',flow,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
assert.equal(parsed.parseDiagnostics.length,0,'El módulo TypeScript debe analizarse');
console.log('PASS: flujo comercial web aislado, sin alterar checkout visual.');
