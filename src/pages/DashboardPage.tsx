import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Listing, Category } from '../types/database'
import SubmitListingForm from '../components/SubmitListingForm'
import EditListingForm from '../components/EditListingForm'

type View = 'listings' | 'submit' | { type: 'edit'; listing: Listing }

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [pendingEditIds, setPendingEditIds] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<Category[]>([])
  const [view, setView] = useState<View>('listings')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: listingsData }, { data: editsData }, { data: catsData }] = await Promise.all([
      supabase.from('listings').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('listing_edits').select('listing_id').eq('submitted_by', user!.id).eq('status', 'pending'),
      supabase.from('categories').select('*').order('name'),
    ])
    setListings(listingsData ?? [])
    setPendingEditIds(new Set((editsData ?? []).map((e: any) => e.listing_id)))
    setCategories(catsData ?? [])
    setLoading(false)
  }

  async function handleSubmitNew(_listingId: string) {
    await loadData()
    setView('listings')
  }

  async function handleEditSubmit() {
    await loadData()
    setView('listings')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-extrabold text-brand-700 text-lg tracking-tight">AMMPLFY</Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">My Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{user?.email}</span>
          <button onClick={signOut} className="text-red-500 hover:underline">Sign out</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'listings' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
              <button
                onClick={() => setView('submit')}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Submit New Listing
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-gray-500 font-medium">You haven't submitted any listings yet.</p>
                <button
                  onClick={() => setView('submit')}
                  className="mt-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Submit Your First Listing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => {
                  const hasPendingEdit = pendingEditIds.has(listing.id)
                  return (
                    <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">{listing.name}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[listing.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {listing.status}
                          </span>
                          {hasPendingEdit && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Edit under review
                            </span>
                          )}
                        </div>
                        {listing.city && (
                          <p className="text-xs text-gray-400 mt-0.5">{listing.city}, {listing.state}</p>
                        )}
                        {listing.status === 'rejected' && (
                          <p className="text-xs text-red-500 mt-1">Your listing was not approved. Edit and resubmit below.</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {listing.status === 'approved' && (
                          <Link
                            to={`/listings/${listing.slug}`}
                            target="_blank"
                            className="text-xs font-medium text-brand-600 hover:underline px-3 py-1.5"
                          >
                            View
                          </Link>
                        )}
                        {hasPendingEdit ? (
                          <span className="text-xs text-gray-400 px-3 py-1.5">Edit pending…</span>
                        ) : (
                          <button
                            onClick={() => setView({ type: 'edit', listing })}
                            className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {view === 'submit' && (
          <div>
            <button onClick={() => setView('listings')} className="text-sm text-brand-600 hover:underline mb-6 block">
              ← Back to My Listings
            </button>
            <SubmitListingForm
              categories={categories}
              ownerId={user!.id}
              onSuccess={handleSubmitNew}
            />
          </div>
        )}

        {typeof view === 'object' && view.type === 'edit' && (
          <div>
            <button onClick={() => setView('listings')} className="text-sm text-brand-600 hover:underline mb-6 block">
              ← Back to My Listings
            </button>
            <EditListingForm
              listing={view.listing}
              categories={categories}
              onSuccess={handleEditSubmit}
            />
          </div>
        )}
      </div>
    </div>
  )
}
