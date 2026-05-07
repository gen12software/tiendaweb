## Why

El flujo de checkout no permite capturar datos de facturación separados de los de envío, lo que impide emitir facturas correctas para los clientes. Se necesita ahora porque es un requisito legal/operativo para cerrar ventas con comprobante fiscal.

## What Changes

- Nuevo paso de facturación en el checkout: el usuario puede elegir "usar los mismos datos del envío" o ingresar datos de facturación distintos.
- Campos de facturación: país/región, nombre, apellido, DNI, dirección y altura, casa/departamento (opcional), código postal, ciudad, provincia, teléfono (opcional).
- Rediseño visual del formulario de checkout (actualmente es muy pequeño y poco legible).
- El backend recibe y persiste los datos de facturación junto con cada orden.
- Panel de administración: posibilidad de cargar/adjuntar la factura generada y enviarla al cliente por email.

## Capabilities

### New Capabilities

- `checkout-billing`: Captura de datos de facturación en el checkout, con opción de copiar datos del envío o ingresar datos separados. Incluye rediseño del formulario.
- `order-invoice`: Gestión de facturas en el backend/admin: persistencia de datos de facturación en la orden, carga de archivo de factura y envío al cliente.

### Modified Capabilities

<!-- ninguna -->

## Impact

- **Frontend**: páginas/componentes del checkout (`app/checkout/` o equivalente), formularios de dirección/envío.
- **Backend/API**: schema de la orden (nuevo campo `billingData`), endpoint de creación de orden, endpoint de admin para subir factura y notificar al cliente.
- **Base de datos**: migración aditiva para agregar `billingData` a la tabla/colección de órdenes y campo para la URL/path de la factura.
- **Email**: nueva plantilla o adjunto para envío de factura al cliente.
