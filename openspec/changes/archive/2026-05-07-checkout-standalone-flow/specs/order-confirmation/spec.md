## ADDED Requirements

### Requirement: Order confirmation page shows full order summary
The confirmation page at `/checkout/confirmacion` SHALL display a complete summary of the purchase including order number, items, totals, and shipping information.

#### Scenario: Approved payment shows full summary
- **WHEN** user lands on `/checkout/confirmacion` with `status=approved`
- **THEN** the page SHALL display: order number, list of purchased items (name, quantity, unit price), subtotal, shipping cost, total amount, buyer email, and shipping address

#### Scenario: Pending payment shows partial summary
- **WHEN** user lands on `/checkout/confirmacion` with a non-approved status
- **THEN** the page SHALL display a "pago en proceso" message and show the order number once polling resolves

#### Scenario: Page polls until order is available
- **WHEN** the order is not yet created (webhook delay) at page load
- **THEN** the page SHALL poll the API up to 8 times with 2-second intervals until the order appears

#### Scenario: Order not found after max retries
- **WHEN** polling exhausts all retries without finding an order
- **THEN** the page SHALL display an error message with a link to consult the order via email

### Requirement: Order number is copyable
The confirmation page SHALL provide a one-click mechanism to copy the order number to the clipboard.

#### Scenario: User copies order number
- **WHEN** user clicks the copy icon next to the order number
- **THEN** the order number SHALL be copied to the clipboard AND a visual confirmation (checkmark icon) SHALL appear for 2 seconds

### Requirement: Confirmation page is accessible without login
The confirmation page SHALL be fully functional for unauthenticated users.

#### Scenario: Guest user sees full confirmation
- **WHEN** a guest user (no session) completes a purchase and lands on `/checkout/confirmacion`
- **THEN** the page SHALL display the complete order summary without requiring login

#### Scenario: Confirmation prompts to save order number
- **WHEN** order data is displayed
- **THEN** the page SHALL show a note advising the user to save the order number to consult their order later

### Requirement: Confirmation page links to order consultation
The confirmation page SHALL provide a link to consult the order status.

#### Scenario: User can navigate to order consultation
- **WHEN** user is on the confirmation page with a resolved order
- **THEN** a link/button to `/mi-orden` (or order consultation flow) SHALL be visible

#### Scenario: User can continue shopping
- **WHEN** user is on the confirmation page
- **THEN** a "Seguir comprando" link SHALL be visible navigating to the products page
