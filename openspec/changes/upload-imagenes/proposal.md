## Why

Hoy todas las imágenes de la tienda (productos, categorías, hero/banner) se cargan pegando una URL a mano. Eso es un problema operativo real: el cliente tiene que subir la imagen a algún servicio externo (Drive, Imgur, etc.), obtener un link público, copiarlo y pegarlo en el formulario — y si el link se rompe o el servicio cambia permisos, la imagen desaparece. El flujo correcto para un panel admin orientado a un cliente no técnico es: seleccionás el archivo desde tu dispositivo, lo subís, aparece. Nada más.

El bucket `product-images` en Supabase Storage ya existe — el hero de home ya lo usa. La infraestructura está, falta extenderla al resto de las entidades.

## What Changes

- Los formularios de **productos**, **categorías** y **hero slides** reemplazan el campo de URL por un componente de upload con preview
- El componente de upload es único y reutilizable: acepta un archivo desde el dispositivo, lo sube a Supabase Storage, y devuelve la URL pública resultante
- En productos, el upload soporta **múltiples imágenes** con reordenamiento y eliminación individual
- Las imágenes existentes (cargadas como URL) siguen funcionando — no hay migración de datos
- El campo de URL desaparece del formulario; la URL se genera automáticamente tras el upload y se guarda en la misma columna de la base de datos que antes

## Capabilities Afectadas

### Nueva Capability

- `image-upload`: Componente reutilizable de carga de imágenes. Recibe un archivo del dispositivo (drag-and-drop o click), lo sube a Supabase Storage bajo una ruta configurable por entidad (`hero/`, `categorias/`, `productos/`), muestra preview inmediato y devuelve la URL pública. Soporta modo single y modo multi-imagen. Maneja errores de upload con feedback visual.

### Capabilities Modificadas

- `panel-admin-tienda` — productos: el formulario de producto reemplaza el campo URL por el componente de upload en modo multi-imagen. Permite agregar hasta 10 imágenes, reordenarlas y eliminarlas individualmente.
- `panel-admin-tienda` — categorías: el formulario de categoría reemplaza el campo URL por el componente de upload en modo single.
- `home` — hero slides: el formulario de hero slide ya tiene upload propio; se migra al componente unificado para consistencia.

## Non-Goals

- No se cambia el schema de la base de datos — las columnas `url`, `image_url` siguen siendo `text`
- No se implementa redimensionado ni optimización de imágenes en el servidor
- No se agrega gestión de una librería de medios (media library) — cada upload es independiente
- No se implementa eliminación automática del storage al borrar una entidad (las imágenes huérfanas se limpian manualmente o en una tarea futura)

## Impact

- **Archivos nuevos**: `components/ui/image-uploader.tsx` (componente reutilizable)
- **Archivos modificados**: `app/admin/productos/product-form.tsx`, `app/admin/categorias/category-form.tsx`, `app/admin/hero/hero-slide-form.tsx`
- **Supabase Storage**: se reutiliza el bucket existente `product-images`; se agregan las carpetas `categorias/` y `productos/` como prefijos de path
- **next.config.ts**: se agrega el dominio de Supabase Storage a `images.remotePatterns` para que `next/image` pueda servir las imágenes
- **Sin cambios**: APIs, schema, lógica de negocio, tienda pública
