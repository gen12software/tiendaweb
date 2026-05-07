## ADDED Requirements

### Requirement: Página de inicio configurable
El sistema SHALL mostrar una página de inicio (`/`) con secciones configurables desde el panel admin. El contenido de cada sección (textos, imágenes, visibilidad) SHALL poder editarse sin tocar código.

#### Scenario: Hero visible con configuración cargada
- **WHEN** un visitante accede a la raíz de la tienda
- **THEN** el sistema muestra la sección hero con el título, subtítulo, imagen de fondo y texto del botón CTA configurados en `site_config`

#### Scenario: Hero sin configuración
- **WHEN** las claves del hero no están configuradas en `site_config`
- **THEN** el sistema muestra valores por defecto genéricos (nunca una pantalla en blanco ni error)

---

### Requirement: Sección de productos destacados en home
El sistema SHALL mostrar una grilla de productos con `is_featured = true` en la página de inicio. La sección SHALL ser ocultable desde el admin.

#### Scenario: Productos destacados visibles
- **WHEN** existen productos activos con `is_featured = true` y la sección está habilitada
- **THEN** la home muestra hasta 8 productos destacados en grilla, con imagen, nombre y precio

#### Scenario: Sin productos destacados
- **WHEN** no hay productos con `is_featured = true`
- **THEN** la sección no se muestra (no ocupa espacio vacío)

#### Scenario: Sección deshabilitada desde admin
- **WHEN** el admin deshabilita la sección de destacados en configuración
- **THEN** la sección no aparece en la home pública

---

### Requirement: Sección de categorías en home
El sistema SHALL mostrar las categorías activas con imagen en la página de inicio, permitiendo al comprador navegar directamente a cada una. La sección SHALL ser ocultable desde el admin.

#### Scenario: Categorías visibles en home
- **WHEN** existen categorías activas y la sección está habilitada
- **THEN** la home muestra las categorías con su imagen y nombre como links al catálogo filtrado

#### Scenario: Click en categoría desde home
- **WHEN** el visitante hace clic en una categoría
- **THEN** navega a `/productos?categoria=[slug]` con el filtro aplicado

---

### Requirement: Sección CTA configurable
El sistema SHALL mostrar una sección de llamada a la acción con texto e imagen configurables desde el admin.

#### Scenario: CTA con configuración
- **WHEN** `home_cta_title`, `home_cta_subtitle` y `home_cta_url` están configurados
- **THEN** la home muestra la sección CTA con esos valores

#### Scenario: CTA oculto
- **WHEN** el admin deshabilita la sección CTA
- **THEN** no aparece en la home
