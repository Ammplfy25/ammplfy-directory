import { Link } from 'react-router-dom'
import type { Post } from '../types/database'

interface Props {
  post: Post
  featured?: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function PostCard({ post, featured = false }: Props) {
  const date = post.published_at ?? post.created_at

  if (featured) {
    return (
      <Link to={`/blog/${post.slug}`} className="group block">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 group-hover:shadow-md transition-shadow">
          <div className="h-56 md:h-full bg-gradient-to-br from-brand-700 to-brand-500 relative overflow-hidden">
            {post.cover_url ? (
              <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 text-7xl font-extrabold tracking-tighter">AM</span>
              </div>
            )}
            <span className="absolute top-4 left-4 bg-gold-400 text-gray-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Featured
            </span>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <p className="text-xs text-gray-400 mb-2">{formatDate(date)}</p>
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3 group-hover:text-brand-600 transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
            )}
            <span className="mt-5 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
              Read more →
            </span>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group-hover:shadow-md transition-shadow h-full">
        <div className="h-44 bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden">
          {post.cover_url ? (
            <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-brand-200 text-5xl font-extrabold tracking-tighter">AM</span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-xs text-gray-400 mb-1">{formatDate(date)}</p>
          <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-brand-600 transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-3 flex-1">{post.excerpt}</p>
          )}
          <span className="mt-3 text-sm font-semibold text-brand-600">Read more →</span>
        </div>
      </article>
    </Link>
  )
}
