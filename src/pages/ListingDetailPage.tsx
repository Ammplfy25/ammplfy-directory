import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Listing, Category } from '../types/database'

type FullListing = Listing & { categories: Category[] }

type HoursMap = Record<string, { open: string; close: string } | null>

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [listing, setListing] = useState<FullListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('listings')
      .select('*, listing_categories(categories(*))')
      .eq('slug', slug)
      .eq('status', 'approved')
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return }
        const categories = (data.listing_categories as any[])
          .map((lc: any) => lc.categories)
          .filter(Boolean)
        setListing({ ...data, categories })
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Listing not found.</p>
          <Link to="/" className="text-brand-600 text-sm mt-2 block hover:underline">
            ← Back to Directory
          </Link>
        </div>
      </div>
    )
  }

  const social = listing.social_links as Record<string, string> | null
  const hours = listing.hours as HoursMap | null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/" className="text-sm text-brand-600 hover:underline mb-6 block">
          ← Back to Directory
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="h-40 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex items-center px-8 gap-6">
            {listing.logo_url ? (
              <img
                src={listing.logo_url}
                alt={listing.name}
                className="w-20 h-20 rounded-xl object-contain bg-white p-1"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                {listing.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-white">{listing.name}</h1>
              {listing.city && (
                <p className="text-brand-100 text-sm mt-0.5">
                  {listing.city}, {listing.state ?? 'CA'}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {listing.categories.map((cat) => (
                  <span key={cat.id} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {listing.description && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">About</h2>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
              )}

              {hours && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Hours</h2>
                  <dl className="space-y-1">
                    {DAYS.map(({ key, label }) => {
                      const day = hours[key]
                      return (
                        <div key={key} className="flex justify-between text-sm">
                          <dt className="text-gray-600 w-28">{label}</dt>
                          <dd className="text-gray-900 font-medium">
                            {day ? `${day.open} – ${day.close}` : 'Closed'}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                </div>
              )}
            </div>

            {/* Sidebar: contact */}
            <aside className="space-y-5">
              {listing.website && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Visit Website
                </a>
              )}

              <div className="space-y-3 text-sm">
                {listing.phone && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                    <a href={`tel:${listing.phone}`} className="text-gray-800 hover:text-brand-600">{listing.phone}</a>
                  </div>
                )}
                {listing.email && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                    <a href={`mailto:${listing.email}`} className="text-gray-800 hover:text-brand-600">{listing.email}</a>
                  </div>
                )}
                {listing.address && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Address</p>
                    <p className="text-gray-800">{listing.address}</p>
                    {listing.city && <p className="text-gray-800">{listing.city}, {listing.state} {listing.postal_code}</p>}
                  </div>
                )}
              </div>

              {social && Object.keys(social).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Follow</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(social).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium capitalize bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
