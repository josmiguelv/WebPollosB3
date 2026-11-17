# Pollos B3 — Carta inmersiva v1.2.0

Esta revisión adapta la **organización** de la experiencia mostrada en las capturas de Qehay a la identidad de Pollos B3, sin copiar su marca, textos ni platos.

## Alcance
Solo la ruta `/carta`: columna centrada de máximo 656 px sobre fondo oscuro en escritorio y pantalla completa en móvil; logo oficial B3; hero de producto destacado desde datos reales; fotografías referenciales exclusivamente en vista de diseño; explorador horizontal de productos; categorías sticky; selector bottom sheet y lista grande vertical; precio desde las variantes del catálogo en soles; botón que abre personalización (no añade sin selección).

## Funciones
- Buscar productos, aumentar legibilidad, alternar fondo claro/oscuro.
- Abrir carrito existente y seleccionar categoría desde hoja inferior.
- Modal de producto existente con FLIP a partir de la foto en la lista.
- Respetar movimiento reducido y carga diferida de fotos.
- No inventar promociones, platos, precios, locales, ni contar pedidos populares sin evidencia.

## Preservación de otras páginas
Inicio, Locales, Nosotros, Combos, Pedidos, Cuenta, Checkout y Ayuda quedan sin rediseño. Hero, historias, carrusel, SpinCanvas, carrito animado, TU VERSO WEB y contratos de administración no se modifican.

## Validación
`npm install`, `npm run check:static`, `npm run check`, `npm run build`, `npm run dev`. Abrir `http://localhost:4321/carta` y revisar 360 px, 390 px, tablet y escritorio. Esta revisión requiere además QA visual y funcional en navegador real.
