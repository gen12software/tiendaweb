import { SiteConfig } from '@/lib/site-config'

interface Props { config: SiteConfig }

export default function AnnouncementBar({ config }: Props) {
  const configured = [
    config.announcement_1,  config.announcement_2, config.announcement_3,
    config.announcement_4,  config.announcement_5, config.announcement_6,
    config.announcement_7,  config.announcement_8, config.announcement_9,
    config.announcement_10,
  ].filter(Boolean) as string[]

  const items = configured.length > 0 ? configured : [
    config.free_shipping_threshold
      ? `Envío gratis a partir de ${config.currency_symbol}${Number(config.free_shipping_threshold).toLocaleString('es-AR')}`
      : 'Envíos a todo el país',
    'Comprá con total seguridad',
    config.whatsapp_number ? 'Atención personalizada por WhatsApp' : 'Productos originales y exclusivos',
  ]

  const track = [...items, ...items]

  return (
    <div
      className="text-xs py-2.5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: config.announcement_text_color || '#ffffff',
      }}
    >
      <div className="flex w-max animate-marquee">
        {track.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-10 font-medium tracking-widest uppercase">
            {item}
            <span className="ml-10 text-white/30">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
