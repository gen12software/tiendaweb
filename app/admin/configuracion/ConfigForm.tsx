'use client'

import { useActionState } from 'react'
import { updateSiteConfigAction } from './actions'
import type { SiteConfig } from '@/lib/site-config'

export default function ConfigForm({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(updateSiteConfigAction, { error: '', success: '' })

  return (
    <form action={action} className="space-y-5">
      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {state.success}
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del sitio
        </label>
        <input
          id="site_name" name="site_name" type="text"
          defaultValue={config.site_name}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
          URL del logo <span className="text-gray-400 font-normal">(imagen externa o ruta /public)</span>
        </label>
        <input
          id="logo_url" name="logo_url" type="url"
          defaultValue={config.logo_url}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-1">
          Color primario
        </label>
        <div className="flex items-center gap-3">
          <input
            id="primary_color" name="primary_color" type="color"
            defaultValue={config.primary_color}
            className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer p-1"
          />
          <span className="text-sm text-gray-500">Se aplica en botones y acentos del sitio</span>
        </div>
      </div>

      <div>
        <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 mb-1">
          Título principal (Hero)
        </label>
        <input
          id="hero_title" name="hero_title" type="text"
          defaultValue={config.hero_title}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="hero_description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del Hero
        </label>
        <textarea
          id="hero_description" name="hero_description" rows={3}
          defaultValue={config.hero_description}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit" disabled={pending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  )
}
