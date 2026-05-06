'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: string
  image_url: string
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
}

interface Props {
  slides: Slide[]
  fallbackTitle: string
  fallbackSubtitle: string
  fallbackCtaText: string
  fallbackCtaUrl: string
  primaryColor?: string
}

const HERO_BG = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'

export default function HeroCarousel({ slides, fallbackTitle, fallbackSubtitle, fallbackCtaText, fallbackCtaUrl, primaryColor = '#4f46e5' }: Props) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  // margin-top negativo sube la sección para tapar el gap blanco; el padding-top restaura el espacio visual
  const sectionStyle = { background: HERO_BG, marginTop: '-96px', paddingTop: '128px' }

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden" style={sectionStyle}>
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: primaryColor }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center text-white space-y-6 relative z-10">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">{fallbackTitle}</h1>
          {fallbackSubtitle && <p className="text-lg text-white/60 max-w-xl mx-auto">{fallbackSubtitle}</p>}
          <Link
            href={fallbackCtaUrl}
            className="inline-block px-8 py-3.5 rounded-full text-sm font-semibold bg-white hover:bg-white/90 transition-colors"
            style={{ color: primaryColor }}
          >
            {fallbackCtaText}
          </Link>
        </div>
      </section>
    )
  }

  const slide = slides[current]
  const title = slide.title || fallbackTitle
  const subtitle = slide.subtitle || fallbackSubtitle
  const ctaText = slide.cta_text || fallbackCtaText
  const ctaUrl = slide.cta_url || fallbackCtaUrl

  return (
    <section className="relative overflow-hidden" style={sectionStyle}>
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: primaryColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-5 pointer-events-none"
        style={{ background: primaryColor }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[520px] py-12 lg:py-16">

          <div className="space-y-6 order-2 lg:order-1">
            <div>
              {title && (
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-4">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-6">{subtitle}</p>
              )}
              {ctaText && (
                <Link
                  href={ctaUrl}
                  className="inline-block px-8 py-3.5 rounded-full text-sm font-semibold bg-white hover:bg-white/90 transition-colors"
                  style={{ color: primaryColor }}
                >
                  {ctaText}
                </Link>
              )}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:border-white/70 hover:bg-white/10 transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:border-white/70 hover:bg-white/10 transition-all"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="relative order-1 lg:order-2 rounded-2xl overflow-hidden aspect-4/3 lg:aspect-3/2 w-full shadow-2xl">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
              >
                <Image
                  src={s.image_url}
                  alt={s.title || 'Hero'}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
