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

interface WelcomeEmailProps {
  fullName: string
  siteName: string
  dashboardUrl: string
}

export function WelcomeEmail({ fullName, siteName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>¡Bienvenido/a a {siteName}! Tu cuenta está lista.</Preview>

      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>¡Bienvenido/a, {fullName}!</Heading>

            <Text style={paragraph}>
              Tu cuenta en <strong>{siteName}</strong> fue confirmada correctamente.
              Ya podés acceder a todo el contenido disponible según el plan que elijas.
            </Text>

            <Text style={paragraph}>
              Desde tu panel vas a poder:
            </Text>

            <Text style={listItem}>✓ Explorar y consumir el contenido disponible</Text>
            <Text style={listItem}>✓ Gestionar tu plan y pagos</Text>
            <Text style={listItem}>✓ Actualizar tu perfil</Text>

            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                Ir a mi cuenta
              </Button>
            </Section>

            <Text style={paragraph}>
              Si tenés alguna consulta, no dudes en{' '}
              <a href={`${new URL(dashboardUrl).origin}/contacto`} style={link}>
                contactarnos
              </a>
              . Estamos para ayudarte.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este email fue enviado porque te registraste en {siteName}.
              Si no fuiste vos, podés ignorar este mensaje.
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

const content: React.CSSProperties = {
  padding: '36px 40px 28px',
}

const h1: React.CSSProperties = {
  color: '#111827',
  fontSize: 24,
  fontWeight: 700,
  lineHeight: '1.3',
  margin: '0 0 20px',
}

const paragraph: React.CSSProperties = {
  color: '#374151',
  fontSize: 15,
  lineHeight: '1.65',
  margin: '0 0 16px',
}

const listItem: React.CSSProperties = {
  color: '#374151',
  fontSize: 15,
  lineHeight: '1.5',
  margin: '0 0 8px',
  paddingLeft: 4,
}

const buttonSection: React.CSSProperties = {
  margin: '28px 0',
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

const link: React.CSSProperties = {
  color: '#4f46e5',
  textDecoration: 'underline',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 40px',
}

const footer: React.CSSProperties = {
  padding: '24px 40px',
}

const footerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: 12,
  lineHeight: '1.6',
  margin: '0 0 6px',
  textAlign: 'center',
}
