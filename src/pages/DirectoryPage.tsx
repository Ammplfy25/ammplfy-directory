import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Listing } from '../types/database'
import CategoryFilter from '../components/CategoryFilter'
import ListingCard from '../components/ListingCard'
import NewsletterSignup from '../components/NewsletterSignup'

type ListingWithCategories = Listing & { category_names: string[] }

export default function DirectoryPage() {
  const [listings, setListings] = useState<ListingWithCategories[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: rawListings }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('listings')
          .select('*, listing_categories(category_id, categories(name, slug))')
          .eq('status', 'approved')
          .order('is_featured', { ascending: false })
          .order('name'),
      ])

      setCategories(cats ?? [])

      const enriched: ListingWithCategories[] = (rawListings ?? []).map((l: any) => ({
        ...l,
        category_names: (l.listing_categories ?? []).map(
          (lc: any) => lc.categories?.name ?? '',
        ).filter(Boolean),
        category_slugs: (l.listing_categories ?? []).map(
          (lc: any) => lc.categories?.slug ?? '',
        ).filter(Boolean),
      }))

      setListings(enriched)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = listings.filter((l) => {
    const matchesCategory =
      selectedCategory === null ||
      (l as any).category_slugs?.includes(selectedCategory)

    const q = search.toLowerCase()
    const matchesSearch =
      q === '' ||
      l.name.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            California's Best Family Businesses
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto mb-8">
            A curated directory of local businesses handpicked for achievement-minded,
            entrepreneurial families.
          </p>
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by name, city, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-gray-900 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <p className="text-lg font-medium">No listings found.</p>
                <p className="text-sm mt-1">Try a different category or search term.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-5">
                  {filtered.length} business{filtered.length !== 1 ? 'es' : ''}
                  {selectedCategory ? ` in ${categories.find(c => c.slug === selectedCategory)?.name}` : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <NewsletterSignup source="directory" />
      </div>
    </div>
  )
}
