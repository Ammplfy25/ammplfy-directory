import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Post } from '../types/database'
import PostCard from '../components/PostCard'
import NewsletterSignup from '../components/NewsletterSignup'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? [])
        setLoading(false)
      })
  }, [])

  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-3">
            AMMPLFY Magazine
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Built for Families Who Mean Business
          </h1>
          <p className="text-brand-100 text-lg max-w-xl mx-auto">
            Stories, spotlights, and strategies for California's most driven families.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">No posts yet.</p>
            <p className="text-sm mt-1">Check back soon — stories are coming.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured post */}
            {featured && <PostCard post={featured} featured />}

            {/* Rest of the posts */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">
                  More Stories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-16">
          <NewsletterSignup source="blog" />
        </div>
      </div>
    </div>
  )
}
