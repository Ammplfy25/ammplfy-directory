import type { Category } from '../types/database'

interface Props {
  categories: Category[]
  selected: string | null
  onChange: (slug: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Categories
      </h2>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onChange(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected === null
                ? 'bg-brand-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Businesses
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected === cat.slug
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
