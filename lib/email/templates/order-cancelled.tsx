import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface OrderCancelledEmailProps {
  fullName: string
  siteName: string
  orderNumber: string
  items: OrderItem[]
  total: number
  wasPaid: boolean
}

export function OrderCancelledEmail({
  fullName,
  siteName,
  orderNumber,
  items,
  total,
  wasPaid,
}: OrderCancelledEmailProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu pedido {orderNumber} fue cancelado</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          <Section style={badgeSection}>
            <Text style={badge}>✕ Pedido cancelado</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Tu pedido fue cancelado</Heading>
            <Text style={paragraph}>Hola {fullName},</Text>
            <Text style={paragraph}>
              Te informamos que tu pedido <strong>{orderNumber}</strong> fue cancelado.
              Si tenés alguna duda sobre el motivo, podés contactarnos respondiendo este email.
            </Text>
          </Section>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Resumen del pedido cancelado</Text>
            <Hr style={receiptDivider} />
            {items.map((item, i) => (
              <Row key={i} style={receiptRow}>
                <Column style={receiptLabel}>{item.name} x{item.quantity}</Column>
                <Column style={receiptValue}>{fmt(item.unit_price * item.quantity)}</Column>
              </Row>
            ))}
            <Hr style={receiptDivider} />
            <Row style={receiptRow}>
              <Column style={{ ...receiptLabel, fontWeight: 700, color: '#111827' }}>Total</Column>
              <Column style={{ ...receiptValue, fontWeight: 700, color: '#111827' }}>{fmt(total)}</Column>
            </Row>
          </Section>

          {wasPaid && (
            <Section style={refundBox}>
              <Text style={refundTitle}>Información sobre el reembolso</Text>
              <Text style={refundText}>
                Como tu pago fue procesado, el reembolso se acreditará en tu medio de pago original
                en los próximos <strong>5 a 10 días hábiles</strong>, según los tiempos de tu banco o
                tarjeta. Si pagaste con MercadoPago, podés consultar el estado del reembolso desde
                tu cuenta en la app.
              </Text>
            </Section>
          )}

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
const badgeSection: React.CSSProperties = { backgroundColor: '#fef2f2', padding: '14px 40px', textAlign: 'center' }
const badge: React.CSSProperties = { color: '#dc2626', fontSize: 15, fontWeight: 600, margin: 0 }
const content: React.CSSProperties = { padding: '28px 40px 8px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }
const paragraph: React.CSSProperties = { color: '#374151', fontSize: 15, lineHeight: '1.65', margin: '0 0 16px' }
const receiptBox: React.CSSProperties = {
  backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
  margin: '4px 40px 16px', padding: '20px 24px',
}
const receiptTitle: React.CSSProperties = { color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }
const receiptDivider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '10px 0' }
const receiptRow: React.CSSProperties = { width: '100%' }
const receiptLabel: React.CSSProperties = { color: '#6b7280', fontSize: 13, paddingRight: 16, verticalAlign: 'top', width: '60%' }
const receiptValue: React.CSSProperties = { color: '#374151', fontSize: 13, textAlign: 'right', verticalAlign: 'top' }
const refundBox: React.CSSProperties = {
  backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8,
  margin: '0 40px 24px', padding: '20px 24px',
}
const refundTitle: React.CSSProperties = { color: '#92400e', fontSize: 13, fontWeight: 700, margin: '0 0 8px' }
const refundText: React.CSSProperties = { color: '#78350f', fontSize: 13, lineHeight: '1.6', margin: 0 }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0 40px' }
const footer: React.CSSProperties = { padding: '20px 40px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 11, lineHeight: '1.6', margin: 0, textAlign: 'center' }
