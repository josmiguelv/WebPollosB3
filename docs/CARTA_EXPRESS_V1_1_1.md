# Pollos B3 — Carta Express / revisión 1.1.1

## Alcance

**Solo `/carta`.** El resto de páginas (Inicio, Nosotros, Locales, Combos, etc.) conserva su cabecera editorial y diseño original.

## Mejoras

- Se retira el hero oscuro alto de 380–410 px de la ruta Carta.
- Cabecera sticky compacta (66 px escritorio y 56 px móvil), ocultando únicamente en Carta la franja superior.
- Título breve, buscador accesible inmediatamente y categorías visibles sin recorrer la página.
- Toolbar sticky por debajo de la cabecera; controla navegación de productos durante el desplazamiento.
- En pantallas de hasta 920 px, el primer producto no consume toda la fila; más alternativas visibles en el primer pantallazo.
- En móvil se ajusta la densidad de tarjetas, preservando la tipografía, legibilidad y estilos propios.
- No se cambia la lógica de búsqueda, filtros, personalización, animación FLIP, giro, carrito, pedidos, administración ni TU VERSO.

## Validación

- Ejecutar `npm install`, `npm run check:static`, `npm run check`, `npm run build`, `npm run dev`.
- Revisar Carta a 320, 360, 390, 430, 768, 1024, 1366 y 1920 px.
- Comprobar que el buscador y categorías no tapen productos, que el menú móvil funcione, y que el primer producto aparezca sin hacer scroll vertical en un móvil de altura habitual.
- Verificar que Inicio, Nosotros, Locales y Combos conserven sus héroes y transiciones previas.

**Esta revisión no habilita pagos ni pedidos reales.** El catálogo de desarrollo sigue siendo de prueba y la integración con la administración móvil continúa pendiente.
