# Pollos B3 — Web premium interactiva (v1.0.0, primera entrega visual)

Web original de **Pollos B3**, diseñada como canal comercial propio para móviles, tablets y escritorio, con identidad oficial (rojo #FE1601 obtenido del archivo de marca, blanco puro, negro, Montserrat y DM Sans). Proyecto React 19 + TypeScript + Vite. No utiliza temas ni constructores de sitios.

## Entregable y límites

Esta entrega contiene: cabecera y portada editorial con carrusel automático/manual, intro de 1,9 s, historias navegables con progreso de 4,5 s, menú y búsqueda alimentados por un adaptador, fichas con transiciones shared-element/FLIP y personalización, módulo de giro por cuadros si se aporta el video oficial procesado, recomendador de tres preguntas, constructor de combos, carrito con persistencia local y animación de agregado, selector de delivery/recojo con Geolocation API opcional, vista de sedes y widget preparado para el canal **TU VERSO WEB**. Incluye diseño responsive, preferencia de movimiento reducido y fuentes corporativas.

**Esta versión NO se conecta todavía a la administración de la app Android ni recibe pedidos, valida stock, procesa pagos, asigna delivery o crea conversaciones TU VERSO.** El ZIP original no contenía esos contratos/credenciales ni material audiovisual del producto. Se evita simular una operación existente.

En **desarrollo**, se muestran productos/precios de prueba *expresamente etiquetados como datos de diseño*. No son la carta ni ofertas de Pollos B3. En la compilación de producción, la muestra se oculta y no se publica ningún precio sin origen administrativo. `VITE_B3_ENABLE_DESIGN_PREVIEW=true` solo debe usarse en un entorno cerrado de revisión, nunca en una web pública.

## Instalar y ejecutar

Requiere Node 20.19+ o 22.12+, y npm.

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Compilación: `npm run check && npm run build`; servir `dist/` como estático en hosting HTTPS con fallback a `index.html`.

**Nota de validación en esta entrega:** el entorno donde se preparó la modificación no tenía acceso de red a npm. Se verificó la sintaxis TypeScript/JSX y el parseo CSS de forma independiente; no pudo completarse una instalación ni probarse la app React compilada. No declarar la release probada en runtime hasta ejecutar el flujo anterior en un equipo con npm accesible.

Para visualizar la dirección gráfica *sin instalar paquetes*, abrir `client/design-static-preview.html`. Es una **maqueta estática**, no reproduce las interacciones del código React.

## Identidad y recursos

- Imagen oficial conservada sin editar en `client/public/brand/pollos-b3-logo.png`.
- Rojo principal detectado del logo: `#FE1601`.
- Montserrat ExtraBold 800 / Bold 700 para titulares; DM Sans 400/500/600/700 para interfaz.
- No se incluyen fotografías ni videos comerciales de terceros. Antes de publicar, cargar medios aprobados por Pollos B3.
- `scripts/extract-spin-frames.sh` genera los cuadros WebP de un video oficial para `product.spinFrames`.

## Integración con administración y TU VERSO

Consultar `docs/INTEGRACION_ADMINISTRADOR_Y_TUVERSO.md` y `.env.example`. No se debe inventar un endpoint ni integrar un número de WhatsApp como reemplazo del canal WEB.

## Despliegue

`npm run build` produce `dist/`; incluye el `Dockerfile`/`nginx.conf` opcionales para hosting estático con HTTPS terminado en proxy. Antes de producción se deben completar contratos backend y pruebas de pedidos, stock, pagos y accesos por sede.

## Versión en repositorio

**v1.0.0** corresponde a la primera entrega visual e interactiva. No es una versión productiva: no aceptar pedidos, pagos ni comunicaciones hasta conectar y certificar los servicios compartidos con la app y el canal WEB de TU VERSO.
