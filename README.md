# Pollos B3 — Web premium interactiva (v2, fase visual)

Web original de **Pollos B3**, diseñada como canal comercial propio para móviles, tablets y escritorio, con identidad oficial (rojo #FE1601 obtenido del archivo de marca, blanco puro, negro, Montserrat y DM Sans). Proyecto React 19 + TypeScript + Vite. No utiliza temas ni constructores de sitios.

## Navegación comercial v1.1.0

Esta versión convierte el prototipo de una sola página en una **web comercial multipágina tipo SPA**, sin recargas completas y sin plantillas WordPress. El carrito, la modalidad de entrega y el widget de atención conservan su estado mientras se navega.

Rutas implementadas:

| Ruta | Función |
| --- | --- |
| `/` | Home editorial animado con historias, recomendador y destacados |
| `/carta` | Carta completa con categorías, buscador, fichas FLIP y canvas si hay recursos |
| `/combos` | Constructor interactivo de tres pasos |
| `/promociones` | Página comercial vinculable al contenido real del administrador |
| `/locales` | Locales y selector de recojo o entrega |
| `/carrito` | Edición de carrito persistente y resumen |
| `/checkout` | Flujo visual de modalidad y datos, **sin confirmar pagos ni pedidos** |
| `/pedidos` | Diseño del futuro seguimiento real desde el backend |
| `/mi-cuenta` | Diseño de la futura experiencia de cuenta y recompra |
| `/nosotros` | Presentación institucional sin inventar hechos del negocio |
| `/ayuda` | Acceso a atención WEB de TU VERSO cuando esté habilitada |

El frontend conserva las animaciones de la v1 visual, incluida intro (1,9 s), historias (4,5 s), transición FLIP, canvas rotatorio condicionado a recursos oficiales, recomendador, efecto de agregado al carrito y constructor de combos. En las rutas dedicadas se mantienen carrito flotante, navegación móvil y widget de chat.

**Advertencia operativa:** una interfaz de checkout NO equivale a una compra real. El botón de confirmar pedido está deshabilitado mientras no exista contrato validado con el administrador Android. Lo mismo aplica a stock, sedes, delivery, pagos, pedidos y TU VERSO WEB. Tampoco se publican descuentos ni sedes ficticias.

## Actualización v1.1.1 — Carta Express

**Solo cambia la ruta `/carta`.** Se elimina el banner editorial alto de esa página, se compacta su cabecera y se muestran buscador, categorías y productos casi de inmediato en móviles y escritorio. Las categorías permanecen accesibles durante el desplazamiento y las tarjetas destacadas se muestran en la grilla móvil sin bloquear la vista de otros productos. **Inicio, Nosotros, Locales, Combos y el resto de páginas no cambiaron de estructura visual.** Se conservaron las interacciones premium de las fichas, los gestos, el carrito y los datos pendientes de integración.

Detalle y verificación: `docs/CARTA_EXPRESS_V1_1_1.md`.

## Entregable y límites

Esta entrega contiene: cabecera y portada editorial con carrusel automático/manual, intro de 1,9 s, historias navegables con progreso de 4,5 s, menú y búsqueda alimentados por un adaptador, fichas con transiciones shared-element/FLIP y personalización, módulo de giro por cuadros si se aporta el video oficial procesado, recomendador de tres preguntas, constructor de combos, carrito con persistencia local y animación de agregado, selector de delivery/recojo con Geolocation API opcional, vista de sedes y widget preparado para el canal **TU VERSO WEB**. Incluye diseño responsive, preferencia de movimiento reducido y fuentes corporativas.

**Esta versión NO se conecta todavía a la administración de la app Android ni recibe pedidos, valida stock, procesa pagos, asigna delivery o crea conversaciones TU VERSO.** El ZIP original no contenía esos contratos/credenciales ni material audiovisual del producto. Se evita simular una operación existente.

En **desarrollo**, se muestran productos/precios de prueba *expresamente etiquetados como datos de diseño*. No son la carta ni ofertas de Pollos B3. En la compilación de producción, la muestra se oculta y no se publica ningún precio sin origen administrativo. `VITE_B3_ENABLE_DESIGN_PREVIEW=true` solo debe usarse en un entorno cerrado de revisión, nunca en una web pública.

## Corrección de arranque (posterior a v1.0.0)

Se quitaron dos imports CSS heredados (`tailwindcss` y `tw-animate-css`) que no estaban declarados como dependencias y provocaban `ENOENT` en `vite build`. La web usa sus estilos propios en `premium.css`. Servidor de desarrollo y previsualización configurados en el puerto **4321**; no se tocaron animaciones ni integraciones.

## Instalar y ejecutar

Requiere Node 20.19+ o 22.12+, y npm.

```bash
npm install
npm run dev
```

Abrir http://localhost:4321. Compilación: `npm run check && npm run build`; servir `dist/` como estático en hosting HTTPS con fallback a `index.html`.

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

## URLs limpias en producción

`nginx.conf` contiene la regla SPA `try_files $uri $uri/ /index.html;` para abrir directamente `/carta`, `/carrito`, `/checkout`, etc. Cualquier otro hosting debe configurar el mismo fallback de rutas. Los metadatos de cada página y la indexación avanzada necesitarán revisión SEO cuando se confirme el dominio de Pollos B3; no asumir que una SPA sin prerender ofrece todas las ventajas de SEO multipágina.

## Comprobaciones

```bash
npm run check:static
npm run check
npm run build
npm run dev
```

**Límite de validación:** la actualización v1.1.0 se verificó con análisis estático/sintáctico en el entorno de creación; la compilación integrada, pruebas en dispositivos y conexión con servicios reales requieren ejecución en un entorno con las dependencias de npm instaladas.

## Fotografías de referencia (revisión v1.1.2)

La vista de prueba incluye seis fotografías de Pexels con licencia de uso comercial, etiquetadas como **referenciales**, para evaluar cómo se ve la gastronomía real dentro del diseño premium. Roky's es únicamente referente visual; no se han incorporado imágenes de su sitio. Se preservaron las animaciones. Consulta `docs/FOTOGRAFIAS_REFERENCIALES.md` para fuentes, autores y criterios de sustitución. La carga de imágenes depende temporalmente del CDN de Pexels y debe validarse en un navegador real.

## Carta gastronómica para pollería peruana (v1.1.3)

La ruta `/carta` usa tarjetas con fotografías prioritarias, buscador y categorías sticky, precios expresados en soles, y apertura animada de variantes y cremas. En teléfonos presenta 2 columnas y productos desde el primer pantallazo. No se alteró la portada, Nosotros, Locales ni los demás canales. Todos los nombres y categorías provienen del adaptador del catálogo: no se incluyen nuevos platos ni promociones ficticias. Los ejemplos están marcados como referenciales y no activan órdenes reales.

## Carta inmersiva v1.2.0 (experiencia gastronómica)

La ruta `/carta` presenta una carta vertical, de ancho contenido incluso en escritorio, con fondo oscuro, rojo oficial Pollos B3, plato inicial destacado (solo si hay catálogo), carrusel horizontal de exploración, categorías fijas y selector inferior. Buscador, tamaño de letra y tema son interactivos. Se conserva `ProductDetail` con personalización, animación compartida FLIP y carrito existente. Las demás rutas no se han rediseñado. Las fotografías de demostración siguen etiquetadas como referenciales; no se atribuyen a Pollos B3 ni se permiten pedidos reales sin integrar el backend.

## Piloto exclusivo de Carta (v1.2.1)
La web entra directamente en /carta, con la animación de introducción de 1,9 segundos y un indicador de preparación. Las demás rutas siguen programadas y permanecen ocultas hasta que se establezca VITE_B3_CARTA_PILOT=false. El diseño comercial de las demás páginas no se cambia.

### Continuación de compra dentro de Carta
En el piloto, **Mi pedido, Delivery/Recojo, Datos y Resumen/Pago** aparecen dentro de la misma columna de Carta y comparten el carrito persistente. No se navega a /checkout ni se procesa pago. Los métodos de pago son solo opciones visuales: confirmar está deshabilitado hasta integrar pedidos, precios, cobertura y medios de pago con el administrador de Pollos B3.

## Video giratorio en Carta — demostración (17/11/2026)

Se añadió el componente `VideoGiroDemo` dentro de **/carta** (después del producto principal y antes de las sugerencias) con la grabación enviada por el usuario: pollo a la brasa con papas y ensalada sobre plataforma giratoria. Clip de 4,08 s, optimizado a ~100 KB, sin audio y con poster WebP (~10 KB). El video se reproduce automáticamente solo al entrar en pantalla, se pausa al salir, ofrece control reproducir/pausar y respeta la preferencia de movimiento reducido. El recurso **no es un giro Canvas 360° controlable**, ni debe presentarse como producto oficial B3. Todo el contenido se muestra únicamente cuando la vista de diseño está activa.

**Recursos:** tanto este video anterior como el video nuevo del menú están versionados directamente en GitHub. No se requiere ZIP. La Carta de demostración se muestra en desarrollo y puede habilitarse en una vista cerrada mediante `VITE_B3_ENABLE_DESIGN_PREVIEW=true`; en producción los precios y productos reales deben venir del administrador. No se alteran pagos, pedidos, navegación ni animaciones existentes.

## Splash sincronizado de Carta (v1.2.3)
En modo piloto, la pantalla de carga completa dura **3 segundos**: barra lineal de 0 a 100 % durante **2,75 segundos**, seguida de una salida visual de **0,25 segundos**. El temporizador no se reinicia ante renderizados de React. Se elimina el rótulo duplicado “Pollos B3” bajo el logo de la intro y junto al logo de la cabecera de Carta; los nombres accesibles y el logo oficial se mantienen. En el modo general se preserva la intro de 1,9 segundos. Con preferencia de movimiento reducido se omite la intro, como antes.

## Video visible de Carta (v1.2.4)
Se corrigió la ausencia del video: los recursos binarios **ya están versionados en GitHub**, en `client/public/media/b3-giro-demo.mp4` y `client/public/media/b3-giro-poster.webp`. No es necesario descargar ni descomprimir ningún ZIP. El video se presenta automáticamente en modo piloto (`VITE_B3_CARTA_PILOT=true`), incluso si no se habilitan los productos de diseño (`VITE_B3_ENABLE_DESIGN_PREVIEW=false`). En la parte superior de Carta se añadió el acceso **«VER EL PLATO EN MOVIMIENTO»** que lleva al bloque del video, justo después del producto destacado. El video está identificado como material referencial y no como plato oficial. En el sitio multipágina final, con `VITE_B3_CARTA_PILOT=false`, la demostración se oculta.

## Catálogo de prueba B3 y video — v1.2.5

Sin rediseñar la web, el fixture de la Carta contiene 14 artículos: 6 platos, 5 combos y 3 bebidas, con precios de demostración en soles. Cada artículo tiene asignado un nombre de fotografía suministrada por el usuario. La Carta conserva una tarjeta por fila y el botón de compra; al tocar la fotografía, gira y muestra su contenido (la segunda pulsación la devuelve a su posición). La animación FLIP hacia la ficha de producto y el carrito permanecen.

Los 14 archivos WebP optimizados **ya están publicados en GitHub**, en `client/public/menu/`, junto con el video nuevo de medio pollo y su poster en `client/public/media/`. Un solo `git pull origin main` descarga todos los archivos, sin ZIP. El nuevo video ocupa el bloque audiovisual existente; se conserva el anterior como respaldo. No se modifican las API ni la compra real.

## Carta v1.2.6 — botones y encuadres

Reparado el cambio de sección «Menú / Combos / Bebidas»: el desplazamiento **vertical** mueve únicamente el documento, mientras que la barra de chips se centra mediante su propio desplazamiento **horizontal**. Desde el selector inferior se espera a que se cierre antes de navegar. Se conserva la selección activa durante la animación para que no marque otra categoría temporalmente. Todas las fotografías de `/menu/` se muestran con `object-fit: contain` y escala 94 % para que la presentación quede completa, sin ampliar o recortar el plato.

Las caras posteriores de las fotografías ahora tienen título, descripción breve según el tipo de plato, ingredientes derivados **solo** del nombre proporcionado y precio marcado como referencial en el modo demo. La ficha de compra, tarjeta única por fila, video y animaciones continúan intactos.

## Integración de API móvil de Pollos B3 (v1.3.0)

**Fuente de datos:** `GET https://surprise-kong-stories-brand.trycloudflare.com/api/v1/mobile/config?appId=com.integrab2g.pollosb3` (sin credenciales). El endpoint expuesto mediante Quick Tunnel puede cambiar o expirar. Para apuntar al dominio HTTPS definitivo, configurar `VITE_B3_MOBILE_CONFIG_URL` en el entorno Vite.

**Semántica exacta:** cuando `ready=true`, el `appId` coincide y la respuesta es válida, `stores` **reemplaza por completo** las sedes visibles (incluso si trae una lista vacía); no se conservan locales antiguos. `products` se aplica por ID como **upsert aditivo**, sin eliminar ninguno que falte en la respuesta. Las categorías existentes se mantienen; categorías nuevas se agregan. Se retiene en `localStorage` una caché aditiva **solo de productos**, para sobrevivir una actualización o recarga del mismo navegador; no sustituye una base de datos y no se comparten registros entre usuarios.

**Ejemplo suministrado (revisión 8):** `Nogales`, ID `0221b719-195a-45f9-a54a-08e4ef56625c`, `Av. Argentina 1653, Callao 07001`, cobertura 5 km, delivery por km S/ 2.50. Producto nuevo `prueba`, ID `be8383ff-eed2-424f-856d-b5606e9262f2`, categoría `Pollo`, S/ 13.00. Son datos obtenidos de la API; no se crean promociones ni otras sedes.

**Pantalla:** en la Carta piloto local de desarrollo, los 14 productos referenciales permanecen y se añade el producto remoto, siempre que la API responda. El selector de recojo muestra los locales y direcciones oficiales. No se habilitan pedidos reales ni pagos. Las imágenes relativas `/api/v1/mobile/images/<id>` se resuelven contra la API y usan proxy local de Vite para evitar CORS durante `npm run dev`.

**En desarrollo:** Vite proxy mismo origen `/b3-mobile-config` y `/b3-mobile-images`. **En despliegue estático:** el navegador llama a HTTPS público directamente, y el servidor API debe permitir solicitudes CORS desde el dominio web, o debe configurarse un proxy de mismo origen. No se almacenan claves de administración ni se intenta escribir en el administrador: GET solo modifica el estado visual de la web.

**Verificar:** `npm run check:static`, `npm run check`, `npm run build`. Si falla la API, los productos existentes permanecen y se muestra un aviso; nunca se elimina la lista de locales por un error de red o contrato.

## Microinteracción premium al agregar productos (v1.3.1)

En la ruta **/carta**, al confirmar «Agregar» en la ficha de producto aparece un **sobre B3** de papel cálido que sale del botón, hace un arco corto y cae suavemente en «Ver mi pedido». La primera compra utiliza la posición calculada de la barra, incluso antes de que aparezca. El subtotal animado **cuenta hasta el valor real** sin modificar los precios del carrito ni las operaciones de compra. Al aterrizar el sobre, tres trazos de vapor translúcido se elevan y desaparecen, con una confirmación discreta que se oculta sola. No usa GIF, dependencias nuevas ni sonido.

El efecto se limita a la Carta actual de una sola tarjeta por fila; las demás rutas mantienen el indicador original. La animación imperativa limpia sus nodos al finalizar, cancelarse o desmontarse el componente. Para usuarios que prefieren movimiento reducido, no hay vuelo ni vapor; el importe se actualiza de inmediato. El carrito y el checkout siguen sin aceptar pedidos o pagos reales. Verificar con `npm run check:static`, `npm run check`, `npm run build` y en navegador a 390px y escritorio.

## Túnel Cloudflare para Carta — acceso Vite autorizado (19/11/2026)

El dominio `earthquake-represents-hiv-valentine.trycloudflare.com` está autorizado explícitamente en `vite.config.ts` para `server.allowedHosts` y `preview.allowedHosts`. No se habilita `allowedHosts: true`, dado que Vite advierte del riesgo de exponer código fuente. No se modifica el túnel independiente de la API.

**Importante:** después de `git pull origin main`, hay que **detener el proceso anterior de Vite que ocupa el puerto 4321** y ejecutar `npm run dev` de nuevo. No basta abrir otra ventana: la segunda instancia falla con `Port 4321 is already in use` y seguirá sirviendo la configuración antigua. Conserva abierto `cloudflared tunnel --url http://localhost:4321` para mantener el mismo enlace público.

Si Cloudflare asigna otro nombre de dominio, autorizarlo con `$env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="nuevo-dominio.trycloudflare.com"` **en la misma terminal que va a iniciar Vite** antes de ejecutar `npm run dev`.

## Motor de pedidos Android reutilizado para Web — base aislada v1.3.2

Se incorporó la lógica original del branch móvil `feat/b3-premium-animated-toasts-20261123` a `client/public/b3-order-availability-android.js`, con **solo** el almacenamiento de la interacción cambiado a `sessionStorage` (sin persistir nombres, teléfonos y claves del pedido en `localStorage`). Su contrato `FORM` vigente usa **Productos**, **Subtotal** y **Dirección y referencia**, no un resumen TEXT. La web no utiliza `AndroidBridge` real: `web-order-transport.ts` suministra un puente HTTPS de navegador que reenvía exclusivamente los endpoints públicos del Administrador, con idempotencia, `X-Order-Access-Key`, sin cookies administrativas ni credenciales de TU VERSO.

`/b3-mobile-api` se proxifica hacia `/api/v1/mobile` del Administrador **solo con Vite en desarrollo**. Hosting estático definitivo requiere API HTTPS con CORS aprobado o proxy de mismo origen. No publicar este acceso mediante `allowedHosts:true` ni modificar TU VERSO.

**Aún no se activa el envío real desde el checkout**: el piloto de Carta, su diseño, FORM y carrito actual siguen protegidos mientras se verifica el flujo completo de aceptación/rechazo. `VITE_B3_WEB_ORDER_ENABLED=false` por defecto. Los productos de prueba sin UUID publicado nunca podrán formar pedidos reales. 
