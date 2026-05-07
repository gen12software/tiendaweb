## 1. Checkout Standalone Layout

- [x] 1.1 Crear `app/checkout/layout.tsx` — layout anidado que renderiza solo el contenido (sin header/footer), con fondo limpio y centering apropiado
- [x] 1.2 Agregar botón "← Volver al carrito" en el checkout layout, visible en todos los steps excepto `/checkout/confirmacion`
- [x] 1.3 Mover o excluir `<WhatsAppButton />` del root layout para que no aparezca en rutas `/checkout` — agregar `/checkout` a la lógica de `ConditionalShell` o mover el botón dentro del shell

## 2. Mejora de Página de Confirmación

- [x] 2.1 Revisar el endpoint de orden existente (probablemente `app/api/orders/by-preference/[prefId]/`) para verificar qué campos retorna actualmente
- [x] 2.2 Extender la respuesta del endpoint para incluir: items (nombre, cantidad, precio unitario), subtotal, costo de envío, dirección de envío
- [x] 2.3 Actualizar `app/checkout/confirmacion/page.tsx` para mostrar la lista de ítems comprados con nombre, cantidad y precio
- [x] 2.4 Agregar sección de dirección de envío en la página de confirmación
- [x] 2.5 Agregar nota visible "Guardá este número para consultar tu pedido" con énfasis visual
- [x] 2.6 Verificar que el botón de copiar número de orden funciona correctamente (ya existe, validar UI)

## 3. Ajustes de UX Post-Confirmación

- [x] 3.1 Verificar que en `/checkout/confirmacion` el botón "← Volver al carrito" NO se muestra
- [x] 3.2 Verificar que los links "Consultar mi orden" y "Seguir comprando" funcionan correctamente en la página de confirmación
- [x] 3.3 Verificar estado de error cuando polling agota reintentos (mostrar mensaje apropiado)

## 4. Verificación Visual

- [x] 4.1 Verificar en browser que el checkout no muestra header/nav/footer en ningún step
- [x] 4.2 Verificar que las variables CSS de tema (colores, fuentes) se aplican correctamente dentro del checkout layout
- [x] 4.3 Verificar que el carrito (CartProvider/CartDrawer) sigue funcionando desde el checkout (hereda el provider del root layout)
