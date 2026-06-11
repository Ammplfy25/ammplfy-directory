import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-brand-700">
            AMMPLFY
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-0.5">
            Directory
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-brand-600 transition-colors">
            Directory
          </Link>
          <Link to="/blog" className="hover:text-brand-600 transition-colors">
            Magazine
          </Link>
          <Link
            to="/submit"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            List Your Business
          </Link>
        </nav>
      </div>
    </header>
  )
}
