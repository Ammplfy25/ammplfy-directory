import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Header() {
  const { session, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-brand-700">AMMPLFY</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-0.5">Directory</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-brand-600 transition-colors hidden sm:block">Directory</Link>
          <Link to="/blog" className="hover:text-brand-600 transition-colors hidden sm:block">Magazine</Link>

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                  {session.user.email?.[0].toUpperCase()}
                </span>
                <span className="hidden sm:block text-sm">Account</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 overflow-hidden">
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut() }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signin" className="text-sm font-medium text-gray-600 hover:text-brand-600 px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Link to="/signin" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                List Your Business
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
