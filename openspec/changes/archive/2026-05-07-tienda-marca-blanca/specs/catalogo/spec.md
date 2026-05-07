## ADDED Requirements

### Requirement: Listado de productos
El sistema SHALL mostrar todos los productos activos de la tienda en una página de catálogo con soporte de filtrado, ordenamiento y búsqueda. El listado SHALL ser accesible sin autenticación.

#### Scenario: Visitante accede al catálogo
- **WHEN** un usuario (logueado o no) navega a `/productos`
- **THEN** el sistema muestra todos los productos con `is_active = true` del `store_id` activo, paginados de a 24 por página

#### Scenario: Filtrado por categoría
- **WHEN** el usuario selecciona una categoría del filtro
- **THEN** el listado muestra únicamente los productos de esa categoría, manteniendo otros filtros activos

#### Scenario: Búsqueda por texto
- **WHEN** el usuario escribe un término en el buscador y confirma
- **THEN** el sistema filtra productos cuyo nombre o descripción contengan el término (búsqueda case-insensitive)

#### Scenario: Ordenamiento
- **WHEN** el usuario selecciona un criterio de orden (precio asc, precio desc, nombre, más reciente)
- **THEN** el listado se reordena según el criterio seleccionado sin recargar la página

#### Scenario: Sin resultados
- **WHEN** los filtros aplicados no devuelven ningún producto
- **THEN** el sistema muestra un mensaje "No encontramos productos con esos filtros" y un botón para limpiar filtros

---

### Requirement: Detalle de producto
El sistema SHALL mostrar una página de detalle por producto con imágenes, descripción, variantes disponibles, precio y botón de agregar al carrito.

#### Scenario: Acceso a detalle de producto activo
- **WHEN** el usuario navega a `/productos/[slug]` de un producto activo
- **THEN** el sistema muestra el producto con todas sus imágenes, descripción completa, variantes disponibles y precio

#### Scenario: Selección de variante
- **WHEN** el usuario selecciona una combinación de opciones (ej: talle L + color Rojo)
- **THEN** el sistema muestra el precio y stock de esa variante específica y habilita/deshabilita el botón de compra según disponibilidad

#### Scenario: Variante sin stock
- **WHEN** el usuario selecciona una variante con `stock = 0`
- **THEN** el botón "Agregar al carrito" se reemplaza por "Sin stock" (deshabilitado)

#### Scenario: Producto inactivo o inexistente
- **WHEN** el usuario navega a un slug que no existe o cuyo producto tiene `is_active = false`
- **THEN** el sistema devuelve una página 404

#### Scenario: Galería de imágenes
- **WHEN** el producto tiene múltiples imágenes
- **THEN** el sistema muestra una imagen principal y miniaturas navegables; al hacer clic en una miniatura, cambia la imagen principal

---

### Requirement: Precio de comparación y descuento
El sistema SHALL mostrar el precio original tachado y el precio con descuento cuando el producto tiene `compare_at_price` configurado. El porcentaje de ahorro SHALL calcularse automáticamente.

#### Scenario: Producto con precio de comparación
- **WHEN** un producto tiene `compare_at_price` mayor a `price`
- **THEN** el catálogo y el detalle muestran el precio original tachado, el precio actual y un badge con el porcentaje de descuento (ej: "-30%")

#### Scenario: Producto sin precio de comparación
- **WHEN** `compare_at_price` es nulo o igual a `price`
- **THEN** solo se muestra el precio actual, sin badge de descuento

---

### Requirement: Indicador de stock bajo
El sistema SHALL alertar al comprador cuando el stock disponible de una variante es bajo, generando sentido de urgencia.

#### Scenario: Stock bajo visible en detalle
- **WHEN** la variante seleccionada tiene stock mayor a 0 pero menor o igual a 5
- **THEN** el detalle del producto muestra "¡Solo quedan X unidades!" junto al selector de variante

---

### Requirement: SEO básico por producto
El sistema SHALL generar meta tags de título, descripción y Open Graph para cada página de producto, usando los datos cargados por el admin.

#### Scenario: Meta tags de producto
- **WHEN** el buscador o red social accede a `/productos/[slug]`
- **THEN** la página tiene `<title>` con el nombre del producto, `<meta name="description">` con los primeros 160 caracteres de la descripción, y tags Open Graph con imagen y título
