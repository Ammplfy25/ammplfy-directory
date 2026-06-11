export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string
          owner_id: string | null
          status: string
          name: string
          slug: string
          description: string | null
          website: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          hours: Json | null
          logo_url: string | null
          photos: Json | null
          social_links: Json | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          created_at: string
        }
      }
      listing_categories: {
        Row: {
          listing_id: string
          category_id: string
        }
      }
      subscribers: {
        Row: {
          id: string
          email: string
          source: string | null
          synced_to_ghl: boolean
          created_at: string
        }
        Insert: {
          email: string
          source?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string | null
          status: string
          title: string
          slug: string
          excerpt: string | null
          body: string | null
          cover_url: string | null
          published_at: string | null
          created_at: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
        }
      }
    }
  }
}

export type Listing = Database['public']['Tables']['listings']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
