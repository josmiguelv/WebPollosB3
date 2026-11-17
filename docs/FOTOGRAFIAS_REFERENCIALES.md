# Fotografías referenciales — Pollos B3 (v1.1.2)

## Alcance
Fotografías obtenidas de **Pexels**, con permiso de uso comercial conforme a https://www.pexels.com/license/ . No se ha descargado ni publicado contenido protegido perteneciente a Roky's. Roky's se estudió exclusivamente como referencia de presentación del rubro.

Las imágenes se usan solo dentro de `designFixtures`, cuando se trabaja en desarrollo o se habilita de forma explícita `VITE_B3_ENABLE_DESIGN_PREVIEW=true`. El catálogo oficial, si se conecta, sustituye los datos de demostración; la producción no muestra fotos ni precios de prueba por defecto. No confundir las fotografías con productos, presentaciones o promociones reales de Pollos B3.

## Selección y créditos
- **brasa** — Nano Erdozain. https://www.pexels.com/photo/a-tray-of-chicken-fries-and-salad-with-dressing-27643006/
- **fuego** — Eros Jhave Ormeño Centeno. https://www.pexels.com/photo/close-up-shot-of-roasted-chickens-in-the-rotisserie-7508167/
- **combo** — Arti.tic. https://www.pexels.com/es-es/foto/comida-rustica-con-pollo-a-la-parrilla-y-guarniciones-34110268/
- **parrilla** — Juan Carlos Tamayo. https://www.pexels.com/es-es/foto/delicioso-pollo-a-la-parrilla-con-arroz-y-papas-fritas-34487536/
- **bebida** — Nano Erdozain. https://www.pexels.com/photo/chicha-morada-with-ingredients-on-rustic-table-28490837/
- **postre** — Nanda Mends. https://www.pexels.com/photo/chocolate-brownie-cake-slice-18301848/

## Interacciones preservadas
- Carrusel del Home con ciclo automático, controles y transición original.
- Historias con progreso de 4.5 segundos y navegación por toque.
- Transiciones compartidas FLIP de tarjetas y fichas (`layoutId`).
- Giro Canvas de pollo cuando se aporte video oficial segmentado.
- Efecto animado del producto hacia el carrito y persistencia local.
- Carta Express compacta en móviles.

## Rendimiento y sustitución
- Las tarjetas se cargan con `loading=lazy` y `decoding=async`.
- Si una imagen falla, se conserva la ilustración original como fallback.
- En el Home el primer banner utiliza fotografía referencial sin eliminar el logo de Pollos B3.
- Antes de producción reemplazar por fotografías reales, optimizadas (WebP/AVIF) y servidas por medios propios.
- No usar fotografías de Pexels para representar productos reales de Pollos B3 de manera engañosa. La licencia no implica respaldo de los autores a la marca.
