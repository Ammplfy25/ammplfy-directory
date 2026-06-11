import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  source?: string
  variant?: 'banner' | 'footer'
}

export default function NewsletterSignup({ source = 'home', variant = 'banner' }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const { error } = await supabase
      .from('subscribers')
      .insert({ email: email.trim().toLowerCase(), source })

    if (error) {
      if (error.code === '23505') {
        // Unique violation — already subscribed, treat as success
        setState('success')
      } else {
        setErrorMsg('Something went wrong. Please try again.')
        setState('error')
      }
      return
    }

    setState('success')
  }

  if (variant === 'footer') {
    return (
      <div>
        <p className="text-sm font-semibold text-white mb-3">Stay in the loop</p>
        {state === 'success' ? (
          <p className="text-sm text-green-300">You're in — talk soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="bg-gold-400 hover:bg-gold-500 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {state === 'loading' ? '…' : 'Subscribe'}
            </button>
          </form>
        )}
        {state === 'error' && <p className="text-xs text-red-300 mt-1">{errorMsg}</p>}
      </div>
    )
  }

  // Banner variant
  return (
    <section className="bg-gradient-to-r from-brand-900 to-brand-700 rounded-2xl px-8 py-10 text-white text-center">
      <h2 className="text-2xl font-extrabold tracking-tight mb-2">
        The AMMPLFY Newsletter
      </h2>
      <p className="text-brand-100 text-sm max-w-md mx-auto mb-6">
        New listings, local spotlights, and resources for California's most driven families —
        delivered to your inbox.
      </p>

      {state === 'success' ? (
        <div className="flex items-center justify-center gap-2 text-green-300 font-medium">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          You're subscribed — talk soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="bg-gold-400 hover:bg-gold-500 text-gray-900 font-semibold text-sm px-6 py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {state === 'loading' ? 'Subscribing…' : 'Subscribe Free'}
          </button>
        </form>
      )}
      {state === 'error' && <p className="text-xs text-red-300 mt-2">{errorMsg}</p>}
    </section>
  )
}
