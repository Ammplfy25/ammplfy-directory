import { Link } from 'react-router-dom'
import type { Listing } from '../types/database'

interface Props {
  listing: Listing & { category_names?: string[] }
}

export default function ListingCard({ listing }: Props) {
  const initials = listing.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <Link to={`/listings/${listing.slug}`} className="block group">
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Logo / header */}
      <div className="h-36 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center relative">
        {listing.logo_url ? (
          <img
            src={listing.logo_url}
            alt={listing.name}
            className="w-20 h-20 object-contain rounded-xl"
          />
        ) : (
          <span className="text-3xl font-bold text-brand-500">{initials}</span>
        )}
        {listing.is_featured && (
          <span className="absolute top-3 right-3 bg-gold-400 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1">
          {listing.name}
        </h3>

        {listing.city && (
          <p className="text-xs text-gray-400 mb-2">
            {listing.city}, {listing.state ?? 'CA'}
          </p>
        )}

        {listing.description && (
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">
            {listing.description}
          </p>
        )}

        {listing.category_names && listing.category_names.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {listing.category_names.map((name) => (
              <span
                key={name}
                className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {listing.website && (
          <a
            href={listing.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Visit website →
          </a>
        )}
      </div>
    </article>
    </Link>
  )
}
