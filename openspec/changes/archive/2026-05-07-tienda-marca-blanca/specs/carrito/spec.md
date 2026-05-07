## ADDED Requirements

### Requirement: Carrito persistido sin login
El sistema SHALL mantener el estado del carrito en `localStorage` para usuarios no autenticados. El carrito SHALL ser accesible y editable sin ninguna sesión activa.

#### Scenario: Agregar producto al carrito
- **WHEN** el usuario hace clic en "Agregar al carrito" desde el detalle o listado de un producto
- **THEN** el ítem se agrega al carrito en `localStorage` y el ícono del carrito muestra el nuevo conteo

#### Scenario: Agregar variante específica
- **WHEN** el usuario selecciona una variante y hace clic en "Agregar al carrito"
- **THEN** el carrito almacena el `product_id` y el `variant_id` de la variante seleccionada

#### Scenario: Ítem ya existente en el carrito
- **WHEN** el usuario agrega un producto/variante que ya está en el carrito
- **THEN** el sistema incrementa la cantidad del ítem existente en lugar de crear un duplicado

#### Scenario: Cambiar cantidad desde el carrito
- **WHEN** el usuario modifica la cantidad de un ítem en la vista del carrito
- **THEN** el carrito actualiza la cantidad y recalcula el subtotal

#### Scenario: Eliminar ítem del carrito
- **WHEN** el usuario hace clic en el botón de eliminar de un ítem
- **THEN** el ítem desaparece del carrito y el total se recalcula

#### Scenario: Carrito vacío
- **WHEN** el usuario abre el carrito y no tiene ítems
- **THEN** el sistema muestra un mensaje "Tu carrito está vacío" y un enlace al catálogo

---

### Requirement: Fusión de carrito al loguearse
El sistema SHALL fusionar el carrito de `localStorage` con el carrito guardado en servidor cuando un usuario inicia sesión.

#### Scenario: Login con carrito local no vacío
- **WHEN** un usuario con ítems en su carrito local inicia sesión
- **THEN** el sistema envía el carrito local al servidor, lo fusiona con el carrito guardado (sumando cantidades del mismo producto) y actualiza `localStorage` con el resultado fusionado

#### Scenario: Login sin carrito local
- **WHEN** un usuario sin ítems locales inicia sesión
- **THEN** el sistema carga el carrito guardado en servidor (si existe) a `localStorage`

#### Scenario: Logout con carrito activo
- **WHEN** un usuario logueado con carrito cierra sesión
- **THEN** el sistema limpia `localStorage` del carrito (el carrito queda guardado en servidor para la próxima sesión)

---

### Requirement: Validación de stock en carrito
El sistema SHALL validar la disponibilidad de stock de los ítems del carrito antes de proceder al checkout.

#### Scenario: Producto sin stock al iniciar checkout
- **WHEN** el usuario intenta proceder al checkout y un ítem del carrito tiene stock insuficiente
- **THEN** el sistema bloquea el checkout, resalta el ítem problemático y muestra el stock disponible actual

#### Scenario: Cantidad mayor al stock disponible
- **WHEN** la cantidad de un ítem supera el stock disponible
- **THEN** el sistema ajusta la cantidad al máximo disponible y notifica al usuario
