## ADDED Requirements

### Requirement: CRUD de productos
El sistema SHALL permitir al admin crear, editar, activar/desactivar y eliminar productos del catálogo de su tienda.

#### Scenario: Crear producto
- **WHEN** el admin completa el formulario de nuevo producto (nombre, descripción, precio, categoría, imágenes) y guarda
- **THEN** el producto se crea con `is_active = false` por defecto y aparece en el listado del admin

#### Scenario: Activar/desactivar producto
- **WHEN** el admin hace clic en el toggle de estado de un producto
- **THEN** el campo `is_active` cambia y el producto aparece/desaparece del catálogo público inmediatamente

#### Scenario: Eliminar producto con órdenes asociadas
- **WHEN** el admin intenta eliminar un producto que tiene órdenes
- **THEN** el sistema bloquea la eliminación y ofrece solo la opción de desactivar

---

### Requirement: Gestión de variantes y stock
El sistema SHALL permitir al admin definir variantes para un producto (ej: talle, color) y gestionar el stock de cada variante.

#### Scenario: Crear variante
- **WHEN** el admin agrega una variante con opciones (ej: `{talle: "M", color: "Azul"}`) y precio diferencial
- **THEN** la variante queda asociada al producto y disponible para selección en el detalle

#### Scenario: Actualizar stock
- **WHEN** el admin modifica el valor de stock de una variante
- **THEN** el sistema actualiza el valor y refleja la disponibilidad en el catálogo público en tiempo real

#### Scenario: Stock en cero
- **WHEN** el stock de una variante llega a 0 (ya sea por venta o ajuste manual)
- **THEN** esa variante se muestra como "Sin stock" en el catálogo y no puede agregarse al carrito

---

### Requirement: Gestión de órdenes
El sistema SHALL permitir al admin ver, filtrar y actualizar el estado de todas las órdenes de su tienda.

#### Scenario: Listado de órdenes con filtros
- **WHEN** el admin accede a `/admin/ordenes`
- **THEN** ve todas las órdenes paginadas con filtros por estado, fecha y búsqueda por número o email

#### Scenario: Cambio de estado de orden
- **WHEN** el admin selecciona un nuevo estado para una orden (ej: `processing` → `shipped`) y agrega número de seguimiento
- **THEN** el sistema actualiza el estado, registra el cambio con timestamp y puede notificar al cliente por email

#### Scenario: Nota interna en orden
- **WHEN** el admin agrega una nota interna a una orden
- **THEN** la nota queda registrada y visible solo para el admin (nunca al comprador)

---

### Requirement: Configuración avanzada de la tienda
El sistema SHALL ofrecer al admin un editor visual de configuración que cubra theming, datos de contacto, métodos de envío y textos clave de la tienda.

#### Scenario: Preview de theming en tiempo real
- **WHEN** el admin modifica un color en el editor de configuración
- **THEN** el panel muestra un preview inmediato del cambio sin necesidad de guardar

#### Scenario: Gestión de métodos de envío
- **WHEN** el admin crea un método de envío con nombre, precio y días estimados
- **THEN** el método aparece disponible para selección en el paso 2 del checkout

#### Scenario: Guardar configuración
- **WHEN** el admin hace clic en "Guardar"
- **THEN** el sistema actualiza `site_config` y los cambios se reflejan en la tienda pública en el próximo request

---

### Requirement: CRUD de categorías desde admin
El sistema SHALL permitir al admin gestionar las categorías de productos (crear, editar, reordenar, activar/desactivar) desde el panel de administración.

#### Scenario: Crear categoría con imagen
- **WHEN** el admin crea una categoría con nombre e imagen
- **THEN** el sistema guarda la categoría, genera el slug automáticamente y la hace disponible para asignar a productos

#### Scenario: Reordenar categorías
- **WHEN** el admin arrastra una categoría a una posición diferente en el listado
- **THEN** el orden se actualiza y la home y el menú de navegación reflejan el nuevo orden

---

### Requirement: Dashboard de métricas básicas
El sistema SHALL mostrar al admin, en la página principal del panel (`/admin`), métricas clave de la tienda del día y del mes actual.

#### Scenario: Métricas del día
- **WHEN** el admin accede a `/admin`
- **THEN** el dashboard muestra: total de ventas del día, cantidad de órdenes del día, órdenes pendientes de procesar y productos sin stock

#### Scenario: Métricas del mes
- **WHEN** el admin accede a `/admin`
- **THEN** el dashboard muestra el total de ventas del mes actual y la comparación con el mes anterior (flecha arriba/abajo)

#### Scenario: Últimas órdenes
- **WHEN** el admin accede a `/admin`
- **THEN** el dashboard muestra las últimas 5 órdenes con estado, email del comprador y monto
