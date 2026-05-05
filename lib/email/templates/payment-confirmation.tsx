import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components'

interface PaymentConfirmationEmailProps {
  fullName: string
  siteName: string
  planName: string
  amount: number
  startsAt: Date
  expiresAt: Date
  mpPaymentId: string
  dashboardUrl: string
}

export function PaymentConfirmationEmail({
  fullName,
  siteName,
  planName,
  amount,
  startsAt,
  expiresAt,
  mpPaymentId,
  dashboardUrl,
}: PaymentConfirmationEmailProps) {
  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Html lang="es">
      <Head />
      <Preview>
        Pago aprobado — {planName} por {formattedAmount}
      </Preview>

      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          {/* Badge de éxito */}
          <Section style={badgeSection}>
            <Text style={badge}>✓ Pago aprobado</Text>
          </Section>

          {/* Saludo */}
          <Section style={content}>
            <Heading style={h1}>¡Gracias por tu compra, {fullName}!</Heading>
            <Text style={paragraph}>
              Tu pago fue procesado correctamente. A continuación encontrás el detalle
              de tu transacción como constancia de la compra.
            </Text>
          </Section>

          {/* Recibo */}
          <Section style={receiptBox}>
            <Text style={receiptTitle}>Detalle de la compra</Text>

            <Hr style={receiptDivider} />

            <Row style={receiptRow}>
              <Column style={receiptLabel}>Plan</Column>
              <Column style={receiptValue}>{planName}</Column>
            </Row>

            <Hr style={receiptDivider} />

            <Row style={receiptRow}>
              <Column style={receiptLabel}>Monto abonado</Column>
              <Column style={{ ...receiptValue, fontWeight: 700, color: '#111827' }}>
                {formattedAmount}
              </Column>
            </Row>

            <Hr style={receiptDivider} />

            <Row style={receiptRow}>
              <Column style={receiptLabel}>Fecha de inicio</Column>
              <Column style={receiptValue}>{formatDate(startsAt)}</Column>
            </Row>

            <Hr style={receiptDivider} />

            <Row style={receiptRow}>
              <Column style={receiptLabel}>Válido hasta</Column>
              <Column style={{ ...receiptValue, color: '#4f46e5', fontWeight: 600 }}>
                {formatDate(expiresAt)}
              </Column>
            </Row>

            <Hr style={receiptDivider} />

            <Row style={receiptRow}>
              <Column style={receiptLabel}>N.° de transacción</Column>
              <Column style={{ ...receiptValue, fontFamily: 'monospace', fontSize: 12 }}>
                {mpPaymentId}
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={content}>
            <Text style={paragraph}>
              Ya podés acceder a todo el contenido disponible. ¡Disfrutá tu plan!
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                Ir a mi cuenta
              </Button>
            </Section>

            <Text style={helpText}>
              Si tenés algún problema con tu acceso, contactanos a través de la sección{' '}
              <a href={`${new URL(dashboardUrl).origin}/contacto`} style={link}>
                Contacto
              </a>
              .
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este es un comprobante automático de tu compra en {siteName}.
              Guardalo como constancia de la transacción.
            </Text>
            <Text style={footerText}>
              Los pagos son procesados por MercadoPago.
              Podés verificar esta transacción en tu cuenta de MercadoPago
              con el número {mpPaymentId}.
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

// ─── Styles ────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  margin: '40px auto',
  maxWidth: 560,
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  padding: '28px 40px',
  textAlign: 'center',
}

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: '-0.3px',
  margin: 0,
}

const badgeSection: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  padding: '14px 40px',
  textAlign: 'center',
}

const badge: React.CSSProperties = {
  color: '#16a34a',
  fontSize: 15,
  fontWeight: 600,
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '28px 40px 8px',
}

const h1: React.CSSProperties = {
  color: '#111827',
  fontSize: 22,
  fontWeight: 700,
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  color: '#374151',
  fontSize: 15,
  lineHeight: '1.65',
  margin: '0 0 16px',
}

const receiptBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  margin: '4px 40px 24px',
  padding: '20px 24px',
}

const receiptTitle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  margin: '0 0 12px',
  textTransform: 'uppercase',
}

const receiptDivider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '10px 0',
}

const receiptRow: React.CSSProperties = {
  width: '100%',
}

const receiptLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 13,
  paddingRight: 16,
  verticalAlign: 'top',
  width: '45%',
}

const receiptValue: React.CSSProperties = {
  color: '#374151',
  fontSize: 13,
  textAlign: 'right',
  verticalAlign: 'top',
}

const buttonSection: React.CSSProperties = {
  margin: '20px 0 24px',
  textAlign: 'center',
}

const button: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  borderRadius: 8,
  color: '#ffffff',
  display: 'inline-block',
  fontSize: 15,
  fontWeight: 600,
  padding: '12px 28px',
  textDecoration: 'none',
}

const helpText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 13,
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const link: React.CSSProperties = {
  color: '#4f46e5',
  textDecoration: 'underline',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 40px',
}

const footer: React.CSSProperties = {
  padding: '20px 40px',
}

const footerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: 11,
  lineHeight: '1.6',
  margin: '0 0 6px',
  textAlign: 'center',
}
