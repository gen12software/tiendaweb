## 0. Setup de sistema de diseño

- [ ] 0.1 Definir pareja tipográfica final (heading + body) y registrarla en `globals.css` via `@font-face` / Google Fonts
- [ ] 0.2 Revisar y limpiar CSS custom properties en `globals.css`: consolidar variables de color, spacing y radius
- [ ] 0.3 Definir paleta base de la tienda pública (fondo, texto, superficies, bordes) como variables en `globals.css`
- [ ] 0.4 Definir paleta del panel admin (sidebar, fondo de contenido, cards) como variables en `globals.css`

## 1. Componentes base (shadcn/ui — variantes nuevas)

- [ ] 1.1 Extender `Button` con variante `primary-full` (full-width, altura generosa) para CTAs de checkout y producto
- [ ] 1.2 Extender `Card` con variante `product` (sin borde, hover sombra + zoom imagen)
- [ ] 1.3 Extender `Input` con floating label CSS (label desciende/asciende)
- [ ] 1.4 Extender `Badge` con variantes `discount`, `out-of-stock`, `order-status-*`
- [ ] 1.5 Crear componente `SectionTitle` (heading + subtítulo + línea decorativa opcional)
- [ ] 1.6 Crear componente `EmptyState` (ícono, título, mensaje, acción opcional) para listados vacíos

## 2. Header y Footer de la tienda pública

- [ ] 2.1 Implementar header transparent → solid en scroll (transición CSS 300ms)
- [ ] 2.2 Rediseñar navegación desktop: links con underline animado en hover, sin bordes de separación
- [ ] 2.3 Rediseñar menú mobile como bottom-sheet (deslizable desde abajo con backdrop)
- [ ] 2.4 Rediseñar footer: columnas con espaciado generoso, redes sociales con íconos Lucide, tipografía pequeña y suave

## 3. Home

- [ ] 3.1 Rediseñar sección hero: imagen de fondo full-height, overlay gradiente, heading centrado en tipografía grande, CTA botón outline blanco
- [ ] 3.2 Rediseñar sección de categorías: grilla horizontal tipo carrusel en mobile, 4 columnas en desktop, imagen cuadrada con nombre encima en overlay
- [ ] 3.3 Rediseñar sección de productos destacados: heading + grilla de cards `product`
- [ ] 3.4 Rediseñar sección CTA: fondo `color_primary`, texto blanco, layout centrado

## 4. Catálogo de productos

- [ ] 4.1 Rediseñar listado `/productos`: grilla 3/2/1 con cards `product`, sin bordes de tabla
- [ ] 4.2 Rediseñar barra de filtros: chips horizontales para categorías, dropdown para ordenamiento
- [ ] 4.3 Rediseñar estado vacío (sin resultados) con `EmptyState`
- [ ] 4.4 Rediseñar paginación: números simples + flechas, sin borde de caja

## 5. Detalle de producto

- [ ] 5.1 Rediseñar galería: imagen principal grande con thumbnail rail debajo, zoom on hover en desktop
- [ ] 5.2 Rediseñar columna de datos: nombre en heading grande, precio en dos tamaños (actual tachado/oferta), descripción con tipografía cómoda
- [ ] 5.3 Rediseñar selector de variantes: chips tipo `Toggle` de shadcn/ui, estado agotado con línea diagonal
- [ ] 5.4 Implementar botón "Agregar al carrito" sticky en mobile (fixed bottom bar)
- [ ] 5.5 Rediseñar sección de breadcrumb con separador sutil

## 6. Carrito drawer

- [ ] 6.1 Rediseñar line items: thumbnail cuadrado, nombre en dos líneas máximo, precio alineado a la derecha
- [ ] 6.2 Rediseñar sección de total: separador, total en tipografía grande, botón CTA full-width
- [ ] 6.3 Rediseñar indicador de envío gratis: barra de progreso lineal con mensaje dinámico
- [ ] 6.4 Rediseñar estado vacío del carrito con `EmptyState` + CTA a catálogo

## 7. Checkout

- [ ] 7.1 Rediseñar stepper: 3 pasos con número en círculo + línea conectora, estado activo/completado/pendiente
- [ ] 7.2 Aplicar floating labels a todos los inputs del checkout
- [ ] 7.3 Rediseñar resumen de orden (columna derecha desktop): card limpia con line items compactos y total destacado
- [ ] 7.4 Rediseñar selector de método de envío: radio cards con precio alineado a la derecha

## 8. Páginas de cuenta del cliente

- [ ] 8.1 Rediseñar layout `/cuenta/*`: sidebar de navegación vertical con links activos destacados
- [ ] 8.2 Rediseñar historial de órdenes: tabla simplificada con badge de estado colorido
- [ ] 8.3 Rediseñar lista de direcciones: cards con ícono y acción de editar/eliminar
- [ ] 8.4 Rediseñar wishlist: misma grilla de cards `product` que el catálogo

## 9. Panel admin — Layout

- [ ] 9.1 Rediseñar sidebar: fondo oscuro, íconos Lucide + label, colapsable a íconos solos con tooltip
- [ ] 9.2 Rediseñar header del admin: breadcrumb a la izquierda, toggle dark mode + avatar a la derecha
- [ ] 9.3 Rediseñar área de contenido: fondo gris muy claro, cards blancas para cada sección

## 10. Panel admin — Dashboard

- [ ] 10.1 Rediseñar cards de métricas: número grande, label pequeño, delta vs período anterior con color verde/rojo
- [ ] 10.2 Rediseñar tabla de últimas órdenes: inline en el dashboard, badge de estado, sin paginación

## 11. Panel admin — Listados (productos, categorías, órdenes)

- [ ] 11.1 Rediseñar tablas: row hover sutil, columnas con ancho correcto, acciones en menú contextual (ícono `...`)
- [ ] 11.2 Rediseñar barra de filtros: inputs inline sobre la tabla, botón de limpiar filtros
- [ ] 11.3 Rediseñar paginación de tablas: simple, alineada a la derecha
- [ ] 11.4 Rediseñar estados vacíos con `EmptyState`

## 12. Panel admin — Formularios

- [ ] 12.1 Aplicar floating labels a todos los inputs de los formularios admin
- [ ] 12.2 Rediseñar sección de imágenes: zona de drop con borde punteado, preview de imágenes con botón eliminar
- [ ] 12.3 Rediseñar mensajes de error: texto rojo inline bajo el campo, sin toasts para errores de validación
- [ ] 12.4 Rediseñar botones de acción del formulario: "Guardar" primario + "Cancelar" ghost, alineados a la derecha

## 13. Páginas de error y estados de carga

- [ ] 13.1 Rediseñar página 404 con tipografía grande y CTA a home/catálogo
- [ ] 13.2 Rediseñar página de error de checkout con opciones claras de reintento
- [ ] 13.3 Agregar skeleton loaders en catálogo, detalle de producto y dashboard admin (reemplazar spinners genéricos)
