## ADDED Requirements

### Requirement: Paleta de colores completa por tienda
El sistema SHALL soportar la configuración de una paleta de 5 colores por tienda, aplicados como CSS custom properties en el layout raíz.

#### Scenario: Colores aplicados en la UI
- **WHEN** el admin configura `color_primary`, `color_secondary`, `color_accent`, `color_background` y `color_surface`
- **THEN** el layout raíz inyecta `--color-primary`, `--color-secondary`, etc. como CSS custom properties en `<html>` y toda la UI los consume

#### Scenario: Color no configurado
- **WHEN** una clave de color no está configurada en `site_config`
- **THEN** el sistema usa el valor por defecto definido en el layout (fallback hardcodeado)

---

### Requirement: Tipografía configurable
El sistema SHALL soportar la selección de fuente para títulos y para cuerpo de texto, cargadas desde Google Fonts.

#### Scenario: Fuente configurada
- **WHEN** el admin configura `font_heading` y/o `font_body` con el nombre de una Google Font
- **THEN** el layout raíz inyecta el link de carga de la fuente y las aplica via CSS custom properties `--font-heading` y `--font-body`

---

### Requirement: Identidad visual de marca
El sistema SHALL soportar configuración de logo, favicon, nombre de marca y slogan independientes por tienda.

#### Scenario: Logo personalizado en header
- **WHEN** `logo_url` está configurado
- **THEN** el header muestra la imagen del logo en lugar del nombre de texto

#### Scenario: Favicon personalizado
- **WHEN** `favicon_url` está configurado
- **THEN** el layout raíz usa esa URL como favicon del sitio

---

### Requirement: Links de redes sociales configurables
El sistema SHALL soportar la configuración de links a Instagram, Facebook y TikTok que aparecen en el footer.

#### Scenario: Red social configurada
- **WHEN** `social_instagram`, `social_facebook` o `social_tiktok` tienen valor
- **THEN** el footer muestra el ícono correspondiente con el link configurado

#### Scenario: Red social no configurada
- **WHEN** una clave de red social está vacía
- **THEN** el footer no muestra el ícono de esa red (sin links rotos)

---

### Requirement: Formato de moneda configurable
El sistema SHALL formatear los precios según el símbolo y separadores de moneda configurados por el admin, sin hardcodear "AR$".

#### Scenario: Moneda personalizada
- **WHEN** el admin configura `currency_symbol` (ej: "AR$", "$", "USD") y `currency_locale` (ej: "es-AR", "es-CL")
- **THEN** todos los precios de la tienda se formatean con ese símbolo y locale

#### Scenario: Moneda no configurada
- **WHEN** `currency_symbol` no está configurado
- **THEN** el sistema usa "AR$" y "es-AR" como valores por defecto

---

### Requirement: WhatsApp button
El sistema SHALL mantener el botón flotante de WhatsApp existente, con número y mensaje configurables desde el admin.

#### Scenario: WhatsApp configurado
- **WHEN** `whatsapp_number` está configurado en `site_config`
- **THEN** el botón flotante de WhatsApp aparece en todas las páginas públicas de la tienda

#### Scenario: WhatsApp no configurado
- **WHEN** `whatsapp_number` está vacío
- **THEN** el botón no aparece (no se muestra un link roto)
