# Pollos B3 — Entrega comercial multipágina v1.1.0

## Alcance concluido en frontend

- Se sustituyó la portada única que mezclaba todas las secciones por navegación SPA real con URLs por página y soporte de historial del navegador.
- Se mantuvo el Inicio editorial animado con hero, historias, recomendador, destacados y accesos comerciales.
- Se trasladaron Carta, Combos y Locales a rutas dedicadas sin eliminar sus animaciones existentes.
- Se añadió Carrito a pantalla completa con modificación de cantidades, subtotal y enlace a checkout; conserva el carrito local de demostración.
- Se incorporaron pantallas específicas de checkout, pedidos, cuenta, promociones, nosotros y ayuda con mensajes honestos sobre integraciones pendientes.
- Se mantuvo el widget WEB preparado para TU VERSO, sin reemplazarlo por enlaces de WhatsApp.
- Se conservaron los colores del logo (`#FE1601`, blanco, negro) y Montserrat/DM Sans, sin plantillas.
- No se añadieron QR ni NFC.

## Arquitectura funcional

`admin existente de la app Android → API pública de catálogo → adaptador de la web`.

Las operaciones reales `disponibilidad → tienda elegible → delivery → checkout → validación de pago → pedido → seguimiento` siguen sujetas a los contratos exactos del administrador Android. Nunca fabricar esos contratos, y no activar confirmación de pedido hasta que existan.

`cliente web → chat embebido → canal WEB TU VERSO → Flow → cola → agente`, exclusivamente cuando el canal WEB esté desarrollado y validado.

## Criterios antes de publicar al público

1. Obtener fotografías/videos oficiales y cargarlos mediante administración.
2. Confirmar URLs, modelos y permisos del API de la app, e implementar pedidos reales de servidor a servidor.
3. Validar disponibilidad, locales, tarifa de delivery, pago e idempotencia desde el backend.
4. Configurar y certificar el canal WEB de TU VERSO para el dominio público autorizado.
5. Publicar políticas reales y Libro de Reclamaciones, y establecer datos verificables de redes sociales.
6. Ejecutar `npm run check && npm run build`, además de pruebas móviles y de escritorio (320, 360, 390, 768, 1024, 1440 y 1920 px).
7. Realizar pruebas de accesibilidad, SEO e introducción/puntos de reentrada, con recursos definitivos.

## Forma de acceder en desarrollo

```bash
npm install
npm run dev
```

Abrir http://localhost:4321/; navegar directamente a http://localhost:4321/carta y http://localhost:4321/carrito también debe funcionar.

Para activar las muestras durante revisión local en `.env` del cliente: `VITE_B3_ENABLE_DESIGN_PREVIEW=true`. Desactivarlo en cualquier sitio público.
