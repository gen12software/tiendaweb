import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getSiteConfig } from '@/lib/site-config'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import WhatsAppButton from '@/components/shared/whatsapp-button'
import { Toaster } from '@/components/ui/sonner'
import CartProvider from '@/components/cart/cart-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
  } as React.CSSProperties

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
      style={themeVars}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header config={config} />
          <main className="flex-1">{children}</main>
          <Footer config={config} />
          <WhatsAppButton />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
