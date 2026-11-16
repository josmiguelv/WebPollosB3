# Pollos B3 — Versión 1: cambios respecto al ZIP original

| Antes | Ahora |
|---|---|
| Hero que decía «base visual integrable» y «fotografía pendiente» | Portada editorial de alto impacto, logo oficial en una composición animada, titular de marca y slides automáticos/manuales |
| Texto de integración ocupando las secciones principales | Mensajes comerciales reales sin inventar productos ni promociones; información de integración concentrada en documentación |
| Círculos de historias sin visor | Historias con visor, navegación lateral, progreso de 4,5 s, marcación de vistas y cierre |
| Carta con tarjetas vacías | Grilla, búsqueda, categorías y productos desde adaptador de catálogo; modo de prueba aislado |
| Fichas ausentes | Fichas personalizables con `layoutId` compartido, selección de variantes, salsas y extras, cálculo visual de precio |
| Giro de 360° ausente | Componente canvas capaz de utilizar cuadros reales, gesto horizontal, zoom y retorno automático; requiere video oficial |
| Recomendador sin resultados | Recomendaciones derivadas de los productos disponibles |
| Combo con pasos sin selección | Opciones seleccionables, precios dinámicos y descuentos solo si llegan del administrador |
| Carrito vacío sin interacción | Carrito real de interfaz, vuelo del indicador, cantidades editables y persistencia local; sin creación de pedidos |
| Sin modalidad ni ubicación | Delivery/recojo, dirección y Geolocation API opcional sin validar falsa cobertura |
| Sin chat | UI de atención con futura URL embed del canal WEB, explícitamente no conectado hasta validación |
| Base original con dependencias y debug de Manus | Frontend React/Vite limpio, sin rastreadores ni scripts del constructor de origen |
| Tamaños de 6–9px en móvil | Sistema de tipografía legible y responsive, navegación adaptada por tamaño |
| Metadatos externos del proveedor | Metadatos de Pollos B3, recurso OG local y favicon de marca |

## Pendientes reales para salida productiva

- Compilar/testear con dependencias npm en entorno con acceso de red.
- Validar interacciones y accesibilidad en dispositivos reales.
- Proveer imágenes/videos oficiales para sustitución de artes conceptuales.
- Conectar el administrador **existente** de la app móvil y validar el contrato real.
- Conectar proceso de pedidos, pagos, delivery, stock y seguimiento.
- Conectar el canal WEB real de TU VERSO y certificar con agente.
- Completar políticas y demás contenidos legales autorizados.
