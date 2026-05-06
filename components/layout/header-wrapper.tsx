'use client'

interface Props {
  children: React.ReactNode
  primaryColor?: string
  textColor?: string
}

export default function HeaderWrapper({ children, primaryColor = '#4f46e5', textColor }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: textColor || '#ffffff',
      }}
    >
      {children}
    </header>
  )
}

