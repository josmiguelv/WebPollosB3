# Contrato de integración pendiente — Pollos B3

## 1. Principio de arquitectura

**Web B3 + app Android B3 → mismo administrador, backend y datos.** El navegador nunca debe calcular precios definitivos, stock, delivery o pagos como fuente de verdad. Las reglas sensibles se implementan en el backend existente y cada pedido se revalida de forma transaccional.

No se recibieron ni confirmaron en el ZIP original: URL del backend de administración de la app, rutas REST/GraphQL, contratos de autenticación, disponibilidad por sede, formas de pago, servicios delivery, estructura de pedidos ni widget/embed WEB de TU VERSO. No se ha tocado ninguno de esos sistemas.

## 2. Adaptador ya implementado

`client/src/lib/storefront/catalog.ts` define tipos locales y una función de solo lectura `loadPublicCatalog()` que consulta únicamente `VITE_B3_PUBLIC_CATALOG_URL`, cuando existe. No asume nombres de rutas y no utiliza tokens privilegiados. El endpoint deberá ser público, autorizado para la web y retornar los datos visibles del sitio sin PII.

Contrato esperado por el frontend:

```ts
type B3Catalog = {
  products: Array<{
    id: string; name: string; description: string;
    categoryId: string; kind: 'pollo'|'combo'|'bebida'|'postre'|'otro';
    available: boolean;
    variants: Array<{ id: string; label: string; price: number; available?: boolean }>;
    sauces?: Array<{ id: string; label: string; price: number; available?: boolean }>;
    sauceLimit?: number;
    extras?: Array<{ id: string; label: string; price: number; available?: boolean }>;
    imageUrl?: string; videoUrl?: string; spinFrames?: string[]; featured?: boolean;
  }>;
  categories: Array<{ id: string; name: string }>;
  stores: Array<{ id: string; name: string; address: string; hoursLabel?: string; open?: boolean; available?: boolean }>;
  stories: Array<{ id: string; title: string; subtitle: string; imageUrl?: string; videoUrl?: string; productId?: string; tone?: string }>;
  comboDiscounts?: { plateDrink?: number; withDessert?: number };
};
```

**Importante:** Este contrato es un adaptador sugerido para el frontend, NO una declaración de que el administrador móvil ya lo proporcione. La siguiente fase debe revisar la API existente, reutilizar sus modelos y adaptar el cliente, evitando crear un segundo catálogo.

## 3. Pedidos y disponibilidad (no desarrollados)

Antes de activar `Confirmar pedido`, identificar en el administrador existente los contratos reales de:

- Selección de local y disponibilidad de producto/variante por local.
- Determinación de cobertura y costo delivery (fijo o por km) y alternativa al local más cercano.
- Reserva/revalidación de precios y disponibilidad al finalizar.
- Pedido invitado o autenticado; identificador único e idempotencia.
- Estado de pago y verificación de Yape/Plin/pasarela/pago al recibir.
- Seguimiento seguro de cada pedido y sus transiciones reales.
- Inventario y estados compartidos entre app y web.

**Nunca** crear un pedido o cobrar usando los precios del carrito almacenados en `localStorage`; son solo una presentación temporal editable en el cliente.

El selector delivery/recojo incluido guarda únicamente una preferencia local y solicita ubicación opcional. La geolocalización no valida cobertura, horarios, distancia vial ni tarifa. Debe integrarse el backend antes de aceptar compras.

## 4. Canal WEB de TU VERSO

En esta versión existe una ventana de atención B3. Si el sistema proporciona un embed WEB HTTPS oficial y autorizado, se configura `VITE_TUVERSO_WEB_EMBED_URL`. La integración queda **pendiente de validar** hasta confirmar el verdadero contrato del widget, origen permitido, aislamiento de tenant, sesión, Flow, cola, transferencia a agente y capacidades multimedia.

El widget no abre WhatsApp ni simula una conversación. No se modificaron los canales existentes de TU VERSO ni sus permisos productivos. Los detalles de canal/instancia/Flow/cola pertenecen a la configuración real del backend de TU VERSO, no deben codificarse en el frontend.

Para contexto comercial futuro (producto/pedido/local), usar un mecanismo autorizado y firmado en el servidor; no enviar PII o token de pedido en parámetros accesibles públicamente.

## 5. Fuentes y aprobaciones aún necesarias

- Imágenes y videos oficiales de productos, incluyendo el giro del plato de 8 s.
- Catálogo y promociones aprobadas, locales/horarios, políticas de reclamos y privacidad.
- Acceso de desarrollo documentado al administrador existente de la app.
- Documento técnico del canal WEB de TU VERSO.
- Aprobación para activar envíos y pagos y pruebas en ambiente aislado.
