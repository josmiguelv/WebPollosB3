# Carta gastronómica Pollos B3 · v1.1.3

## Diseño
La ruta **/carta** se organiza como una carta digital práctica para una pollería peruana: cabecera compacta, buscador, categorías provenientes del administrador, fotografías protagonistas, variantes y cremas a través del modal original, precio en soles y producto visible rápidamente en pantallas móviles. No se añadieron platos o sedes no verificadas.

## Alcance seguro
Se modifica únicamente la sección `MenuSection` en `Home.tsx`, la importación del CSS específico de Carta, documentación y pruebas estáticas. No se altera el código del Home, otras páginas, el catálogo público, TU VERSO, las API o el checkout.

## Compatibilidad
- Mantener `layoutId` compartido de las fotografías para FLIP.
- Conservar `SpinCanvas`, carrusel, historias y flying cart.
- Las fotos externas son ilustrativas solo para la versión de diseño, con etiqueta.
- Sin datos del administrador, la producción muestra un estado vacío en lugar de precios ficticios.
- Una foto fallida conserva la ilustración de respaldo que ya existía.
- No se permite finalizar un pedido real hasta la conexión validada del backend.

## Verificación
Ejecutar `npm install`, `npm run check`, `npm run build`, `npm run dev`; revisar `http://localhost:4321/carta` a 360 px, 390 px, tablet y escritorio. Ejecutar `node scripts/check-carta-gastronomica.mjs`.
