## ADDED Requirements

### Requirement: Checkout sin cuenta obligatoria
El sistema SHALL permitir completar una compra sin que el usuario tenga o cree una cuenta. El email del comprador es el único dato de identidad requerido.

#### Scenario: Acceso al checkout sin sesión
- **WHEN** un usuario no autenticado con ítems en el carrito navega a `/checkout`
- **THEN** el sistema muestra el formulario de checkout sin redirigir a login

#### Scenario: Acceso al checkout con sesión activa
- **WHEN** un usuario autenticado navega a `/checkout`
- **THEN** el sistema pre-rellena los campos con los datos del perfil y última dirección guardada

#### Scenario: Carrito vacío intenta acceder a checkout
- **WHEN** el usuario navega a `/checkout` sin ítems en el carrito
- **THEN** el sistema redirige a `/productos` con un mensaje "Agregá productos antes de continuar"

---

### Requirement: Flujo de 3 pasos
El sistema SHALL estructurar el checkout en tres pasos secuenciales: (1) Contacto, (2) Envío, (3) Pago. El usuario puede retroceder a cualquier paso completado.

#### Scenario: Paso 1 — Datos de contacto
- **WHEN** el usuario completa nombre, email y teléfono y hace clic en "Continuar"
- **THEN** el sistema valida los campos, guarda los datos en el estado del checkout y avanza al paso 2

#### Scenario: Email ya registrado en paso 1
- **WHEN** el usuario ingresa un email que corresponde a una cuenta existente
- **THEN** el sistema muestra una sugerencia "Ya tenés una cuenta con este email. ¿Querés iniciar sesión para ver tu historial?" (no bloquea el flujo)

#### Scenario: Paso 2 — Datos de envío
- **WHEN** el usuario completa dirección, ciudad, provincia y código postal y hace clic en "Continuar"
- **THEN** el sistema valida los campos, calcula el costo de envío según el método seleccionado y avanza al paso 3

#### Scenario: Selección de método de envío
- **WHEN** el usuario está en el paso 2
- **THEN** el sistema muestra los métodos de envío activos (`shipping_methods`) con nombre, precio y días estimados

#### Scenario: Paso 3 — Pago
- **WHEN** el usuario llega al paso 3
- **THEN** el sistema muestra el resumen de la orden (ítems, envío, total) y el botón "Pagar con MercadoPago"

#### Scenario: Retroceder a paso anterior
- **WHEN** el usuario hace clic en un paso ya completado en el indicador de progreso
- **THEN** el sistema vuelve a ese paso manteniendo los datos ya ingresados

---

### Requirement: Creación de orden al confirmar pago
El sistema SHALL crear una orden en estado `pending` antes de redirigir al checkout de MercadoPago.

#### Scenario: Confirmación de pago exitosa
- **WHEN** MercadoPago confirma el pago via webhook
- **THEN** el sistema actualiza la orden a estado `paid`, descuenta el stock de cada variante y envía email de confirmación al comprador

#### Scenario: Pago rechazado
- **WHEN** MercadoPago reporta el pago como rechazado
- **THEN** la orden pasa a estado `payment_failed` y el usuario es redirigido a `/checkout/error` con un mensaje claro y opción de reintentar

#### Scenario: Oferta de cuenta post-compra
- **WHEN** la orden se confirma como pagada y el comprador no tiene cuenta
- **THEN** la página de confirmación muestra la opción "Creá tu cuenta para ver el historial de tus compras" (no obligatorio)

---

### Requirement: Envío gratis a partir de monto configurable
El sistema SHALL mostrar un indicador de progreso hacia el envío gratis cuando el subtotal del carrito no alcanza el monto mínimo configurado. El monto SHALL ser configurable desde el admin.

#### Scenario: Carrito por debajo del monto de envío gratis
- **WHEN** `free_shipping_threshold` está configurado y el subtotal del carrito es menor
- **THEN** el drawer del carrito y el checkout muestran "Te faltan $X para el envío gratis"

#### Scenario: Carrito que alcanza el monto de envío gratis
- **WHEN** el subtotal alcanza o supera `free_shipping_threshold`
- **THEN** el método de envío gratis se aplica automáticamente y el carrito muestra "¡Conseguiste envío gratis!"

#### Scenario: Envío gratis no configurado
- **WHEN** `free_shipping_threshold` no está configurado
- **THEN** no se muestra ningún indicador de progreso (feature desactivada)

---

### Requirement: Validación de formularios de checkout
El sistema SHALL validar todos los campos del checkout con esquemas Zod antes de permitir avanzar al paso siguiente.

#### Scenario: Campo requerido vacío
- **WHEN** el usuario intenta avanzar dejando un campo requerido vacío
- **THEN** el campo se resalta en rojo con un mensaje de error descriptivo debajo

#### Scenario: Email inválido
- **WHEN** el usuario ingresa un texto que no es un email válido
- **THEN** el campo muestra "Ingresá un email válido" sin permitir avanzar

#### Scenario: Formulario válido
- **WHEN** todos los campos del paso actual pasan la validación Zod
- **THEN** el usuario puede avanzar al siguiente paso
