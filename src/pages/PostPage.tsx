import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../types/database'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setPost(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Post not found.</p>
          <Link to="/blog" className="text-brand-600 text-sm mt-2 block hover:underline">
            ← Back to Magazine
          </Link>
        </div>
      </div>
    )
  }

  const date = post.published_at ?? post.created_at

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover image / hero */}
      {post.cover_url ? (
        <div className="h-72 sm:h-96 w-full overflow-hidden relative">
          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-brand-900 to-brand-600" />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/blog" className="text-sm text-brand-600 hover:underline mb-6 block">
          ← Back to Magazine
        </Link>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10">
          <header className="mb-8">
            <p className="text-xs text-gray-400 mb-2">{formatDate(date)}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-gray-500 mt-4 leading-relaxed">{post.excerpt}</p>
            )}
          </header>

          {post.body && (
            <div
              className="prose prose-gray prose-headings:font-bold prose-a:text-brand-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}
        </article>
      </div>
    </div>
  )
}
