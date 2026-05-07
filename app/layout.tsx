import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { getSiteConfig } from '@/lib/site-config'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ConditionalShell from '@/components/layout/conditional-shell'
import WhatsAppButton from '@/components/shared/whatsapp-button'
import { Toaster } from '@/components/ui/sonner'
import CartProvider from '@/components/cart/cart-context'
import CartDrawer from '@/components/cart/cart-drawer'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  return {
    title: config.site_name,
    description: config.hero_description,
    icons: config.favicon_url ? { icon: config.favicon_url } : undefined,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const config = await getSiteConfig()

  const themeVars = {
    '--color-primary': config.primary_color,
    '--color-secondary': config.color_secondary,
    '--color-accent': config.color_accent,
    '--theme-background': config.color_background,
    '--theme-surface': config.color_surface,
...(config.font_heading ? { '--font-dynamic-heading': `'${config.font_heading}', sans-serif` } : {}),
    ...(config.font_body    ? { '--font-dynamic-body':    `'${config.font_body}', sans-serif` }    : {}),
  } as React.CSSProperties

  // Build Google Fonts URL for dynamic fonts
  const googleFonts = [config.font_heading, config.font_body]
    .filter(Boolean)
    .map(f => `family=${encodeURIComponent(f!)}:wght@400;500;600;700`)
    .join('&')
  const googleFontsUrl = googleFonts
    ? `https://fonts.googleapis.com/css2?${googleFonts}&display=swap`
    : null

  return (
    <html
      lang="es"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
      style={themeVars}
    >
      {googleFontsUrl && (
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={googleFontsUrl} rel="stylesheet" />
        </head>
      )}
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <CartDrawer />
          <ConditionalShell
            header={<Header config={config} />}
            footer={<Footer config={config} />}
          >
            {children}
          </ConditionalShell>
          <WhatsAppButton />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
