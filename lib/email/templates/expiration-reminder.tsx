import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ExpirationReminderEmailProps {
  fullName: string
  siteName: string
  planName: string
  expiresAt: Date
  daysLeft: 1 | 7
  planesUrl: string
}

export function ExpirationReminderEmail({
  fullName,
  siteName,
  planName,
  expiresAt,
  daysLeft,
  planesUrl,
}: ExpirationReminderEmailProps) {
  const isUrgent = daysLeft === 1

  const formattedDate = expiresAt.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const subject = isUrgent
    ? `⚠️ Tu plan vence mañana — renovalo hoy`
    : `Tu plan vence en 7 días — renovalo antes de perder el acceso`

  const previewText = isUrgent
    ? `Tu plan ${planName} vence mañana. Renovalo para seguir accediendo.`
    : `Tu plan ${planName} vence el ${formattedDate}. Renovalo antes de perder el acceso.`

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          {/* Banner de alerta */}
          <Section style={isUrgent ? bannerUrgent : bannerWarning}>
            <Text style={isUrgent ? bannerTextUrgent : bannerTextWarning}>
              {isUrgent ? '⚠️ Tu plan vence mañana' : '📅 Tu plan vence en 7 días'}
            </Text>
          </Section>

          {/* Contenido */}
          <Section style={content}>
            <Heading style={h1}>Hola, {fullName}</Heading>

            <Text style={paragraph}>
              {isUrgent
                ? <>Tu plan <strong>{planName}</strong> vence <strong>mañana</strong>. Después de esa fecha perderás el acceso al contenido.</>
                : <>Tu plan <strong>{planName}</strong> vence el próximo <strong>{formattedDate}</strong>. Te avisamos con anticipación para que puedas renovarlo sin interrupciones.</>
              }
            </Text>

            {/* Detalle del vencimiento */}
            <Section style={detailBox}>
              <Text style={detailLabel}>Plan actual</Text>
              <Text style={detailValue}>{planName}</Text>
              <Hr style={detailDivider} />
              <Text style={detailLabel}>Fecha de vencimiento</Text>
              <Text style={{ ...detailValue, color: isUrgent ? '#dc2626' : '#d97706', fontWeight: 700 }}>
                {formattedDate}
              </Text>
            </Section>

            <Text style={paragraph}>
              {isUrgent
                ? 'Renová ahora para mantener tu acceso sin interrupciones.'
                : 'Podés renovar tu plan en cualquier momento antes del vencimiento.'}
            </Text>

            <Section style={buttonSection}>
              <Button style={isUrgent ? buttonUrgent : buttonNormal} href={planesUrl}>
                Renovar ahora
              </Button>
            </Section>

            <Text style={helpText}>
              Si ya renovaste tu plan, ignorá este mensaje.
              Para cualquier consulta contactanos desde la sección{' '}
              <a href={`${new URL(planesUrl).origin}/contacto`} style={link}>
                Contacto
              </a>
              .
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Recibiste este aviso porque tenés un plan activo en {siteName}.
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

const bannerWarning: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  padding: '14px 40px',
  textAlign: 'center',
}

const bannerUrgent: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  padding: '14px 40px',
  textAlign: 'center',
}

const bannerTextWarning: React.CSSProperties = {
  color: '#92400e',
  fontSize: 15,
  fontWeight: 600,
  margin: 0,
}

const bannerTextUrgent: React.CSSProperties = {
  color: '#991b1b',
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

const detailBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  margin: '4px 0 20px',
  padding: '16px 20px',
}

const detailLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  margin: '0 0 4px',
  textTransform: 'uppercase',
}

const detailValue: React.CSSProperties = {
  color: '#111827',
  fontSize: 14,
  fontWeight: 600,
  margin: '0 0 12px',
}

const detailDivider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '8px 0 12px',
}

const buttonSection: React.CSSProperties = {
  margin: '20px 0 24px',
  textAlign: 'center',
}

const buttonNormal: React.CSSProperties = {
  backgroundColor: '#4f46e5',
  borderRadius: 8,
  color: '#ffffff',
  display: 'inline-block',
  fontSize: 15,
  fontWeight: 600,
  padding: '12px 28px',
  textDecoration: 'none',
}

const buttonUrgent: React.CSSProperties = {
  backgroundColor: '#dc2626',
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
