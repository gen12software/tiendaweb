## ADDED Requirements

### Requirement: Historial de órdenes para usuarios registrados
El sistema SHALL mostrar todas las órdenes asociadas al email del usuario en su área de cuenta, sin importar si fueron compradas como invitado o logueado.

#### Scenario: Usuario ve su historial
- **WHEN** un usuario logueado navega a `/cuenta/ordenes`
- **THEN** el sistema muestra todas las órdenes cuyo email coincide con el email de la cuenta, ordenadas por fecha descendente

#### Scenario: Detalle de orden desde historial
- **WHEN** el usuario hace clic en una orden de su historial
- **THEN** el sistema muestra el detalle completo de la orden con estado actual, ítems y datos de envío

---

### Requirement: Direcciones guardadas
El sistema SHALL permitir a usuarios registrados guardar hasta 5 direcciones de envío reutilizables en el checkout.

#### Scenario: Guardar dirección post-checkout
- **WHEN** un usuario logueado completa un checkout
- **THEN** el sistema ofrece "Guardar esta dirección para futuras compras" (opt-in)

#### Scenario: Seleccionar dirección guardada en checkout
- **WHEN** un usuario logueado con direcciones guardadas llega al paso de envío
- **THEN** el sistema muestra sus direcciones guardadas como opciones seleccionables antes del formulario manual

---

### Requirement: Wishlist
El sistema SHALL permitir a usuarios registrados guardar productos para comprar más tarde.

#### Scenario: Agregar a wishlist
- **WHEN** el usuario logueado hace clic en el ícono de corazón en un producto
- **THEN** el producto se agrega a su wishlist y el ícono cambia a estado activo

#### Scenario: Ver wishlist
- **WHEN** el usuario navega a `/cuenta/wishlist`
- **THEN** el sistema muestra todos los productos guardados con su precio y estado de stock actual

#### Scenario: Producto de wishlist sin stock
- **WHEN** un producto en la wishlist no tiene stock disponible
- **THEN** se muestra con badge "Sin stock" y el botón "Agregar al carrito" deshabilitado

#### Scenario: Usuario no logueado intenta usar wishlist
- **WHEN** un usuario no autenticado hace clic en el ícono de corazón
- **THEN** el sistema muestra un tooltip "Iniciá sesión para guardar favoritos" y redirige a login al hacer clic
