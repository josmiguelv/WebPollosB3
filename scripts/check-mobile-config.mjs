import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Execute the actual pure TypeScript adapter with its type-only import erased.
const path = 'client/src/lib/storefront/mobile-config-adapter.ts';
const source = fs.readFileSync(path, 'utf8');
const compiled = ts.transpileModule(source, {
  fileName: path,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, strict: true },
  reportDiagnostics: true,
});
assert.equal((compiled.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, 'Sintaxis de adapter TS');
const exports = {};
new Function('exports', 'module', compiled.outputText)(exports, {exports});
const { normalizeMobileConfig, applyMobileConfig } = exports;
assert.equal(typeof normalizeMobileConfig, 'function');
assert.equal(typeof applyMobileConfig, 'function');

const endpoint = 'https://surprise-kong-stories-brand.trycloudflare.com/api/v1/mobile/config?appId=com.integrab2g.pollosb3';
const payload = {
  ready: true, revision: 8, appId: 'com.integrab2g.pollosb3', schemaVersion: 1,
  stores: [{
    id: '0221b719-195a-45f9-a54a-08e4ef56625c',
    name: 'Nogales', active: true, address: 'Av. Argentina 1653, Callao 07001',
    latitude: -12.0506096, longitude: -77.1251313, radiusKm: 5,
    isOpen: true, closesAt: '23:00', pickup_enabled: true, delivery_enabled: true,
    deliveryPricingMode: 'PER_KM', deliveryRatePerKmPen: 2.5, deliveryFeePen: null,
  }],
  products: [{
    id: 'be8383ff-eed2-424f-856d-b5606e9262f2', name: 'prueba', category: 'Pollo',
    pricePen: 13, description: '1/4 de Pollo + papas + cremas + ensalada + gaseosa',
    image_url: '/api/v1/mobile/images/856c343c-9c64-42cd-9dd3-7a7019ac6c61',
  }],
};
const change = normalizeMobileConfig(payload, endpoint, true);
assert.equal(change.stores.length, 1);
assert.equal(change.stores[0].name, 'Nogales');
assert.equal(change.stores[0].address, 'Av. Argentina 1653, Callao 07001');
assert.equal(change.stores[0].radiusKm, 5);
assert.equal(change.stores[0].deliveryRatePerKmPen, 2.5);
assert.equal(change.stores[0].deliveryFeePen, null);
assert.equal(change.products.length, 1);
assert.equal(change.products[0].id, payload.products[0].id);
assert.equal(change.products[0].variants[0].price, 13);
assert.equal(change.products[0].categoryId, 'pollo');
assert.equal(change.products[0].imageUrl, '/b3-mobile-images/856c343c-9c64-42cd-9dd3-7a7019ac6c61');
const publicChange = normalizeMobileConfig(payload, endpoint);
assert.equal(publicChange.products[0].imageUrl, 'https://surprise-kong-stories-brand.trycloudflare.com/api/v1/mobile/images/856c343c-9c64-42cd-9dd3-7a7019ac6c61');

const base = {
  products: Array.from({length: 14}, (_, i) => ({
    id: 'demo-' + i, name: 'Ejemplo ' + i, kind: 'pollo', categoryId: 'pollo',
    description: '', available: true, variants: [{id:'v',label:'V',price:20}],
  })),
  categories: [{id:'pollo',name:'Menú'},{id:'combo',name:'Combos'},{id:'bebida',name:'Bebidas'}],
  stories: [], stores: [{id:'old',name:'Local antiguo',address:'Antigua dirección'}],
};
let merged = applyMobileConfig(base,change);
assert.equal(merged.stores.length, 1, 'Locales antiguos eliminados del estado');
assert.equal(merged.stores[0].id, payload.stores[0].id);
assert.equal(merged.products.length, 15, '14 existentes + 1 remoto');
assert.equal(merged.categories.length, 3, 'Pollo utiliza categoría Menú existente');
merged = applyMobileConfig(merged, change);
assert.equal(merged.products.length, 15, 'Ningún duplicado con varias consultas');
merged = applyMobileConfig(merged, normalizeMobileConfig({...payload, stores:[], products:[]},endpoint));
assert.equal(merged.stores.length, 0, 'La lista vacía de locales es autoritativa');
assert.equal(merged.products.length, 15, 'La ausencia de productos en la API no borra los anteriores');
assert.throws(() => normalizeMobileConfig({...payload,ready:false}, endpoint));
assert.throws(() => normalizeMobileConfig({...payload,appId:'otra.app'}, endpoint));
assert.throws(() => normalizeMobileConfig({...payload,stores:[{id:'x'}]}, endpoint));
const main = fs.readFileSync('client/src/pages/Home.tsx','utf8');
const vite = fs.readFileSync('vite.config.ts','utf8');
assert.ok(main.includes('applyMobileConfig(next, mobile.value)'), 'Consumir API desde storefront');
assert.ok(main.includes('cacheMobileProducts(mobile.value)'), 'Persistir productos nuevos');
assert.ok(vite.includes("'/b3-mobile-config'") && vite.includes("'/b3-mobile-images'"), 'Vite proxy para CORS local');
console.log('PASS: 1 local oficial, 14 + 1 productos, sin duplicados, locales reemplazados y producto conservado.');
