## ADDED Requirements

### Requirement: Sección de facturación en el checkout
El sistema SHALL mostrar una sección de facturación al final del paso de envío del checkout, con un toggle que permita al usuario elegir entre usar los mismos datos de envío o ingresar datos de facturación distintos.

#### Scenario: Usuario elige usar los mismos datos del envío
- **WHEN** el usuario selecciona "Usar los mismos datos del envío" en la sección de facturación
- **THEN** no se muestra ningún formulario adicional y `billing_data.same_as_shipping = true` se envía junto con la orden

#### Scenario: Usuario elige ingresar datos de facturación distintos
- **WHEN** el usuario selecciona "Ingresar otros datos" en la sección de facturación
- **THEN** se muestra un formulario con los campos: país/región, nombre, apellido, DNI, dirección y altura, casa/dpto (opcional), código postal, ciudad, provincia, teléfono (opcional)

#### Scenario: Validación de campos requeridos de facturación
- **WHEN** el usuario elige "Ingresar otros datos" y omite un campo requerido (nombre, apellido, DNI, dirección, CP, ciudad, provincia, país)
- **THEN** el sistema muestra un mensaje de error en el campo faltante y no permite avanzar al paso de pago

#### Scenario: Campos opcionales de facturación
- **WHEN** el usuario no completa casa/dpto o teléfono en el formulario de facturación
- **THEN** el sistema acepta el formulario sin error para esos campos

### Requirement: Rediseño visual del formulario de checkout
El sistema SHALL presentar el formulario de checkout con un diseño más espacioso y legible, usando un ancho mayor y grid de 2 columnas para los campos de dirección en pantallas desktop.

#### Scenario: Layout en desktop
- **WHEN** el usuario accede al checkout desde un dispositivo con ancho ≥ 768px
- **THEN** los campos de dirección (calle, ciudad, provincia, CP) se muestran en un grid de 2 columnas

#### Scenario: Layout en mobile
- **WHEN** el usuario accede al checkout desde un dispositivo con ancho < 768px
- **THEN** todos los campos se muestran en una sola columna, apilados verticalmente

### Requirement: Persistencia de datos de facturación en la orden
El sistema SHALL incluir `billing_data` en los metadatos enviados a Mercado Pago al crear la Preference, y el webhook SHALL persistir ese dato en la columna `billing_data` de la tabla `orders`.

#### Scenario: Orden creada con billing_data same_as_shipping
- **WHEN** el webhook recibe un pago aprobado con `metadata.billing_data.same_as_shipping = true`
- **THEN** la orden se crea con `billing_data = { same_as_shipping: true }`

#### Scenario: Orden creada con billing_data distinto al envío
- **WHEN** el webhook recibe un pago aprobado con `metadata.billing_data` conteniendo datos de facturación propios
- **THEN** la orden se crea con `billing_data` igual al objeto recibido, incluyendo todos los campos completados
