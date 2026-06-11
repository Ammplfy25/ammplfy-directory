import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Category, Listing } from '../types/database'

type Tab = 'pending' | 'add'

type ListingWithCategories = Listing & { category_names: string[] }

const EMPTY_FORM = {
  name: '', slug: '', description: '', website: '', email: '', phone: '',
  address: '', city: '', postal_code: '',
  logo_url: '', instagram: '', facebook: '',
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminPage() {
  const { signOut, user } = useAuth()
  const [tab, setTab] = useState<Tab>('pending')
  const [pending, setPending] = useState<ListingWithCategories[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingPending, setLoadingPending] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  useEffect(() => {
    loadPending()
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [])

  async function loadPending() {
    setLoadingPending(true)
    const { data } = await supabase
      .from('listings')
      .select('*, listing_categories(category_id, categories(name))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setPending(
      (data ?? []).map((l: any) => ({
        ...l,
        category_names: (l.listing_categories ?? []).map((lc: any) => lc.categories?.name).filter(Boolean),
      })),
    )
    setLoadingPending(false)
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('listings').update({ status }).eq('id', id)
    setPending((prev) => prev.filter((l) => l.id !== id))
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'name') next.slug = slugify(value)
      return next
    })
  }

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  async function handleAddListing(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)

    const social: Record<string, string> = {}
    if (form.instagram) social.instagram = form.instagram
    if (form.facebook) social.facebook = form.facebook

    const { data: inserted, error } = await supabase
      .from('listings')
      .insert({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        website: form.website || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        postal_code: form.postal_code || null,
        logo_url: form.logo_url || null,
        social_links: Object.keys(social).length ? social : null,
        status: 'approved',
      })
      .select('id')
      .single()

    if (error || !inserted) {
      setSaveMsg(`Error: ${error?.message ?? 'Unknown error'}`)
      setSaving(false)
      return
    }

    if (selectedCats.length > 0) {
      await supabase.from('listing_categories').insert(
        selectedCats.map((category_id) => ({ listing_id: inserted.id, category_id })),
      )
    }

    setSaveMsg(`"${form.name}" added and approved!`)
    setForm(EMPTY_FORM)
    setSelectedCats([])
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-extrabold text-brand-700 text-lg tracking-tight">AMMPLFY</span>
          <span className="ml-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Admin</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{user?.email}</span>
          <button onClick={signOut} className="text-red-500 hover:underline">Sign out</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['pending', 'add'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'pending' ? `Pending Approval${pending.length ? ` (${pending.length})` : ''}` : 'Add Listing'}
            </button>
          ))}
        </div>

        {/* Pending tab */}
        {tab === 'pending' && (
          <div>
            {loadingPending ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">No pending listings</p>
                <p className="text-sm mt-1">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{listing.name}</h3>
                      {listing.city && <p className="text-xs text-gray-400 mt-0.5">{listing.city}, {listing.state}</p>}
                      {listing.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {listing.website && <span>{listing.website}</span>}
                        {listing.email && <span>{listing.email}</span>}
                        {listing.phone && <span>{listing.phone}</span>}
                      </div>
                      {listing.category_names.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {listing.category_names.map((n) => (
                            <span key={n} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{n}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      <button
                        onClick={() => updateStatus(listing.id, 'approved')}
                        className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(listing.id, 'rejected')}
                        className="flex-1 sm:flex-none bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add listing tab */}
        {tab === 'add' && (
          <form onSubmit={handleAddListing} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="font-semibold text-gray-900 text-lg">Add a Listing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Business Name *" name="name" value={form.name} onChange={handleFormChange} required />
              <Field label="Slug (auto-generated)" name="slug" value={form.slug} onChange={handleFormChange} required />
              <Field label="Website" name="website" value={form.website} onChange={handleFormChange} />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleFormChange} />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleFormChange} />
              <Field label="Logo URL" name="logo_url" value={form.logo_url} onChange={handleFormChange} />
              <Field label="Address" name="address" value={form.address} onChange={handleFormChange} />
              <Field label="City" name="city" value={form.city} onChange={handleFormChange} />
              <Field label="Postal Code" name="postal_code" value={form.postal_code} onChange={handleFormChange} />
              <Field label="Instagram URL" name="instagram" value={form.instagram} onChange={handleFormChange} />
              <Field label="Facebook URL" name="facebook" value={form.facebook} onChange={handleFormChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedCats.includes(cat.id)
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {saveMsg && (
              <p className={`text-sm ${saveMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              {saving ? 'Saving…' : 'Add & Approve Listing'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label, name, value, onChange, type = 'text', required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  )
}
