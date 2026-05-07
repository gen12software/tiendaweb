import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface LowStockItem {
  productName: string
  variantName?: string
  sku?: string
  stock: number
}

interface LowStockAlertEmailProps {
  siteName: string
  items: LowStockItem[]
  threshold: number
  adminUrl: string
}

export function LowStockAlertEmail({
  siteName,
  items,
  threshold,
  adminUrl,
}: LowStockAlertEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>⚠️ {items.length} producto{items.length !== 1 ? 's' : ''} con stock bajo — {siteName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{siteName}</Text>
          </Section>

          <Section style={badgeSection}>
            <Text style={badge}>⚠️ Alerta de stock bajo</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              {items.length} producto{items.length !== 1 ? 's' : ''} con stock bajo
            </Heading>
            <Text style={paragraph}>
              Los siguientes productos tienen menos de <strong>{threshold} unidades</strong> disponibles.
              Te recomendamos reponer el stock a la brevedad para evitar quedarte sin existencias.
            </Text>
          </Section>

          <Section style={tableBox}>
            <Row style={tableHeader}>
              <Column style={colProduct}>Producto</Column>
              <Column style={colSku}>SKU</Column>
              <Column style={colStock}>Stock</Column>
            </Row>
            <Hr style={tableDivider} />
            {items.map((item, i) => (
              <Row key={i} style={tableRow}>
                <Column style={colProduct}>
                  <Text style={productName}>{item.productName}</Text>
                  {item.variantName && <Text style={variantName}>{item.variantName}</Text>}
                </Column>
                <Column style={colSku}>
                  <Text style={skuText}>{item.sku ?? '—'}</Text>
                </Column>
                <Column style={colStock}>
                  <Text style={item.stock === 0 ? stockZero : stockLow}>{item.stock}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              <a href={`${adminUrl}/admin/productos`} style={link}>Ir al panel de productos →</a>
            </Text>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Este es un aviso automático de {siteName}. Solo se envía una vez por producto por día.
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
const badgeSection: React.CSSProperties = { backgroundColor: '#fffbeb', padding: '14px 40px', textAlign: 'center' }
const badge: React.CSSProperties = { color: '#92400e', fontSize: 15, fontWeight: 600, margin: 0 }
const content: React.CSSProperties = { padding: '28px 40px 8px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 16px' }
const paragraph: React.CSSProperties = { color: '#374151', fontSize: 15, lineHeight: '1.65', margin: '0 0 16px' }
const tableBox: React.CSSProperties = {
  backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
  margin: '4px 40px 16px', padding: '16px 24px',
}
const tableHeader: React.CSSProperties = { width: '100%' }
const colProduct: React.CSSProperties = { color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', width: '55%' }
const colSku: React.CSSProperties = { color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', width: '25%' }
const colStock: React.CSSProperties = { color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right', width: '20%' }
const tableDivider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '10px 0' }
const tableRow: React.CSSProperties = { width: '100%', marginBottom: 8 }
const productName: React.CSSProperties = { color: '#111827', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }
const variantName: React.CSSProperties = { color: '#6b7280', fontSize: 12, margin: 0 }
const skuText: React.CSSProperties = { color: '#6b7280', fontSize: 12, fontFamily: 'monospace', margin: 0 }
const stockLow: React.CSSProperties = { color: '#d97706', fontSize: 14, fontWeight: 700, margin: 0, textAlign: 'right' }
const stockZero: React.CSSProperties = { color: '#dc2626', fontSize: 14, fontWeight: 700, margin: 0, textAlign: 'right' }
const link: React.CSSProperties = { color: '#4f46e5', textDecoration: 'underline' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0 40px' }
const footer: React.CSSProperties = { padding: '20px 40px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 11, lineHeight: '1.6', margin: 0, textAlign: 'center' }
