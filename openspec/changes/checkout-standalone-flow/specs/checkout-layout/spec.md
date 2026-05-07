## ADDED Requirements

### Requirement: Checkout renders in standalone layout
The checkout flow (all steps under `/checkout`) SHALL render without the store's main header, navigation menu, footer, or WhatsApp floating button.

#### Scenario: Header is not visible during checkout
- **WHEN** user navigates to any route under `/checkout`
- **THEN** the main site header and navigation menu SHALL NOT be rendered

#### Scenario: Footer is not visible during checkout
- **WHEN** user navigates to any route under `/checkout`
- **THEN** the main site footer SHALL NOT be rendered

#### Scenario: WhatsApp button is not visible during checkout
- **WHEN** user navigates to any route under `/checkout`
- **THEN** the floating WhatsApp button SHALL NOT be rendered

### Requirement: Back to cart button
The checkout layout SHALL display a single "← Volver al carrito" link that navigates back to the cart page.

#### Scenario: Back button is visible on all checkout steps
- **WHEN** user is on any checkout step (contact, shipping, payment)
- **THEN** a "← Volver al carrito" link SHALL be visible at the top-left of the page

#### Scenario: Back button navigates to cart
- **WHEN** user clicks "← Volver al carrito"
- **THEN** user SHALL be navigated to the cart page (`/carrito` or equivalent)

#### Scenario: Back button is NOT shown on confirmation page
- **WHEN** user is on `/checkout/confirmacion`
- **THEN** the "← Volver al carrito" link SHALL NOT be rendered (purchase is complete)

### Requirement: Theme variables are preserved in checkout
The checkout layout SHALL inherit the store's CSS theme variables (colors, fonts) from the root layout.

#### Scenario: Checkout uses store brand colors
- **WHEN** user is on any checkout route
- **THEN** CSS variables (`--color-primary`, `--color-secondary`, etc.) SHALL be applied to checkout UI elements
