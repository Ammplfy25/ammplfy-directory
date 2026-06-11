import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

type HoursEntry = { open: string; close: string; closed: boolean }
type HoursState = Record<string, HoursEntry>

const defaultHours = (): HoursState =>
  Object.fromEntries(DAYS.map(({ key }) => [key, { open: '09:00', close: '17:00', closed: false }]))

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

interface Props {
  categories: Category[]
  ownerId: string
  onSuccess: (listingId: string) => void
}

const EMPTY = {
  name: '', slug: '', description: '', website: '', email: '', phone: '',
  address: '', city: '', postal_code: '', logo_url: '', instagram: '', facebook: '',
}

export default function SubmitListingForm({ categories, ownerId, onSuccess }: Props) {
  const [fields, setFields] = useState(EMPTY)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [hours, setHours] = useState<HoursState>(defaultHours())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFields((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'name') next.slug = slugify(value)
      return next
    })
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

    const { data: inserted, error: insertError } = await supabase
      .from('listings')
      .insert({
        owner_id: ownerId,
        name: fields.name,
        slug: fields.slug || slugify(fields.name),
        description: fields.description || null,
        website: fields.website || null,
        email: fields.email || null,
        phone: fields.phone || null,
        address: fields.address || null,
        city: fields.city || null,
        postal_code: fields.postal_code || null,
        logo_url: fields.logo_url || null,
        social_links: Object.keys(social).length ? social : null,
        hours: hoursPayload,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      setError(insertError?.message ?? 'Something went wrong.')
      setSubmitting(false)
      return
    }

    if (selectedCats.length > 0) {
      await supabase.from('listing_categories').insert(
        selectedCats.map((category_id) => ({ listing_id: inserted.id, category_id }))
      )
    }

    setSubmitting(false)
    onSuccess(inserted.id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Submit a New Listing</h2>

      <Section title="Business Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name *" name="name" value={fields.name} onChange={handleField} required />
          <Field label="Website" name="website" value={fields.website} onChange={handleField} placeholder="https://" />
          <Field label="Contact Email" name="email" type="email" value={fields.email} onChange={handleField} />
          <Field label="Phone" name="phone" value={fields.phone} onChange={handleField} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={fields.description} onChange={handleField} rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Tell families what makes you special…" />
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
            <Field label="Logo URL" name="logo_url" value={fields.logo_url} onChange={handleField} placeholder="https://…" />
          </div>
          <Field label="Instagram URL" name="instagram" value={fields.instagram} onChange={handleField} />
          <Field label="Facebook URL" name="facebook" value={fields.facebook} onChange={handleField} />
        </div>
      </Section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <button type="submit" disabled={submitting || !fields.name}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
        {submitting ? 'Submitting…' : 'Submit for Review'}
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

function Field({ label, name, value, onChange, type = 'text', required = false, placeholder }: {
  label: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string; required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
  )
}
