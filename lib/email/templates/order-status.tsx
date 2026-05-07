import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'

type StatusKey = 'en_preparacion' | 'enviado' | 'listo_para_retirar' | 'entregado'

interface OrderStatusEmailProps {
  fullName: string
  siteName: string
  orderNumber: string
  status: StatusKey
  trackingNumber?: string
  orderUrl: string
}

const STATUS_COPY: Record<StatusKey, { preview: string; badge: string; badgeColor: string; badgeBg: string; title: string; body: string }> = {
  en_preparacion: {
    preview: 'Tu pedido está siendo preparado',
    badge: '⚙️ En preparación',
    badgeColor: '#92400e',
    badgeBg: '#fef3c7',
    title: '¡Tu pedido está en preparación!',
    body: 'Estamos preparando tu pedido con cuidado. Te avisaremos cuando esté listo para enviar.',
  },
  enviado: {
    preview: 'Tu pedido fue despachado',
    badge: '🚚 Despachado',
    badgeColor: '#1d4ed8',
    badgeBg: '#eff6ff',
    title: '¡Tu pedido está en camino!',
    body: 'Tu pedido fue despachado y está en camino. Podés hacer el seguimiento con el número de orden.',
  },
  listo_para_retirar: {
    preview: 'Tu pedido está listo para retirar',
    badge: '📦 Listo para retirar',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    title: '¡Tu pedido está listo para retirar!',
    body: 'Tu pedido ya está disponible para que lo pases a buscar. Presentá el número de orden al retirar.',
  },
  entregado: {
    preview: 'Tu pedido fue entregado',
    badge: '✓ Entregado',
    badgeColor: '#15803d',
    badgeBg: '#f0fdf4',
    title: '¡Tu pedido fue entregado!',
    body: '¡Esperamos que disfrutes tu compra! Si tenés algún problema, no dudes en contactarnos.',
  },
}

export function OrderStatusEmail({
  fullName,
  siteName,
  orderNumber,
  status,
  trackingNumber,
  orderUrl,
}: OrderStatusEmailProps) {
  const copy = STATUS_COPY[status]

  return (
    <Html lang="es">
      <Head />
      <Preview>{copy.preview} — Pedido {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          <Section style={{ backgroundColor: copy.badgeBg, padding: '14px 40px', textAlign: 'center' }}>
            <Text style={{ color: copy.badgeColor, fontSize: 15, fontWeight: 600, margin: 0 }}>{copy.badge}</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>{copy.title}</Heading>
            <Text style={paragraph}>Hola {fullName},</Text>
            <Text style={paragraph}>{copy.body}</Text>
          </Section>

          <Section style={orderNumberBox}>
            <Text style={orderNumberLabel}>Número de orden</Text>
            <Text style={orderNumberValue}>{orderNumber}</Text>
          </Section>

          {trackingNumber && (
            <Section style={trackingBox}>
              <Text style={trackingLabel}>Número de seguimiento</Text>
              <Text style={trackingValue}>{trackingNumber}</Text>
            </Section>
          )}

          <Section style={content}>
            <Section style={buttonSection}>
              <Button style={button} href={orderUrl}>
                Ver mi pedido
              </Button>
            </Section>
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
const content: React.CSSProperties = { padding: '28px 40px 8px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }
const paragraph: React.CSSProperties = { color: '#374151', fontSize: 15, lineHeight: '1.65', margin: '0 0 16px' }
const orderNumberBox: React.CSSProperties = {
  backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8,
  margin: '4px 40px 16px', padding: '16px 24px', textAlign: 'center',
}
const orderNumberLabel: React.CSSProperties = { color: '#4f46e5', fontSize: 12, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }
const orderNumberValue: React.CSSProperties = { color: '#1e1b4b', fontSize: 28, fontWeight: 700, fontFamily: 'monospace', margin: 0 }
const trackingBox: React.CSSProperties = {
  backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
  margin: '0 40px 16px', padding: '16px 24px', textAlign: 'center',
}
const trackingLabel: React.CSSProperties = { color: '#0369a1', fontSize: 12, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }
const trackingValue: React.CSSProperties = { color: '#0c4a6e', fontSize: 18, fontWeight: 700, fontFamily: 'monospace', margin: 0 }
const buttonSection: React.CSSProperties = { margin: '20px 0 24px', textAlign: 'center' }
const button: React.CSSProperties = { backgroundColor: '#4f46e5', borderRadius: 8, color: '#ffffff', display: 'inline-block', fontSize: 15, fontWeight: 600, padding: '12px 28px', textDecoration: 'none' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0 40px' }
const footer: React.CSSProperties = { padding: '20px 40px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 11, lineHeight: '1.6', margin: 0, textAlign: 'center' }
