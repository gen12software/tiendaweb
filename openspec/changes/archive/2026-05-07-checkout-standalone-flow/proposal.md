## Why

El flujo de checkout actualmente se renderiza dentro del layout principal de la tienda, mostrando el header, menú de navegación y footer. Esto genera distracciones que reducen la tasa de conversión y no es una práctica estándar de UX para e-commerce. Además, al finalizar el pago no existe una pantalla de confirmación adecuada, lo que es crítico dado que los usuarios pueden no estar logueados y no tienen forma de recuperar su número de orden.

## What Changes

- El checkout (todas sus etapas: contacto, envío, pago) pasa a renderizarse en un layout propio sin header, menú ni footer
- Se agrega un único punto de regreso: un botón/link "← Volver al carrito" visible en todas las etapas
- Se crea una pantalla de confirmación post-pago (`/orden-confirmada/[id]`) que muestra el resumen completo de la compra con el número de orden, ítems, totales y datos de envío
- La pantalla de confirmación incluye un botón para copiar el número de orden al portapapeles y es accesible sin login
- **BREAKING**: El layout del checkout cambia; cualquier personalización del layout principal en esas rutas se pierde

## Capabilities

### New Capabilities
- `checkout-layout`: Layout standalone para el flujo de checkout (sin header/nav/footer, con botón volver al carrito)
- `order-confirmation`: Pantalla de confirmación post-pago con resumen de orden, número copiable y acceso sin login

### Modified Capabilities
<!-- No hay specs existentes en openspec/specs/ -->

## Impact

- `app/checkout/` — necesita un layout propio (`layout.tsx`) que reemplace el layout raíz
- `app/orden-confirmada/[id]/` — nueva ruta de confirmación
- `components/checkout/` — posibles ajustes de estilos al remover el contexto del layout principal
- `app/api/` — el webhook/creación de orden ya existe; la confirmación consume los datos de orden existentes
- Sin nuevas dependencias externas
