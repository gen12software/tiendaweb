## Context

La tienda está construida con Next.js App Router + Tailwind CSS + shadcn/ui. El sistema de theming inyecta CSS custom properties (`--color-primary`, `--color-secondary`, etc.) desde `site_config` en el servidor. El rediseño debe operar dentro de este sistema — los cambios de color del cliente desde el admin siguen funcionando después del rediseño.

El objetivo es reemplazar la apariencia actual por una estética **2026**: minimalista sin ser fría, generosa en espaciado, tipografía con personalidad, imágenes dominantes.

---

## Goals / Non-Goals

**Goals:**
- Tienda pública visualmente a la altura de referencias como Zara, Muji, Faire o tiendas Shopify modernas
- Panel admin con la claridad y densidad de herramientas como Linear, Vercel Dashboard o Shopify Admin 2024
- Transiciones y hover states que den sensación de fluidez sin ser distractivos
- Accesibilidad básica: contraste AA, foco visible, navegación por teclado (no regresión vs estado actual)

**Non-Goals:**
- Animaciones de entrada complejas (scroll-triggered, parallax)
- Rediseño de emails transaccionales
- Nuevo sistema de íconos (se mantiene Lucide)
- Storybook o documentación de componentes

---

## Decisions

### D1 — Pareja tipográfica

**Decisión**: Una sans-serif geométrica moderna para headings (`font_heading`) y una sans-serif neutral de alta legibilidad para body (`font_body`). Candidatos a evaluar en la fase de implementación: `Geist` / `Inter` (body), `Cal Sans` / `DM Sans` / `Plus Jakarta Sans` (heading).

**Rationale**: Las fuentes del sistema no tienen personalidad; una pareja bien elegida diferencia visualmente la marca sin agregar complejidad técnica — ya están disponibles via Google Fonts y el sistema las inyecta dinámicamente.

---

### D2 — Paleta base de la tienda pública

**Decisión**: Fondo blanco roto (`#FAFAF9` o similar), texto casi negro (`#1A1A1A`), superficies sutilmente diferenciadas. El color primario del cliente se usa en CTAs, badges y acentos — no en fondos de grandes áreas. Los colores de `site_config` existentes se mantienen como la fuente de verdad; el rediseño redefine *dónde* y *cómo* se aplican.

**Rationale**: El fondo blanco roto es más cálido que `#FFFFFF` puro y hace que las imágenes de producto se vean mejor. El protagonismo visual lo tienen los productos, no la UI.

---

### D3 — Paleta del panel admin

**Decisión**: Sidebar oscuro (`#0F0F10` o similar) con íconos y texto claros. Área de contenido en gris muy claro (`#F4F4F5`). Cards y formularios en blanco. El dark mode completo usa `oklch` variables de Tailwind v4 para garantizar correcta percepción de contraste.

**Rationale**: Sidebar oscuro es el patrón dominante en herramientas admin 2024 (Linear, Vercel, Shopify). Da sensación de control y separa visualmente la navegación del contenido sin necesitar bordes.

---

### D4 — Cards de producto: sin bordes, elevación solo en hover

**Decisión**: Las cards del catálogo no tienen borde ni sombra en reposo. En hover aparece una sombra sutil (`box-shadow`) y la imagen hace zoom suave (`scale-105` con `overflow-hidden`). El precio y el nombre tienen tipografía sin caja/borde.

**Rationale**: Menos ruido visual. Las cards "aparecen" cuando el usuario las toca — da sensación de respuesta sin contaminación visual en reposo.

---

### D5 — Header: transparent → solid en scroll

**Decisión**: Sobre el hero de la home, el header es transparente con texto blanco. Al hacer scroll más de 80px (o al entrar a cualquier otra página), transiciona a fondo blanco/oscuro con sombra sutil. La transición usa `transition-all duration-300`.

**Alternativa descartada**: Header siempre sólido. Desperdicia la oportunidad visual del hero.

**Rationale**: Patrón estándar en tiendas de moda/lifestyle. Maximiza el impacto del hero sin sacrificar usabilidad en el resto del sitio.

---

### D6 — Formularios: label flotante (floating label)

**Decisión**: En checkout y formularios del admin, los labels no están encima del input sino dentro, y ascienden al enfocar o cuando hay valor. Implementación via CSS puro sobre el componente `Input` de shadcn/ui.

**Alternativa descartada**: Labels siempre arriba. Ocupa más espacio vertical y parece más antiguo.

**Rationale**: Reduce el ruido visual en formularios largos. Es el patrón de Material Design / Airbnb / Stripe.

---

### D7 — Componentes shadcn/ui: variantes nuevas, no reemplazo

**Decisión**: Se extienden los componentes existentes con variantes adicionales (ej: `Button variant="ghost-dark"`, `Card variant="product"`) antes que reemplazarlos. Las variantes nuevas se agregan en los archivos de `components/ui/` existentes.

**Rationale**: Evita romper usos existentes. El rediseño es una capa sobre lo que ya funciona.

---

## Risks / Trade-offs

**[Regresión de theming]** → Los cambios en `globals.css` y Tailwind config podrían afectar el mapeo de `site_config` → CSS custom properties. Mitigación: revisar el pipeline de theming al final de cada módulo rediseñado.

**[Floating labels y accesibilidad]** → Los floating labels pueden confundir lectores de pantalla si no se implementan con `<label for>` correcto. Mitigación: el componente `Input` de shadcn/ui ya maneja `id`/`htmlFor` — respetar ese contrato.

**[Sidebar oscuro + colores del cliente]** → Si el `color_primary` del cliente es muy oscuro (ej: negro), puede tener bajo contraste sobre el sidebar. Mitigación: el sidebar usa sus propias variables fijas, el `color_primary` del cliente no se aplica al sidebar.

> **Nota**: el dark mode fue descartado del scope de este change — ni para la tienda pública ni para el panel admin.
