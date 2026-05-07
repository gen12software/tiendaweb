## Why

El diseño actual de la tienda y del panel admin refleja convenciones visuales de hace varios años: bordes pesados, tipografías genéricas, paletas planas, layouts sin respiración. En 2026, los usuarios comparan cada tienda que visitan con Shopify, Zara o Amazon — referencias con diseño sofisticado, espaciado generoso, jerarquía visual clara y micro-interacciones fluidas. Un diseño desactualizado erosiona la credibilidad del negocio del cliente antes de que el comprador lea el primer producto. El panel admin, por su parte, es la herramienta diaria del cliente — si es incómodo o visualmente ruidoso, el costo de operación se siente desde el día uno.

Este change no agrega funcionalidad: **refactoriza la capa visual completa** de la tienda pública y del panel admin para llevarlos al estándar visual actual, sin tocar ninguna lógica de negocio ni estructura de datos.

## What Changes

- Rediseño completo de la tienda pública: home, catálogo, detalle de producto, checkout, páginas de cuenta, páginas de error
- Rediseño completo del panel admin: dashboard, listados, formularios, navegación lateral
- Sistema de tipografía revisado: heading/body con una pareja de fuentes moderna de Google Fonts
- Sistema de spacing y layout consolidado: grillas limpias, márgenes consistentes, jerarquía visual clara
- Micro-interacciones: hover states, transiciones de navegación, feedback visual inmediato en acciones
- Dark mode nativo opcional para el panel admin (sin impacto en la tienda pública)
- Los colores y fuentes específicos serán definidos en la fase de diseño — este documento especifica el *sistema*, no los valores finales

## Capabilities Afectadas

### Tienda pública

- `home`: hero de pantalla completa con overlay de texto, sección de categorías en grilla horizontal tipo "editorial", sección de productos destacados con cards de imagen dominante
- `catalogo`: cards sin bordes, imagen cuadrada con zoom suave en hover, precio con tipografía en dos tamaños, badge de descuento en esquina
- `catalogo-detalle`: galería con thumbnail rail, datos del producto con tipografía de alto contraste, botón CTA sticky en mobile
- `checkout`: pasos con indicador minimalista (número + línea), formularios de campo flotante (label que sube al enfocar)
- `carrito-drawer`: line items compactos con thumbnail, total en tipografía grande, botón CTA full-width
- `header`: versión transparent sobre hero + versión sólida al hacer scroll (crossfade), menú mobile tipo bottom-sheet
- `footer`: columnas limpias, links en gris suave, copyright minimalista

### Panel admin

- `admin-layout`: sidebar colapsable, íconos con tooltip al colapsar, breadcrumb en cada vista
- `admin-dashboard`: cards de métricas con número grande y delta vs período anterior, tabla de últimas órdenes inline
- `admin-listados`: tablas con row hover, paginación simple, filtros en línea sobre la tabla
- `admin-formularios`: inputs con label flotante, mensajes de error inline (no toast), sección de imágenes con drag-and-drop visual

## Non-Goals

- No se modifica ninguna lógica de negocio, API, schema o flujo
- No se agrega nueva funcionalidad parametrizable desde el admin (eso es el siguiente change)
- No se introduce un design system externo nuevo — se refactoriza sobre shadcn/ui existente
- No se cambia el stack (Next.js, Tailwind, shadcn/ui)
- No se diseña mobile-first si implica degradar la experiencia desktop — ambas superficies son ciudadanas de primera clase

## Impact

- **Archivos afectados**: componentes de layout, páginas públicas, páginas admin, `globals.css`, `tailwind.config`
- **Sin cambios**: APIs, esquema de base de datos, lógica de servidor, sistema de theming existente (se extiende, no se reemplaza)
- **Riesgo visual**: cambio de apariencia global — se recomienda revisar en staging antes de producción
