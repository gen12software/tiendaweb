import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface TopProduct {
  name: string
  variantName?: string
  totalQuantity: number
  totalRevenue: number
}

interface StaleOrder {
  number: string
  status: string
  hoursOld: number
}

interface WeeklySummaryEmailProps {
  siteName: string
  weekLabel: string
  totalOrders: number
  totalRevenue: number
  topProducts: TopProduct[]
  staleOrders: StaleOrder[]
  adminUrl: string
}

const STATUS_LABELS: Record<string, string> = {
  nueva: 'Nueva',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  pago_pendiente: 'Pago pendiente',
  listo_para_retirar: 'Listo para retirar',
}

export function WeeklySummaryEmail({
  siteName,
  weekLabel,
  totalOrders,
  totalRevenue,
  topProducts,
  staleOrders,
  adminUrl,
}: WeeklySummaryEmailProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

  return (
    <Html lang="es">
      <Head />
      <Preview>Resumen semanal — {totalOrders} órdenes — {fmt(totalRevenue)} — {siteName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
            <Text style={subtitle}>Resumen semanal · {weekLabel}</Text>
          </Section>

          <Section style={metricsSection}>
            <Row>
              <Column style={metricCard}>
                <Text style={metricValue}>{totalOrders}</Text>
                <Text style={metricLabel}>Órdenes</Text>
              </Column>
              <Column style={metricCard}>
                <Text style={metricValue}>{fmt(totalRevenue)}</Text>
                <Text style={metricLabel}>Facturación</Text>
              </Column>
            </Row>
          </Section>

          {topProducts.length > 0 && (
            <>
              <Section style={content}>
                <Heading style={h2}>Top productos</Heading>
              </Section>
              <Section style={tableBox}>
                {topProducts.map((p, i) => (
                  <Row key={i} style={tableRow}>
                    <Column style={rankCol}>
                      <Text style={rankText}>#{i + 1}</Text>
                    </Column>
                    <Column style={productCol}>
                      <Text style={productName}>{p.name}</Text>
                      {p.variantName && <Text style={variantName}>{p.variantName}</Text>}
                    </Column>
                    <Column style={qtyCol}>
                      <Text style={qtyText}>{p.totalQuantity} uds.</Text>
                      <Text style={revenueText}>{fmt(p.totalRevenue)}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </>
          )}

          {staleOrders.length > 0 && (
            <>
              <Section style={content}>
                <Heading style={h2}>⚠️ Órdenes sin actualizar (+48 hs)</Heading>
                <Text style={paragraph}>
                  Las siguientes órdenes llevan más de 48 horas sin cambio de estado:
                </Text>
              </Section>
              <Section style={staleBox}>
                {staleOrders.map((o, i) => (
                  <Row key={i} style={tableRow}>
                    <Column style={{ width: '40%' }}>
                      <Text style={orderNum}>{o.number}</Text>
                    </Column>
                    <Column style={{ width: '35%' }}>
                      <Text style={statusText}>{STATUS_LABELS[o.status] ?? o.status}</Text>
                    </Column>
                    <Column style={{ width: '25%', textAlign: 'right' }}>
                      <Text style={hoursText}>{o.hoursOld}hs</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </>
          )}

          <Section style={content}>
            <Text style={ctaText}>
              <a href={`${adminUrl}/admin/ordenes`} style={link}>Ver todas las órdenes →</a>
            </Text>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Resumen automático semanal de {siteName}. Solo lo recibís vos como administrador.
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
const logo: React.CSSProperties = { color: '#ffffff', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }
const subtitle: React.CSSProperties = { color: '#c7d2fe', fontSize: 13, margin: 0 }
const metricsSection: React.CSSProperties = { padding: '24px 40px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }
const metricCard: React.CSSProperties = { textAlign: 'center', width: '50%' }
const metricValue: React.CSSProperties = { color: '#111827', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }
const metricLabel: React.CSSProperties = { color: '#6b7280', fontSize: 13, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }
const content: React.CSSProperties = { padding: '24px 40px 4px' }
const h2: React.CSSProperties = { color: '#111827', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }
const paragraph: React.CSSProperties = { color: '#374151', fontSize: 14, lineHeight: '1.65', margin: '0 0 12px' }
const tableBox: React.CSSProperties = {
  backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
  margin: '4px 40px 16px', padding: '16px 24px',
}
const tableRow: React.CSSProperties = { width: '100%', marginBottom: 12 }
const rankCol: React.CSSProperties = { width: '8%', verticalAlign: 'top' }
const rankText: React.CSSProperties = { color: '#9ca3af', fontSize: 13, fontWeight: 700, margin: 0 }
const productCol: React.CSSProperties = { width: '62%', verticalAlign: 'top' }
const productName: React.CSSProperties = { color: '#111827', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }
const variantName: React.CSSProperties = { color: '#6b7280', fontSize: 12, margin: 0 }
const qtyCol: React.CSSProperties = { width: '30%', textAlign: 'right', verticalAlign: 'top' }
const qtyText: React.CSSProperties = { color: '#374151', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }
const revenueText: React.CSSProperties = { color: '#6b7280', fontSize: 12, margin: 0 }
const staleBox: React.CSSProperties = {
  backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8,
  margin: '4px 40px 16px', padding: '16px 24px',
}
const orderNum: React.CSSProperties = { color: '#111827', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', margin: 0 }
const statusText: React.CSSProperties = { color: '#374151', fontSize: 13, margin: 0 }
const hoursText: React.CSSProperties = { color: '#d97706', fontSize: 13, fontWeight: 700, margin: 0, textAlign: 'right' }
const ctaText: React.CSSProperties = { color: '#374151', fontSize: 14, margin: '8px 0 24px' }
const link: React.CSSProperties = { color: '#4f46e5', textDecoration: 'underline' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0 40px' }
const footer: React.CSSProperties = { padding: '20px 40px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 11, lineHeight: '1.6', margin: 0, textAlign: 'center' }
