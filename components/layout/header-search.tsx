'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeaderSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) router.push(`/productos?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border border-border rounded-full px-4 py-2 bg-background w-56 lg:w-72 focus-within:ring-2 focus-within:ring-foreground/15 transition-all">
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="¿Qué estás buscando?"
        className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </form>
  )
}
