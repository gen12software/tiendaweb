## Context

El bucket `product-images` en Supabase Storage ya existe y ya está en uso por el hero de home (`hero-slide-form.tsx`). Ese formulario tiene su propia lógica de upload inline. El objetivo es extraer esa lógica en un componente reutilizable y aplicarlo a categorías y productos, sin cambiar el schema de la base de datos.

Los formularios de categorías y productos usan actualmente Server Actions vía `useActionState`. El upload de imágenes es inherentemente cliente (acceso a `File`, llamada a Supabase Storage). La solución es un componente cliente que sube la imagen y guarda la URL resultante en un `<input type="hidden">` — así el Server Action sigue recibiendo la URL como dato de formulario, sin saber que fue un upload.

Para productos, la tabla `product_images` es separada (FK a `products.id`). Las imágenes no viajan en el mismo Server Action que los datos del producto. El formulario de producto se convierte a componente cliente completo (igual que `hero-slide-form`) para manejar el flujo: subir imágenes → guardar producto → guardar filas en `product_images`.

---

## Decisions

### D1 — Componente `ImageUploader` con hidden input

**Decisión**: `ImageUploader` es un componente cliente que recibe `name` (nombre del campo para el hidden input), `folder` (subcarpeta en el bucket), `defaultValue` (URL actual si se está editando) y `multiple` (boolean). Internamente maneja el upload a Supabase Storage y refleja la URL resultante en un `<input type="hidden" name={name}>` para que el Server Action la reciba automáticamente.

**Rationale**: El Server Action no necesita cambios — sigue leyendo `formData.get('image_url')`. El componente es un drop-in replacement del `<input type="url">` actual.

**Alternativa descartada**: Route handler `/api/upload` en el servidor. Agrega una capa innecesaria — Supabase Storage ya tiene SDK cliente y el bucket es público.

---

### D2 — Modo multi-imagen para productos

**Decisión**: En modo `multiple`, `ImageUploader` maneja un array de URLs localmente. Cada imagen subida se agrega al array; cada imagen existente se puede eliminar. Al cambiar el array, sincroniza múltiples `<input type="hidden" name="images[]">` en el DOM. Como el formulario de producto ya es cliente (D3), estos valores se leen directamente del estado, no del FormData.

**Rationale**: Los `<input type="hidden">` múltiples funcionan con Server Actions pero el formulario de producto igual necesita ser cliente por el flujo de dos pasos (guardar producto → guardar imágenes). Usar estado directo es más simple.

---

### D3 — ProductForm se convierte a componente cliente completo

**Decisión**: `product-form.tsx` se reescribe como componente cliente (igual que `hero-slide-form.tsx`), sin `useActionState`. El submit llama directamente al cliente de Supabase: primero upsert del producto, luego delete + insert de `product_images` con las URLs del estado.

**Rationale**: `product_images` requiere el `product.id` para insertar las filas, lo que implica dos operaciones secuenciales. Server Actions con `useActionState` no tienen mecanismo limpio para retornar el ID y continuar con una segunda operación cliente. El componente cliente tiene control total del flujo.

**Alternativa descartada**: Server Action que maneje ambas operaciones con las URLs como campos ocultos. Viable pero obliga a serializar el array de URLs en el FormData, agrega complejidad de parsing y no simplifica nada.

---

### D4 — CategoryForm: híbrido (Server Action + upload cliente)

**Decisión**: `category-form.tsx` mantiene su Server Action para nombre y orden, pero agrega el componente `ImageUploader` con `name="image_url"`. El hidden input inyecta la URL en el FormData antes del submit. El Server Action existente no necesita cambios.

**Rationale**: La categoría tiene un solo campo de imagen y el Server Action es simple. No tiene sentido reescribirlo a cliente completo.

---

### D5 — Carpetas en el bucket

**Decisión**: Se usan tres prefijos dentro del mismo bucket `product-images`:
- `hero/` — ya existente (sin cambios)
- `categorias/` — imágenes de categorías
- `productos/` — imágenes de productos

**Rationale**: Un solo bucket con prefijos es suficiente para este volumen. No requiere crear nuevos buckets ni cambiar políticas de Storage.

---

### D6 — next.config.ts: remotePatterns para Supabase

**Decisión**: Se agrega el dominio de Supabase Storage a `images.remotePatterns` en `next.config.ts` para que `next/image` pueda optimizar las imágenes subidas.

**Rationale**: Sin esto, `<Image>` de Next.js rechaza URLs externas y hay que usar `<img>` nativo, perdiendo optimización automática.

---

## Risks / Trade-offs

**[Imágenes huérfanas en Storage]** → Si el usuario sube una imagen y cancela el formulario sin guardar, el archivo queda en Storage sin referencia. Mitigación fuera de scope — es un problema menor de storage cost que se puede limpiar manualmente.

**[ProductForm sin Server Action]** → Al pasar a cliente completo, perdemos el beneficio de Progressive Enhancement (funciona sin JS). Aceptable: el panel admin requiere JS para funcionar de todas formas.

**[Tamaño de archivos]** → No hay validación de tamaño en el componente. Un usuario podría subir un PNG de 20MB. Mitigación: agregar validación de `file.size` en el componente con límite de 5MB y mensaje de error claro.
