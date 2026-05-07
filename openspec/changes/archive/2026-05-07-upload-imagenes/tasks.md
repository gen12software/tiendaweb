## 1. Componente ImageUploader

- [x] 1.1 Crear `components/ui/image-uploader.tsx`: componente cliente con props `folder`, `name`, `defaultValue`, `multiple`, `maxFiles` (default 10), `maxSizeMB` (default 5)
- [x] 1.2 Implementar modo single: zona de drop/click, preview de imagen actual, estado de carga, mensaje de error
- [x] 1.3 Implementar modo multiple (`MultiImageUploader`): grilla de previews, botón "Agregar imagen", eliminación individual, límite de `maxFiles`
- [x] 1.4 Validar tamaño de archivo antes de subir: rechazar si supera `maxSizeMB` con mensaje claro
- [x] 1.5 Inyectar `<input type="hidden">` con la URL resultante (modo single) para compatibilidad con Server Actions

## 2. next.config.ts — remotePatterns

- [x] 2.1 Agregar el dominio de Supabase Storage a `images.remotePatterns` en `next.config.ts`

## 3. CategoryForm — reemplazar campo URL por ImageUploader

- [x] 3.1 Importar `ImageUploader` en `category-form.tsx`
- [x] 3.2 Reemplazar `<input type="url" name="image_url">` por `<ImageUploader name="image_url" folder="categorias" defaultValue={category?.image_url} />`
- [x] 3.3 El Server Action existente (`saveCategoryAction`) recibe la URL correctamente sin cambios

## 4. ProductForm — reescribir a componente cliente completo con multi-imagen

- [x] 4.1 Reescribir `product-form.tsx` como componente cliente completo (sin `useActionState`)
- [x] 4.2 Estado local para todos los campos del producto
- [x] 4.3 Sección de imágenes con `<MultiImageUploader folder="productos" maxFiles={10} />`
- [x] 4.4 `handleSubmit`: upsert en `products` → obtener `product.id` → delete de `product_images` → insert nuevas filas
- [x] 4.5 Imágenes existentes cargadas desde `product.product_images` (ya joinado en la page de edición)
- [x] Eliminar `saveProductAction` de `actions.ts` (sin uso)

## 5. HeroSlideForm — migrar al componente unificado

- [x] 5.1 Reemplazar lógica de upload inline por `<ImageUploader name="image_url" folder="hero" defaultValue={slide?.image_url} />`
- [x] 5.2 Eliminar estados `imageUrl`, `uploading` y función `handleImageUpload`
