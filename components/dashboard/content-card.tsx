interface ContentItem {
  id: string
  title: string
  description: string | null
  category: string | null
  duration_minutes: number | null
  video_url: string | null
}

interface ContentCardProps {
  item: ContentItem
  onSelect: (item: ContentItem) => void
}

export default function ContentCard({ item, onSelect }: ContentCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="group text-left w-full rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-400 hover:shadow-md transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {item.title}
        </h3>
        {item.category && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {item.category}
          </span>
        )}
      </div>

      {item.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-400">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
        {item.duration_minutes ? `${item.duration_minutes} min` : 'Sin duración'}
      </div>
    </button>
  )
}
