## Why

Existe una oportunidad de negocio clara: construir una tienda e-commerce marca blanca como **producto entregable**, que pueda instalarse para múltiples clientes sin reescribir código. Cada cliente recibe su propia instancia completa e independiente (su base de datos, su deploy, su integración de pagos) y gestiona su catálogo, pedidos y configuración desde un panel admin incluido. El único trabajo por cliente es parametrizar colores, logo y datos de contacto. La principal barrera de conversión a eliminar es el login obligatorio: nadie quiere crear una cuenta para comprar, y ese requisito es la causa número uno de abandono de carrito.

## What Changes

- Se construye una tienda e-commerce genérica y parametrizable como **producto independiente**, no un SaaS administrado
- Cada cliente recibe su propio deploy (Vercel) y su propia base de datos (Supabase) — vos no administrás nada de los clientes
- La configuración por cliente (colores, logo, textos, datos de contacto) se hace desde el panel admin, sin tocar código
- El checkout funciona **sin login**: cualquier visitante puede comprar como invitado ingresando solo su email
- El login/registro es opcional y aporta valor concreto (historial de pedidos, wishlist, datos de envío guardados), nunca es un requisito
- Se incorpora un catálogo de productos gestionado por el propio cliente desde el panel admin (CRUD de productos, variantes e imágenes)
- Se incorpora un carrito persistido sin sesión con fusión automática al loguearse
- Se incorpora un flujo de checkout en 3 pasos (contacto → envío → pago) con integración a MercadoPago
- Se incorpora gestión de órdenes con estados y consulta pública por número + email
- El panel admin se extiende con: gestión de productos, variantes, stock, órdenes y configuración visual completa de la tienda
- El módulo de suscripciones/contenido existente se mantiene y puede coexistir

## Capabilities

### New Capabilities

- `home`: Página de inicio de la tienda con hero, productos destacados y secciones configurables desde el admin. Primera impresión del cliente ante sus compradores.
- `categorias`: Gestión de categorías de productos como entidad propia (CRUD desde admin). Permite filtrar el catálogo y estructurar la navegación de la tienda.
- `catalogo`: Listado y detalle de productos con filtros, búsqueda, variantes (talle, color), imágenes e indicadores de stock. SEO básico (meta tags) por producto. El cliente carga sus productos desde el panel admin.
- `carrito`: Gestión del carrito en `localStorage` sin login. Fusión automática con carrito servidor al loguearse. Toast de confirmación al agregar productos.
- `checkout-invitado`: Flujo de 3 pasos (contacto → envío → pago) completable sin cuenta. Validación de formularios con Zod. Soporte de envío gratis a partir de un monto configurable.
- `ordenes`: Entidad Order con líneas de detalle, estado del ciclo de vida, datos de envío y referencia de pago. Consulta pública por número + email sin login.
- `cuenta-cliente`: Área privada opt-in para usuarios registrados: historial de órdenes, direcciones guardadas y wishlist.
- `theming-avanzado`: Extensión del sistema `site_config` existente con paleta de colores completa, tipografía, logo, favicon, redes sociales y formato de moneda. Todo configurable desde el admin.
- `panel-admin-tienda`: Extensión del panel admin con CRUD de productos y variantes, gestión de categorías, gestión de stock, gestión de órdenes, dashboard de métricas básicas y configuración visual completa de la tienda.

### Modified Capabilities

- `auth-flujo`: El middleware deja de proteger la ruta `/checkout`. El login se convierte en opt-in con valor explícito, nunca un requisito de compra.
- `pagos`: La integración MercadoPago existente se adapta para recibir ítems del carrito y referenciar órdenes en lugar de planes de suscripción.

## Impact

- **Base de datos**: Nuevas tablas (`products`, `product_images`, `product_variants`, `orders`, `order_items`, `carts`, `addresses`, `wishlist`, `shipping_methods`). Modificación menor de `payments` (FK opcional a `orders`). Extensión de `site_config` con nuevas claves.
- **APIs**: Extensión de `/api/create-payment` y `/api/webhook`. Nueva API `/api/orders` para crear órdenes.
- **Middleware**: Ajuste de rutas protegidas (`/checkout` pasa a ser pública).
- **Entregable**: El producto se despliega una vez por cliente. Variables de entorno por cliente: Supabase URL/keys, MercadoPago token, Resend key, URL de la app.
- **Compatibilidad**: El módulo de suscripciones/contenido no se toca.
