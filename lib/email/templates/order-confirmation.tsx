import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface OrderConfirmationEmailProps {
  fullName: string
  siteName: string
  orderNumber: string
  items: OrderItem[]
  total: number
  shippingTotal: number
  shippingAddress: string
  orderUrl: string
  appUrl: string
}

export function OrderConfirmationEmail({
  fullName,
  siteName,
  orderNumber,
  items,
  total,
  shippingTotal,
  shippingAddress,
  orderUrl,
  appUrl,
}: OrderConfirmationEmailProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

  return (
    <Html lang="es">
      <Head />
      <Preview>Pedido {orderNumber} confirmado — {siteName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          <Section style={badgeSection}>
            <Text style={badge}>✓ Pago aprobado</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>¡Gracias por tu compra, {fullName}!</Heading>
            <Text style={paragraph}>
              Tu pedido fue confirmado. Guardá el número de orden para hacer el seguimiento.
            </Text>
          </Section>

          <Section style={orderNumberBox}>
            <Text style={orderNumberLabel}>Número de orden</Text>
            <Text style={orderNumberValue}>{orderNumber}</Text>
          </Section>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Detalle del pedido</Text>
            <Hr style={receiptDivider} />
            {items.map((item, i) => (
              <Row key={i} style={receiptRow}>
                <Column style={receiptLabel}>{item.name} x{item.quantity}</Column>
                <Column style={receiptValue}>{fmt(item.unit_price * item.quantity)}</Column>
              </Row>
            ))}
            <Hr style={receiptDivider} />
            <Row style={receiptRow}>
              <Column style={receiptLabel}>Envío</Column>
              <Column style={receiptValue}>{shippingTotal === 0 ? 'Gratis' : fmt(shippingTotal)}</Column>
            </Row>
            <Hr style={receiptDivider} />
            <Row style={receiptRow}>
              <Column style={{ ...receiptLabel, fontWeight: 700, color: '#111827' }}>Total</Column>
              <Column style={{ ...receiptValue, fontWeight: 700, color: '#111827' }}>{fmt(total)}</Column>
            </Row>
          </Section>

          <Section style={{ ...receiptBox, marginTop: 0 }}>
            <Text style={receiptTitle}>Dirección de envío</Text>
            <Text style={{ ...paragraph, margin: 0, fontSize: 13 }}>{shippingAddress}</Text>
          </Section>

          <Section style={content}>
            <Section style={buttonSection}>
              <Button style={button} href={orderUrl}>
                Ver estado de mi pedido
              </Button>
            </Section>
            <Text style={helpText}>
              También podés consultar tu pedido en{' '}
              <a href={`${appUrl}/mi-orden`} style={link}>{appUrl}/mi-orden</a>{' '}
              con tu número de orden y email.
            </Text>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0, padding: 0,
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff', borderRadius: 12, margin: '40px auto', maxWidth: 560, overflow: 'hidden',
}
const header: React.CSSProperties = { backgroundColor: '#4f46e5', padding: '28px 40px', textAlign: 'center' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: 22, fontWeight: 700, margin: 0 }
const badgeSection: React.CSSProperties = { backgroundColor: '#f0fdf4', padding: '14px 40px', textAlign: 'center' }
const badge: React.CSSProperties = { color: '#16a34a', fontSize: 15, fontWeight: 600, margin: 0 }
const content: React.CSSProperties = { padding: '28px 40px 8px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }
const paragraph: React.CSSProperties = { color: '#374151', fontSize: 15, lineHeight: '1.65', margin: '0 0 16px' }
const orderNumberBox: React.CSSProperties = {
  backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8,
  margin: '4px 40px 16px', padding: '16px 24px', textAlign: 'center',
}
const orderNumberLabel: React.CSSProperties = { color: '#4f46e5', fontSize: 12, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }
const orderNumberValue: React.CSSProperties = { color: '#1e1b4b', fontSize: 28, fontWeight: 700, fontFamily: 'monospace', margin: 0 }
const receiptBox: React.CSSProperties = {
  backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
  margin: '4px 40px 16px', padding: '20px 24px',
}
const receiptTitle: React.CSSProperties = { color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }
const receiptDivider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '10px 0' }
const receiptRow: React.CSSProperties = { width: '100%' }
const receiptLabel: React.CSSProperties = { color: '#6b7280', fontSize: 13, paddingRight: 16, verticalAlign: 'top', width: '60%' }
const receiptValue: React.CSSProperties = { color: '#374151', fontSize: 13, textAlign: 'right', verticalAlign: 'top' }
const buttonSection: React.CSSProperties = { margin: '20px 0 24px', textAlign: 'center' }
const button: React.CSSProperties = { backgroundColor: '#4f46e5', borderRadius: 8, color: '#ffffff', display: 'inline-block', fontSize: 15, fontWeight: 600, padding: '12px 28px', textDecoration: 'none' }
const helpText: React.CSSProperties = { color: '#6b7280', fontSize: 13, lineHeight: '1.6', margin: '0 0 16px' }
const link: React.CSSProperties = { color: '#4f46e5', textDecoration: 'underline' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0 40px' }
const footer: React.CSSProperties = { padding: '20px 40px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 11, lineHeight: '1.6', margin: 0, textAlign: 'center' }
