## MODIFIED Requirements

### Requirement: Checkout no requiere autenticación
El flujo de compra SHALL ser completamente accesible sin sesión activa. El middleware de autenticación NO SHALL redirigir la ruta `/checkout` a login.

#### Scenario: Usuario no autenticado accede a /checkout
- **WHEN** un usuario sin sesión navega a `/checkout`
- **THEN** el sistema muestra el checkout normalmente sin redirigir a login

#### Scenario: Rutas protegidas no cambian
- **WHEN** un usuario no autenticado intenta acceder a `/cuenta` o `/admin`
- **THEN** el sistema redirige a `/login` (comportamiento existente sin cambios)

---

### Requirement: Login como opt-in con valor concreto
El sistema SHALL comunicar en todos los puntos de contacto con el login/registro los beneficios concretos de tener cuenta, sin presentarlo como un requisito.

#### Scenario: Sugerencia de login en checkout paso 1
- **WHEN** el usuario completa el email en el paso 1 del checkout y ese email tiene cuenta
- **THEN** el sistema muestra una sugerencia no bloqueante "Tenés cuenta. Iniciá sesión para cargar tus datos automáticamente"

#### Scenario: Oferta de registro post-compra
- **WHEN** la compra como invitado se confirma exitosamente
- **THEN** la página de confirmación ofrece crear cuenta con el beneficio explícito "Mirá el estado de tus compras en cualquier momento"
