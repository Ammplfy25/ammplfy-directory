import { Link } from 'react-router-dom'
import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <span className="text-xl font-extrabold tracking-tight">AMMPLFY</span>
            <p className="text-brand-100 text-sm mt-2 leading-relaxed max-w-xs">
              California's curated directory for achievement-minded, entrepreneurial families.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold mb-3">Directory</p>
            <ul className="space-y-2 text-sm text-brand-100">
              <li><Link to="/" className="hover:text-white transition-colors">Browse Businesses</Link></li>
              <li><Link to="/submit" className="hover:text-white transition-colors">List Your Business</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Magazine</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterSignup source="footer" variant="footer" />
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-brand-100 text-center">
          © {new Date().getFullYear()} AMMPLFY. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
