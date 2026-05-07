## Context

El checkout actual tiene 3 pasos: Contacto → Envío → Pago. Los datos de envío se guardan en `orders.shipping_address` (JSONB con `full_name`, `email`, `phone`, `street`, `city`, `state`, `postal_code`, `country`). La orden se crea en el webhook de Mercado Pago. No existe ningún campo de facturación ni en el frontend ni en la base de datos.

El formulario del paso de envío (`shipping-step.tsx`) y el paso de contacto (`contact-step.tsx`) están separados pero son visualmente compactos. El usuario a veces ya tiene una dirección guardada que se pre-carga.

## Goals / Non-Goals

**Goals:**
- Agregar un paso/sección de facturación en el checkout donde el usuario puede copiar los datos de envío o ingresar datos distintos.
- Campos de facturación: país/región, nombre, apellido, DNI, dirección y altura, casa/dpto (opcional), CP, ciudad, provincia, teléfono (opcional).
- Rediseño visual del formulario de checkout para que sea más legible y espacioso.
- Persistir `billing_data` en la tabla `orders` (migración aditiva, nueva columna JSONB).
- En el panel admin, permitir subir el PDF de factura y enviarlo al cliente por email.

**Non-Goals:**
- Generación automática de facturas (AFIP, CAE, etc.) — solo almacenamiento y reenvío manual.
- Cambiar el proveedor de pagos o el flujo de Mercado Pago.
- Autenticación obligatoria para facturar.

## Decisions

### 1. Dónde insertar la sección de facturación en el checkout

**Decisión**: Agregar la sección de facturación al final del paso 2 (Envío), no como un paso separado.

**Rationale**: Minimiza fricción. El usuario ya está llenando datos de dirección; agregar una sección colapsable/toggle ("¿Usar los mismos datos para la factura? Sí / No") dentro del mismo paso es más natural que un cuarto paso. Si elige "Sí", no ve nada más. Si elige "No", se expande el formulario de facturación.

**Alternativa descartada**: Paso 4 separado — agrega un paso extra al funnel, aumenta abandono.

### 2. Estructura del formulario de facturación

**Decisión**: Toggle radio/switch "Usar datos del envío / Ingresar otros datos". Si el usuario elige ingresar otros datos, se muestra el formulario completo de facturación. Al enviar el paso, se serializa `billing_data` junto con los datos de envío.

**Schema de `billing_data`**:
```ts
interface BillingAddress {
  same_as_shipping: boolean
  country?: string
  first_name?: string
  last_name?: string
  dni?: string
  street?: string       // dirección y altura
  apartment?: string    // casa/dpto (opcional)
  postal_code?: string
  city?: string
  state?: string
  phone?: string        // opcional
}
```

### 3. Persistencia en la base de datos

**Decisión**: Nueva columna `billing_data JSONB` en la tabla `orders`. Migración aditiva (no rompe nada existente). Si `billing_data.same_as_shipping = true`, se guarda igual pero con el flag para evitar ambigüedad.

**Alternativa descartada**: Tabla separada `order_billing` — overkill para datos que son 1:1 con la orden.

### 4. Flujo de datos hacia el webhook

Los datos de facturación viajan como metadata adicional en la Preference de Mercado Pago (campo `metadata`) junto con los datos de envío que ya se pasan. El webhook los extrae de `metadata` y los persiste en `billing_data`.

**Alternativa descartada**: Guardar billing_data en sessionStorage y hacer un PATCH de la orden después del webhook — introduce condición de carrera y complejidad innecesaria.

### 5. Subida de factura en el admin

**Decisión**: Nuevo endpoint `PATCH /api/orders/[id]/invoice` que acepta un archivo PDF, lo sube a Supabase Storage (bucket `invoices`, path `{order_id}/factura.pdf`), guarda la URL en `orders.invoice_url`, y dispara el envío de email al cliente con el PDF adjunto o link de descarga.

Nuevo campo en `orders`: `invoice_url TEXT NULLABLE`.

### 6. Rediseño visual del checkout

**Decisión**: Ampliar el ancho del formulario y aumentar el espaciado entre campos. Usar `Card` de shadcn/ui con padding generoso. Los campos de dirección en grid 2 columnas en desktop. El formulario de facturación con el mismo estilo, revelado con animación suave (Collapsible de shadcn/ui).

## Risks / Trade-offs

- **Metadata de MP tiene límite de tamaño** → El JSON de billing es pequeño (~500 bytes), bien dentro del límite. Mitigación: truncar campos si exceden longitud máxima.
- **Webhook puede llegar antes de que el usuario complete el formulario** → No aplica: la Preference se crea al hacer click en "Pagar", que es después de completar todos los pasos.
- **PDF de factura en Storage público** → Usar bucket privado con URLs firmadas (signed URLs) para proteger documentos. El link en el email debe ser una URL firmada con expiración larga (1 año).

## Migration Plan

1. Agregar columna `billing_data JSONB` a `orders` — nueva migración aditiva `0XX_add_billing_data.sql`.
2. Agregar columna `invoice_url TEXT` a `orders` — misma migración.
3. Deploy frontend + backend juntos (no hay breaking changes en la DB).
4. Rollback: las columnas son nullable, ignorarlas no rompe nada.

## Open Questions

- ¿El email de envío de factura debe ser el mismo template que la confirmación de compra, o uno nuevo? (Asumo uno nuevo, más simple.)
- ¿El bucket de Supabase Storage para facturas ya existe o hay que crearlo? (Asumo que hay que crearlo.)
