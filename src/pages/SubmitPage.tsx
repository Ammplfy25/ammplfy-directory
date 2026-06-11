import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

type HoursEntry = { open: string; close: string; closed: boolean }
type HoursState = Record<string, HoursEntry>

const defaultHours = (): HoursState =>
  Object.fromEntries(
    DAYS.map(({ key }) => [key, { open: '09:00', close: '17:00', closed: false }]),
  )

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

type Step = 'form' | 'success'

export default function SubmitPage() {
  const [step, setStep] = useState<Step>('form')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fields, setFields] = useState({
    name: '', slug: '', description: '',
    website: '', email: '', phone: '',
    address: '', city: '', postal_code: '',
    logo_url: '', instagram: '', facebook: '',
  })
  const [hours, setHours] = useState<HoursState>(defaultHours())

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [])

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFields((prev) => {
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
      }),
    )

    // Ensure slug is unique by appending a short random suffix if needed
    const slug = fields.slug || slugify(fields.name)

    const { data: inserted, error: insertError } = await supabase
      .from('listings')
      .insert({
        name: fields.name,
        slug,
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
      setError(insertError?.message ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    if (selectedCats.length > 0) {
      await supabase.from('listing_categories').insert(
        selectedCats.map((category_id) => ({ listing_id: inserted.id, category_id })),
      )
    }

    setStep('success')
    setSubmitting(false)
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You're submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Thanks for submitting <span className="font-semibold text-gray-700">{fields.name}</span> to the
            AMMPLFY Directory. Our team will review your listing and you'll hear from us shortly.
          </p>
          <a
            href="/"
            className="mt-6 inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Back to Directory
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            List Your Business — Free
          </h1>
          <p className="text-brand-100 text-base max-w-lg mx-auto">
            Join California's curated directory for achievement-minded families.
            Submissions are reviewed by our team before going live.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic info */}
          <Section title="Business Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Business Name *" name="name" value={fields.name} onChange={handleField} required />
              <Field label="Website" name="website" value={fields.website} onChange={handleField} placeholder="https://" />
              <Field label="Contact Email" name="email" type="email" value={fields.email} onChange={handleField} />
              <Field label="Phone" name="phone" value={fields.phone} onChange={handleField} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(tell families what makes you special)</span>
              </label>
              <textarea
                name="description"
                value={fields.description}
                onChange={handleField}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="We help kids aged 6–16 build confidence through…"
              />
            </div>
          </Section>

          {/* Categories */}
          <Section title="Category">
            <p className="text-sm text-gray-500 mb-3">Select all that apply.</p>
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
          </Section>

          {/* Location */}
          <Section title="Location">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Street Address" name="address" value={fields.address} onChange={handleField} />
              </div>
              <Field label="City" name="city" value={fields.city} onChange={handleField} />
              <Field label="ZIP Code" name="postal_code" value={fields.postal_code} onChange={handleField} />
            </div>
          </Section>

          {/* Hours */}
          <Section title="Business Hours">
            <p className="text-sm text-gray-500 mb-3">Check "Closed" for days you're not open.</p>
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium text-gray-700">{label}</span>
                  <input
                    type="checkbox"
                    checked={hours[key].closed}
                    onChange={() => toggleClosed(key)}
                    className="accent-brand-500"
                  />
                  <span className="text-xs text-gray-400 w-10">Closed</span>
                  {!hours[key].closed && (
                    <>
                      <input
                        type="time"
                        value={hours[key].open}
                        onChange={(e) => setHoursField(key, 'open', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <input
                        type="time"
                        value={hours[key].close}
                        onChange={(e) => setHoursField(key, 'close', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Media & Social */}
          <Section title="Logo & Social">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Logo URL" name="logo_url" value={fields.logo_url} onChange={handleField} placeholder="https://…" />
              </div>
              <Field label="Instagram URL" name="instagram" value={fields.instagram} onChange={handleField} placeholder="https://instagram.com/…" />
              <Field label="Facebook URL" name="facebook" value={fields.facebook} onChange={handleField} placeholder="https://facebook.com/…" />
            </div>
          </Section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !fields.name}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Listings are reviewed by our team before going live. We'll be in touch.
          </p>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 text-base mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, name, value, onChange, type = 'text', required = false, placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
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
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  )
}
