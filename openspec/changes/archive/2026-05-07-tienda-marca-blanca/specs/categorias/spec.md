## ADDED Requirements

### Requirement: CRUD de categorías desde admin
El sistema SHALL permitir al admin crear, editar, reordenar y desactivar categorías. Cada categoría tiene nombre, slug, imagen y estado activo/inactivo.

#### Scenario: Crear categoría
- **WHEN** el admin crea una categoría con nombre e imagen
- **THEN** el sistema genera automáticamente el slug (kebab-case del nombre) y guarda la categoría con `is_active = true`

#### Scenario: Desactivar categoría
- **WHEN** el admin desactiva una categoría
- **THEN** la categoría desaparece del catálogo público y de la home, pero los productos asociados NO se desactivan

#### Scenario: Editar nombre de categoría
- **WHEN** el admin edita el nombre de una categoría
- **THEN** el slug NO cambia automáticamente (evita romper links existentes); el admin puede cambiarlo manualmente si lo desea

---

### Requirement: Asignación de categoría a producto
El sistema SHALL permitir asignar una categoría a cada producto mediante un selector en el formulario de producto del admin. El campo es opcional.

#### Scenario: Producto sin categoría
- **WHEN** un producto no tiene categoría asignada
- **THEN** aparece en el catálogo general pero no en el filtro de ninguna categoría específica

#### Scenario: Selector de categoría en formulario de producto
- **WHEN** el admin edita un producto
- **THEN** el campo categoría muestra un dropdown con las categorías activas disponibles

---

### Requirement: Navegación pública por categoría
El sistema SHALL mostrar las categorías activas en la navegación del header y permitir filtrar el catálogo por categoría via URL (`/productos?categoria=[slug]`).

#### Scenario: Menú de categorías en header
- **WHEN** el visitante hace clic en "Categorías" en el header
- **THEN** se despliega un menú con las categorías activas ordenadas por `sort_order`

#### Scenario: URL de categoría directa
- **WHEN** el visitante navega a `/productos?categoria=remeras`
- **THEN** el catálogo muestra solo los productos de esa categoría con el filtro aplicado visualmente
