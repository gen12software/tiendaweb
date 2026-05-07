## ADDED Requirements

### Requirement: Subida de factura desde el panel de administración
El sistema SHALL permitir a un administrador subir un archivo PDF de factura para una orden existente. El archivo SHALL almacenarse en Supabase Storage y la URL SHALL guardarse en `orders.invoice_url`.

#### Scenario: Admin sube factura exitosamente
- **WHEN** el administrador selecciona un archivo PDF y confirma la subida en el panel de la orden
- **THEN** el archivo se sube a Storage en la ruta `{order_id}/factura.pdf`, `orders.invoice_url` se actualiza con la URL firmada, y se muestra confirmación de éxito

#### Scenario: Archivo no es PDF
- **WHEN** el administrador intenta subir un archivo que no es PDF
- **THEN** el sistema muestra un error y no realiza la subida

#### Scenario: Reemplazar factura existente
- **WHEN** ya existe una `invoice_url` para la orden y el admin sube un nuevo archivo
- **THEN** el archivo anterior se sobreescribe en Storage y `invoice_url` se actualiza

### Requirement: Envío de factura al cliente por email
El sistema SHALL permitir al administrador enviar la factura al cliente por email desde el panel de la orden, incluyendo un link de descarga seguro al PDF.

#### Scenario: Envío de factura exitoso
- **WHEN** el administrador hace click en "Enviar factura al cliente" y existe una `invoice_url`
- **THEN** el sistema envía un email al `email` de la orden con un link firmado (signed URL) de descarga del PDF, y registra la acción

#### Scenario: Intento de envío sin factura cargada
- **WHEN** el administrador hace click en "Enviar factura al cliente" pero `invoice_url` es null
- **THEN** el sistema muestra un error indicando que primero debe cargar la factura

### Requirement: Visualización de datos de facturación en la orden (admin)
El sistema SHALL mostrar los datos de facturación (`billing_data`) de cada orden en la vista de detalle de orden del panel de administración.

#### Scenario: Orden con same_as_shipping
- **WHEN** el admin visualiza una orden cuyo `billing_data.same_as_shipping = true`
- **THEN** se muestra el texto "Facturación: mismos datos que el envío"

#### Scenario: Orden con datos de facturación propios
- **WHEN** el admin visualiza una orden con `billing_data` conteniendo datos propios
- **THEN** se muestran todos los campos de facturación en la vista de detalle de la orden
