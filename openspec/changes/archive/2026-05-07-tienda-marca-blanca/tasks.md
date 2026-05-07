## 0. Setup inicial

- [ ] 0.1 Instalar y configurar shadcn/ui en el proyecto (`npx shadcn@latest init`)
- [ ] 0.2 Vincular los CSS custom properties de theming (`--color-primary`, etc.) con las variables de color de shadcn/ui en `globals.css`
- [ ] 0.3 Instalar los componentes base: Button, Card, Badge, Sheet, Dialog, Toast, Input, Form, Table, Select, Tabs
- [ ] 0.4 Instalar Zod para validación de formularios (`npm install zod`)
- [ ] 0.5 Verificar que cambiar `color_primary` en `site_config` se refleja en los componentes shadcn/ui

## 1. Base de datos — Schema

- [ ] 1.1 Crear migración con tabla `categories` (id, name, slug, image_url, sort_order, is_active)
- [ ] 1.2 Crear migración con tablas `products`, `product_images`, `product_variants` (products incluye FK a categories, campo is_featured, compare_at_price)
- [ ] 1.3 Crear migración con tablas `orders`, `order_items`
- [ ] 1.4 Crear migración con tablas `carts`, `addresses`, `wishlist`
- [ ] 1.5 Crear migración con tabla `shipping_methods`
- [ ] 1.6 Agregar FK opcional `order_id` en tabla `payments` existente
- [ ] 1.7 Crear RLS policies para `categories` y `products` (lectura pública activos, admin escritura)
- [ ] 1.8 Crear RLS policies para `orders` y `order_items` (admin + owner por email)
- [ ] 1.9 Crear RLS policies para `carts`, `addresses`, `wishlist`
- [ ] 1.10 Crear RLS policies para `shipping_methods` (lectura pública, admin escritura)

## 2. Infraestructura y configuración

- [ ] 2.1 Extender `lib/site-config.ts` con nuevas claves: theming completo, moneda, WhatsApp, home sections, `free_shipping_threshold`
- [ ] 2.2 Ajustar middleware para excluir `/checkout` y `/mi-orden` de las rutas protegidas

## 3. Layout base y theming

- [ ] 3.1 Extender el layout raíz para inyectar CSS custom properties desde `site_config` (paleta completa + fuentes)
- [ ] 3.2 Agregar soporte de Google Fonts dinámicas via `font_heading` y `font_body`
- [ ] 3.3 Agregar soporte de favicon y Open Graph globales desde `site_config`
- [ ] 3.4 Rediseñar componente `Header` (sticky, logo imagen, navegación de categorías, búsqueda, wishlist, cuenta, carrito con conteo)
- [ ] 3.5 Crear componente `Footer` con redes sociales, moneda y links de política/términos configurables
- [ ] 3.6 Mantener `WhatsApp button` existente con número y mensaje leídos desde `site_config`

## 4. Catálogo de productos

- [ ] 4.1 Crear página `/productos` con grilla (3/2/1 col) paginada (24 por página)
- [ ] 4.2 Implementar filtros de categoría y ordenamiento en el listado
- [ ] 4.3 Implementar búsqueda por texto en productos
- [ ] 4.4 Crear página `/productos/[slug]` con split layout (galería izq / datos der en desktop)
- [ ] 4.5 Implementar galería de imágenes navegable con miniatura principal
- [ ] 4.6 Implementar selector de variantes con actualización de precio y stock en tiempo real
- [ ] 4.7 Manejar estado sin stock (botón deshabilitado) e indicador de stock bajo ("¡Solo quedan X!")
- [ ] 4.8 Mostrar precio tachado y badge de descuento cuando existe `compare_at_price`
- [ ] 4.9 Implementar meta tags SEO y Open Graph por producto usando datos del admin
- [ ] 4.10 Implementar página 404 para productos inactivos o inexistentes

## 5. Carrito

- [ ] 5.1 Crear contexto/store de carrito con persistencia en `localStorage`
- [ ] 5.2 Implementar acciones: agregar, incrementar, decrementar, eliminar ítem
- [ ] 5.3 Implementar drawer lateral del carrito (Sheet de shadcn/ui, deslizable desde la derecha)
- [ ] 5.3.1 Mostrar indicador de progreso hacia envío gratis en el drawer si `free_shipping_threshold` está configurado
- [ ] 5.4 Mostrar conteo de ítems en el header
- [ ] 5.5 Crear API `POST /api/cart/sync` para fusión de carrito al loguearse
- [ ] 5.6 Implementar fusión de carrito local con carrito servidor en el evento de login
- [ ] 5.7 Implementar validación de stock de ítems al iniciar checkout

## 6. Checkout como invitado

- [ ] 6.1 Crear página `/checkout` con stepper de 3 pasos (Contacto → Envío → Pago)
- [ ] 6.2 Implementar paso 1: formulario de contacto con validación Zod (nombre, email, teléfono)
- [ ] 6.3 Implementar sugerencia de login no bloqueante si el email tiene cuenta existente
- [ ] 6.4 Implementar paso 2: formulario de envío con validación Zod + selector de métodos de envío
- [ ] 6.5 Pre-poblar paso 2 con dirección guardada si el usuario está logueado
- [ ] 6.6 Implementar paso 3: resumen de orden con total + botón de pago
- [ ] 6.7 Crear API `POST /api/orders` que crea la orden en estado `pending` antes de redirigir a MP
- [ ] 6.8 Crear página `/checkout/confirmacion` con oferta opt-in de crear cuenta
- [ ] 6.9 Crear página `/checkout/error` con opción de reintentar

## 7. Órdenes

- [ ] 7.1 Implementar lógica de transición de estados en el webhook de MercadoPago
- [ ] 7.2 Extender `POST /api/webhook` para actualizar `orders.status` y descontar stock
- [ ] 7.3 Implementar descuento de stock con `SELECT FOR UPDATE` (prevención de race condition)
- [ ] 7.4 Crear API pública `GET /api/orders/[token]` para consulta sin login
- [ ] 7.5 Crear página `/mi-orden` con formulario número de orden + email
- [ ] 7.6 Mostrar detalle de orden en `/mi-orden` (estado, ítems, envío, seguimiento)
- [ ] 7.7 Disparar email de confirmación al pasar orden a `paid` (extender template existente)

## 8. Área de cuenta del cliente

- [ ] 8.1 Crear sección `/cuenta/ordenes` con historial de órdenes del usuario
- [ ] 8.2 Crear vista de detalle de orden desde el historial
- [ ] 8.3 Crear sección `/cuenta/direcciones` para gestionar direcciones guardadas
- [ ] 8.4 Implementar guardado opt-in de dirección post-checkout
- [ ] 8.5 Crear sección `/cuenta/wishlist` con listado de productos guardados
- [ ] 8.6 Implementar toggle de wishlist en tarjeta y detalle de producto

## 9. Panel admin — Productos

- [ ] 9.1 Crear página `/admin/productos` con listado, filtros y toggle de estado
- [ ] 9.2 Crear página `/admin/productos/new` con formulario de producto (sin variantes)
- [ ] 9.3 Implementar carga de imágenes a Supabase Storage desde el formulario de producto
- [ ] 9.4 Agregar sección de variantes al formulario de producto (CRUD de variantes)
- [ ] 9.5 Crear página `/admin/productos/[id]` para edición de producto existente
- [ ] 9.6 Bloquear eliminación de productos con órdenes asociadas (ofrecer desactivar)
- [ ] 9.7 Implementar campo de stock editable por variante en la vista de producto

## 10. Panel admin — Órdenes

- [ ] 10.1 Crear página `/admin/ordenes` con listado paginado y filtros (estado, fecha, búsqueda)
- [ ] 10.2 Crear página `/admin/ordenes/[id]` con detalle de orden y cambio de estado
- [ ] 10.3 Implementar campo de número de seguimiento en el cambio de estado a `shipped`
- [ ] 10.4 Implementar notas internas en la orden (visibles solo para admin)
- [ ] 10.5 Implementar cancelación de orden con restitución de stock

## 11. Panel admin — Configuración de tienda

- [ ] 11.1 Extender `/admin/configuracion` con sección de theming completo (paleta, tipografía)
- [ ] 11.2 Agregar preview en tiempo real de cambios de color en el editor de configuración
- [ ] 11.3 Agregar campos de identidad visual (logo, favicon, slogan, redes sociales)
- [ ] 11.4 Agregar campos de moneda (`currency_symbol`, `currency_locale`) y envío gratis (`free_shipping_threshold`)
- [ ] 11.5 Crear sección de métodos de envío (CRUD) en la configuración

## 11B. Panel admin — Dashboard

- [ ] 11B.1 Rediseñar `/admin` con métricas: ventas del día, ventas del mes, órdenes pendientes, productos sin stock
- [ ] 11B.2 Mostrar comparación de ventas mes actual vs mes anterior
- [ ] 11B.3 Mostrar últimas 5 órdenes con estado, email y monto

## 12. Integración MercadoPago

- [ ] 12.1 Extender `POST /api/create-payment` para recibir ítems del carrito y `order_id`
- [ ] 12.2 Construir el array `items` de la preferencia MP desde los ítems de la orden
- [ ] 12.3 Incluir `order_id` en el campo `metadata` de la preferencia
- [ ] 12.4 Actualizar el webhook para leer `order_id` desde `metadata` y actualizar la orden
- [ ] 12.5 Manejar el caso de `order_id` inexistente en el webhook (responder 200, loguear error)

## 13. Página de inicio (Home)

- [ ] 13.1 Crear página `/` con sección hero (título, subtítulo, imagen, CTA) leída desde `site_config`
- [ ] 13.2 Implementar sección de productos destacados (`is_featured = true`), ocultable desde admin
- [ ] 13.3 Implementar sección de categorías con imagen, ocultable desde admin
- [ ] 13.4 Implementar sección CTA configurable (título, subtítulo, link) ocultable desde admin
- [ ] 13.5 Agregar claves de home en `/admin/configuracion` (textos del hero, visibilidad de secciones)

## 14. Gestión de categorías

- [ ] 14.1 Crear página `/admin/categorias` con listado y toggle de estado
- [ ] 14.2 Crear formulario de nueva categoría (nombre, imagen, orden) con slug auto-generado
- [ ] 14.3 Implementar edición de categoría existente (el slug no cambia automáticamente)
- [ ] 14.4 Agregar selector de categoría en el formulario de producto (dropdown con categorías activas)
- [ ] 14.5 Implementar menú desplegable de categorías en el header público
