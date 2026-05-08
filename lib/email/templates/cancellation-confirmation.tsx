import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface CancellationConfirmationEmailProps {
  fullName: string
  siteName: string
  orderNumber: string
  reason: string
  items: OrderItem[]
  total: number
}

export function CancellationConfirmationEmail({
  fullName,
  siteName,
  orderNumber,
  reason,
  items,
  total,
}: CancellationConfirmationEmailProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

  return (
    <Html lang="es">
      <Head />
      <Preview>Recibimos tu solicitud de arrepentimiento — Orden {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          <Section style={badgeSection}>
            <Text style={badge}>✓ Solicitud recibida</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Recibimos tu solicitud de arrepentimiento</Heading>
            <Text style={paragraph}>Hola {fullName},</Text>
            <Text style={paragraph}>
              Recibimos tu solicitud de cancelación para el pedido <strong>{orderNumber}</strong>.
              Tu motivo quedó registrado y lo revisaremos a la brevedad.
            </Text>
            <Text style={paragraph}>
              El reembolso será procesado dentro de los <strong>10 días hábiles</strong> posteriores
              a la confirmación de la cancelación, en la misma forma de pago que utilizaste.
            </Text>
          </Section>

          <Section style={reasonBox}>
            <Text style={reasonTitle}>Motivo ingresado</Text>
            <Text style={reasonText}>{reason}</Text>
          </Section>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Resumen del pedido</Text>
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

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Si no solicitaste esta cancelación, respondé este email para que podamos ayudarte.
            </Text>
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
const badge: React.CSSProperties = { color: '#15803d', fontSize: 15, fontWeight: 600, margin: 0 }
const content: React.CSSProperties = { padding: '28px 40px 8px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }
const paragraph: React.CSSProperties = { color: '#374151', fontSize: 15, lineHeight: '1.65', margin: '0 0 16px' }
const reasonBox: React.CSSProperties = {
  backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8,
  margin: '0 40px 16px', padding: '16px 20px',
}
const reasonTitle: React.CSSProperties = { color: '#92400e', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 6px', textTransform: 'uppercase' }
const reasonText: React.CSSProperties = { color: '#78350f', fontSize: 14, lineHeight: '1.6', margin: 0 }
const receiptBox: React.CSSProperties = {
  backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
  margin: '0 40px 16px', padding: '20px 24px',
}
const receiptTitle: React.CSSProperties = { color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }
const receiptDivider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '10px 0' }
const receiptRow: React.CSSProperties = { width: '100%' }
const receiptLabel: React.CSSProperties = { color: '#6b7280', fontSize: 13, paddingRight: 16, verticalAlign: 'top', width: '60%' }
const receiptValue: React.CSSProperties = { color: '#374151', fontSize: 13, textAlign: 'right', verticalAlign: 'top' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0 40px' }
const footer: React.CSSProperties = { padding: '20px 40px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 11, lineHeight: '1.6', margin: '0 0 4px', textAlign: 'center' }
