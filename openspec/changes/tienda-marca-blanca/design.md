## Context

El proyecto base es una plataforma SaaS de distribución de contenido con suscripciones construida en Next.js 16 (App Router), Supabase (PostgreSQL + Auth), MercadoPago y Resend. Cuenta con autenticación completa, panel admin, sistema de theming dinámico via `site_config`, integración de pagos funcional y envío de emails automáticos.

El objetivo es evolucionar esta base hacia una **tienda e-commerce marca blanca entregable**: un producto completo que se instala una vez por cliente, donde cada cliente tiene su propio deploy independiente (Vercel + Supabase + MercadoPago). No hay infraestructura compartida entre clientes. El proveedor (quien construye el producto) no administra nada post-entrega: el cliente gestiona su catálogo, pedidos y configuración visual desde el panel admin incluido.

El cambio más crítico en términos de producto es eliminar el login como requisito de compra. El cambio más crítico en términos de arquitectura es asegurarse de que toda la configuración por cliente sea realizable desde el panel admin, sin tocar código.

Restricciones:
- No romper el módulo de suscripciones/contenido existente
- Mantener el stack actual
- La configuración por cliente (marca, colores, productos) debe ser 100% gestionable desde el admin
- Un deploy por cliente — sin complejidad multi-tenant

---

## Goals / Non-Goals

**Goals:**
- Checkout completable sin cuenta (guest checkout) como flujo principal
- Catálogo de productos con variantes y stock, gestionado por el cliente desde el admin
- Carrito persistido sin sesión con fusión al loguearse
- Órdenes con estados y consulta pública por número + email
- Theming completo configurable desde el panel admin (paleta, tipografía, logo, favicon, redes)
- Login/registro como opt-in con valor concreto (historial, wishlist, datos guardados)
- Panel admin extendido para gestionar productos, variantes, stock, órdenes y configuración visual
- Producto entregable: un deploy por cliente con sus propias credenciales en variables de entorno

**Non-Goals:**
- Infraestructura multi-tenant compartida entre clientes
- Panel de control del proveedor para administrar clientes
- Marketplace (múltiples vendedores por tienda)
- Integración con ERPs o sistemas de inventario externos
- Múltiples pasarelas de pago simultáneas (se usa MercadoPago; otras son extensiones futuras)
- Sistema de envíos con cotización en tiempo real (métodos fijos configurables desde admin)
- SEO avanzado / blog / CMS de marketing

---

## Decisions

### D1 — Modelo de entrega: un deploy por cliente

**Decisión**: Cada cliente recibe su propia instancia del producto: un proyecto Vercel, un proyecto Supabase y sus propias credenciales de MercadoPago y Resend. La parametrización se hace via variables de entorno (`NEXT_PUBLIC_APP_URL`, `MP_ACCESS_TOKEN`, etc.) y desde el panel admin de la tienda.

**No hay** `store_id`, no hay RLS multi-tenant, no hay resolución por dominio. El aislamiento es total porque cada cliente tiene su propia base de datos.

**Rationale**: Es el modelo más simple, más seguro y más escalable para el negocio del proveedor. No hay riesgo de filtrado de datos entre clientes. El costo por cliente es bajo (Vercel free tier + Supabase free tier es suficiente para el volumen inicial).

**Flujo de onboarding de un nuevo cliente**:
1. Crear proyecto Supabase, aplicar migraciones SQL
2. Crear proyecto Vercel, conectar repo, configurar env vars
3. El cliente entra al admin, configura su marca (logo, colores) y carga sus productos

---

### D2 — Guest Checkout: email como identificador de orden

**Decisión**: El checkout de invitado usa el email del comprador como identificador. La orden se crea sin `user_id`. Si el email corresponde a una cuenta existente, se asocia silenciosamente al finalizar el pago. Si no existe cuenta, se ofrece crear una post-compra como beneficio opcional.

**Alternativa descartada**: Crear una cuenta efímera automática. Genera fricción técnica y UX confusa (el usuario recibe un email de "bienvenida" sin haber pedido una cuenta).

**Rationale**: Es el patrón estándar de Shopify, WooCommerce y la mayoría de e-commerces modernos. Máxima conversión, implementación directa.

---

### D3 — Carrito: localStorage + tabla `carts` en servidor

**Decisión**: El carrito se almacena en `localStorage` para usuarios no logueados. Al loguearse, el carrito local se fusiona con el carrito guardado en servidor (si existe), priorizando cantidades del carrito local. Para usuarios logueados, el carrito se persiste en la tabla `carts`.

**Alternativa descartada**: Carrito 100% server-side con sesión anónima. Requiere sesiones anónimas en Supabase que agregan complejidad y costo de filas.

**Rationale**: `localStorage` cubre el 95% de los casos. La fusión al login es el comportamiento esperado y estándar.

---

### D4 — Schema de datos: extensión aditiva

**Decisión**: Se agregan nuevas tablas sin modificar las existentes (salvo `payments` que agrega una FK opcional a `orders`). El módulo de suscripciones/contenido sigue funcionando sin cambios.

Nuevas tablas:
- `products` (id, name, slug, description, price, compare_at_price, category, is_active, sort_order)
- `product_images` (id, product_id, url, sort_order)
- `product_variants` (id, product_id, name, options jsonb, price_modifier, stock, sku)
- `orders` (id, number, status, email, user_id nullable, subtotal, shipping_total, total, shipping_address jsonb, shipping_method_id, notes)
- `order_items` (id, order_id, product_id, variant_id nullable, quantity, unit_price, total_price, snapshot jsonb)
- `carts` (id, user_id nullable, session_token, items jsonb, updated_at)
- `addresses` (id, user_id, label, address jsonb, is_default)
- `wishlist` (id, user_id, product_id)
- `shipping_methods` (id, name, price, estimated_days, is_active)

La columna `snapshot` en `order_items` guarda el nombre, imagen y precio del producto al momento de la compra — es inmutable ante cambios futuros del producto.

---

### D5 — Theming: CSS custom properties desde `site_config`

**Decisión**: `site_config` se extiende con nuevas claves (`color_primary`, `color_secondary`, `color_accent`, `color_background`, `color_surface`, `font_heading`, `font_body`, `favicon_url`, `social_instagram`, `social_facebook`, `social_tiktok`). El layout raíz inyecta estos valores como CSS custom properties en `<html>` via un `<style>` inline generado en el servidor. El cliente los configura desde `/admin/configuracion`.

**Rationale**: Zero JavaScript en cliente para theming. El sistema existente ya funciona así con `primary_color` — solo se extiende.

---

### D6 — Layout y UX de la tienda

**Decisión**: Las decisiones de UX se toman una vez y aplican a todos los clientes. Son parte del producto, no configurables.

**Carrito — Drawer lateral**
El carrito se abre como un panel deslizable desde la derecha (componente `Sheet` de shadcn/ui) al agregar un producto o hacer clic en el ícono del header. El usuario nunca sale de la página que está viendo. Al hacer clic en "Finalizar compra" desde el drawer, navega al checkout. No hay página `/carrito` separada.

**Catálogo — Grilla con imagen dominante**
Los productos se muestran en grilla: 3 columnas en desktop, 2 en tablet, 1 en mobile. Cada card tiene la imagen ocupando la mayor parte del espacio, con nombre, precio y badge de descuento superpuesto si corresponde. El botón "Agregar al carrito" aparece en hover (desktop) o siempre visible (mobile). Las cards no tienen bordes pesados — sombra sutil y esquinas redondeadas.

**Header — Sticky y minimalista**
El header se fija al hacer scroll. Contiene: logo (izquierda), navegación principal (centro, desktop) y acciones (derecha): búsqueda, wishlist, cuenta y carrito con conteo de ítems. En mobile colapsa a hamburger + logo + carrito.

**Detalle de producto — Split layout**
En desktop: imagen/galería a la izquierda (60%), datos del producto a la derecha (40%). La columna derecha es sticky mientras la izquierda scrollea. En mobile: imagen arriba, datos abajo.

**Checkout — Steps con progress bar**
Los 3 pasos (Contacto → Envío → Pago) tienen una barra de progreso visual en la parte superior. En desktop: formulario a la izquierda, resumen de orden sticky a la derecha. En mobile: resumen colapsable arriba, formulario abajo.

**Alternativas descartadas**: página de carrito separada (rompe el flujo, el usuario pierde contexto), vista de lista en catálogo (los productos físicos se venden por imagen, no por texto).

---

### D7 — Sistema de componentes UI: shadcn/ui

**Decisión**: Se incorpora [shadcn/ui](https://ui.shadcn.com/) como sistema de componentes de la tienda. shadcn/ui provee componentes modernos y accesibles (botones, cards, formularios, modales, drawers, badges, toasts, tablas) cuyo código vive directamente en el proyecto bajo `components/ui/`. No es una dependencia externa — se puede modificar libremente.

**Integración con theming**: shadcn/ui está construido sobre CSS custom properties y Tailwind CSS, el mismo mecanismo que usamos para el theming por cliente. Los colores configurados por el cliente en el admin (`color_primary`, `color_secondary`, etc.) se aplican automáticamente a todos los componentes shadcn/ui sin configuración adicional.

**Componentes clave para la tienda**:
- `Sheet` — drawer lateral del carrito
- `Card` — tarjetas de producto en el catálogo
- `Dialog` — modales de confirmación
- `Badge` — estados de orden, stock, descuento
- `Toast` — notificaciones ("Producto agregado al carrito")
- `Table` — listados del panel admin
- `Form` + `Input` — formularios de checkout y admin

**Alternativa descartada**: construir todos los componentes desde cero con Tailwind puro. Agrega semanas de trabajo de UI sin aportar valor diferencial al producto.

**Rationale**: El código queda en el proyecto, es modificable, y se integra de forma nativa con el sistema de theming ya planificado. Acelera significativamente el desarrollo del MVP sin sacrificar control ni calidad visual.

---

### D8 — Pasarela de pagos: MercadoPago con metadata de orden

**Decisión**: Se reutiliza la integración existente. La preferencia de pago incluye los `items` del carrito (nombre, cantidad, precio unitario) y en `metadata` el `order_id`. El webhook actualiza `orders.status` en lugar de `profiles.plan_expires_at`.

**Rationale**: Mínimo cambio sobre lo existente. MercadoPago ya soporta items múltiples en la preference.

---

## Risks / Trade-offs

**[Stock race condition]** → Dos usuarios compran el último ítem simultáneamente. Mitigación: validación de stock con `SELECT FOR UPDATE` en la transacción de creación de orden. Si el stock es insuficiente al confirmar el pago, la orden pasa a `payment_approved_stock_error` y se notifica al admin.

**[Carrito perdido en localStorage]** → El usuario limpia el navegador. Mitigación: para usuarios logueados el carrito se persiste en servidor. Para invitados es comportamiento esperado y aceptado en la industria.

**[Email duplicado guest + cuenta]** → El usuario tiene cuenta y compra con el mismo email como invitado. Mitigación: al crear la orden se busca `user_id` por email y se asocia automáticamente. La orden aparece en el historial de la cuenta.

---

## Migration Plan

1. Aplicar migraciones SQL nuevas — sin downtime, son completamente aditivas
2. Extender `site_config` con nuevas claves — el admin puede configurarlas gradualmente (tienen fallbacks)
3. Ajustar middleware para permitir `/checkout` sin autenticación
4. Deploy del nuevo código — las rutas nuevas no afectan las existentes
5. El cliente carga su catálogo de productos desde el admin antes de lanzar la tienda

**Rollback**: revertir el middleware es inmediato. Las migraciones son reversibles mientras no haya datos en las nuevas tablas.

---

## Open Questions

- **Imágenes de productos**: ¿Supabase Storage o CDN externo (Cloudinary)? → Supabase Storage suficiente para el volumen inicial; migrable si escala.
- **Descuentos y cupones**: ¿en scope para V1? → Recomendado diferir a V2 para no bloquear el MVP.
- **Facturación / AFIP**: ¿se requiere generación de facturas electrónicas? → Fuera de scope inicial.
- **Notificación de cambio de estado de orden al cliente**: ¿email automático cuando el admin pasa la orden a `shipped`? → Sí, recomendado incluir en V1 ya que el template de email ya existe.
