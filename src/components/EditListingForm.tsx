import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Listing, Category } from '../types/database'

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

type HoursEntry = { open: string; close: string; closed: boolean }
type HoursState = Record<string, HoursEntry>

function parseHours(raw: unknown): HoursState {
  const defaults = Object.fromEntries(DAYS.map(({ key }) => [key, { open: '09:00', close: '17:00', closed: false }]))
  if (!raw || typeof raw !== 'object') return defaults
  const map = raw as Record<string, { open: string; close: string } | null>
  return Object.fromEntries(
    DAYS.map(({ key }) => {
      const val = map[key]
      return [key, val ? { open: val.open, close: val.close, closed: false } : { open: '09:00', close: '17:00', closed: true }]
    })
  )
}

interface Props {
  listing: Listing
  categories: Category[]
  onSuccess: () => void
}

export default function EditListingForm({ listing, categories, onSuccess }: Props) {
  const { user } = useAuth()
  const [currentCatIds, setCurrentCatIds] = useState<string[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [hours, setHours] = useState<HoursState>(parseHours(listing.hours))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const social = listing.social_links as Record<string, string> | null

  const [fields, setFields] = useState({
    name: listing.name,
    description: listing.description ?? '',
    website: listing.website ?? '',
    email: listing.email ?? '',
    phone: listing.phone ?? '',
    address: listing.address ?? '',
    city: listing.city ?? '',
    postal_code: listing.postal_code ?? '',
    logo_url: listing.logo_url ?? '',
    instagram: social?.instagram ?? '',
    facebook: social?.facebook ?? '',
  })

  useEffect(() => {
    supabase
      .from('listing_categories')
      .select('category_id')
      .eq('listing_id', listing.id)
      .then(({ data }) => {
        const ids = (data ?? []).map((r: any) => r.category_id)
        setCurrentCatIds(ids)
        setSelectedCats(ids)
      })
  }, [listing.id])

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  function toggleCat(id: string) {
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  function setHoursField(day: string, field: 'open' | 'close', value: string) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  function toggleClosed(day: string) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], closed: !prev[day].closed } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const social: Record<string, string> = {}
    if (fields.instagram) social.instagram = fields.instagram
    if (fields.facebook) social.facebook = fields.facebook

    const hoursPayload = Object.fromEntries(
      DAYS.map(({ key }) => {
        const h = hours[key]
        return [key, h.closed ? null : { open: h.open, close: h.close }]
      })
    )

    // Only include categories in the edit if they changed
    const catsChanged =
      JSON.stringify([...selectedCats].sort()) !== JSON.stringify([...currentCatIds].sort())

    const { error: editError } = await supabase
      .from('listing_edits')
      .insert({
        listing_id: listing.id,
        submitted_by: user!.id,
        status: 'pending',
        name: fields.name !== listing.name ? fields.name : null,
        description: fields.description !== (listing.description ?? '') ? fields.description || null : null,
        website: fields.website !== (listing.website ?? '') ? fields.website || null : null,
        email: fields.email !== (listing.email ?? '') ? fields.email || null : null,
        phone: fields.phone !== (listing.phone ?? '') ? fields.phone || null : null,
        address: fields.address !== (listing.address ?? '') ? fields.address || null : null,
        city: fields.city !== (listing.city ?? '') ? fields.city || null : null,
        postal_code: fields.postal_code !== (listing.postal_code ?? '') ? fields.postal_code || null : null,
        logo_url: fields.logo_url !== (listing.logo_url ?? '') ? fields.logo_url || null : null,
        social_links: JSON.stringify(social) !== JSON.stringify(listing.social_links ?? {}) ? (Object.keys(social).length ? social : null) : null,
        hours: JSON.stringify(hoursPayload) !== JSON.stringify(listing.hours) ? hoursPayload : null,
        category_ids: catsChanged ? selectedCats : null,
      })

    if (editError) {
      setError(editError.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Edit Listing</h2>
        <p className="text-sm text-gray-500 mt-1">
          Changes will be reviewed by our team before going live. Your listing stays public while the edit is under review.
        </p>
      </div>

      <Section title="Business Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name *" name="name" value={fields.name} onChange={handleField} required />
          <Field label="Website" name="website" value={fields.website} onChange={handleField} />
          <Field label="Contact Email" name="email" type="email" value={fields.email} onChange={handleField} />
          <Field label="Phone" name="phone" value={fields.phone} onChange={handleField} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={fields.description} onChange={handleField} rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </Section>

      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => toggleCat(cat.id)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${selectedCats.includes(cat.id) ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Street Address" name="address" value={fields.address} onChange={handleField} />
          </div>
          <Field label="City" name="city" value={fields.city} onChange={handleField} />
          <Field label="ZIP Code" name="postal_code" value={fields.postal_code} onChange={handleField} />
        </div>
      </Section>

      <Section title="Business Hours">
        <div className="space-y-2">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-10 text-sm font-medium text-gray-700">{label}</span>
              <input type="checkbox" checked={hours[key].closed} onChange={() => toggleClosed(key)} className="accent-brand-500" />
              <span className="text-xs text-gray-400 w-10">Closed</span>
              {!hours[key].closed && (
                <>
                  <input type="time" value={hours[key].open} onChange={(e) => setHoursField(key, 'open', e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <span className="text-gray-400 text-sm">–</span>
                  <input type="time" value={hours[key].close} onChange={(e) => setHoursField(key, 'close', e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Logo & Social">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Logo URL" name="logo_url" value={fields.logo_url} onChange={handleField} />
          </div>
          <Field label="Instagram URL" name="instagram" value={fields.instagram} onChange={handleField} />
          <Field label="Facebook URL" name="facebook" value={fields.facebook} onChange={handleField} />
        </div>
      </Section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
        {submitting ? 'Submitting edit…' : 'Submit Edit for Review'}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 text-base mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', required = false }: {
  label: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
  )
}
