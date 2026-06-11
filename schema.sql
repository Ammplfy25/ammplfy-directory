-- ============================================================
-- AMMPLFY DIRECTORY — CORE SCHEMA (v1)
-- Database: Supabase (Postgres)
-- ============================================================
-- This schema builds the v1 directory: users, listings, categories,
-- newsletter subscribers, and blog posts. It is designed so that future
-- features (contests, etc.) ATTACH via new tables with foreign keys —
-- never requiring a teardown of these core tables.
--
-- Enable UUID generation (Supabase has pgcrypto available).
create extension if not exists "pgcrypto";


-- ============================================================
-- USERS
-- Accounts for business owners (and admins/team).
-- The center of the relational model — listings and posts hang off this.
-- ============================================================
create table users (
    id            uuid primary key default gen_random_uuid(),
    email         text unique not null,
    full_name     text,
    role          text not null default 'member',  -- 'member' | 'admin'
    created_at    timestamptz not null default now()
);


-- ============================================================
-- CATEGORIES
-- Directory categories (e.g. "Family Fitness", "Tutoring", "Arts").
-- Self-referencing parent_id allows nested/sub-categories later.
-- ============================================================
create table categories (
    id            uuid primary key default gen_random_uuid(),
    name          text not null,
    slug          text unique not null,             -- URL-friendly, e.g. "family-fitness"
    description   text,
    parent_id     uuid references categories(id),   -- null = top-level category
    created_at    timestamptz not null default now()
);


-- ============================================================
-- LISTINGS
-- The heart of the directory. Each listing optionally belongs to a user
-- (the owner). status drives the submission → approval workflow.
-- ============================================================
create table listings (
    id            uuid primary key default gen_random_uuid(),
    owner_id      uuid references users(id),        -- null if team-added before claim
    status        text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'

    -- Basics
    name          text not null,
    slug          text unique not null,             -- URL-friendly listing page
    description   text,
    website       text,
    email         text,
    phone         text,

    -- Location & hours
    address       text,
    city          text,
    state         text default 'CA',
    postal_code   text,
    hours         jsonb,                            -- flexible: {"mon":"9-5", ...}

    -- Media & social
    logo_url      text,
    photos        jsonb,                            -- array of image URLs
    social_links  jsonb,                            -- {"instagram":"...", "facebook":"..."}

    -- Housekeeping
    is_featured   boolean not null default false,   -- supports a future VIP/featured tier
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);


-- ============================================================
-- LISTING_CATEGORIES (join table)
-- Many-to-many: a listing can be in several categories, and a category
-- holds many listings. This flexibility is what real filtering needs.
-- ============================================================
create table listing_categories (
    listing_id    uuid not null references listings(id) on delete cascade,
    category_id   uuid not null references categories(id) on delete cascade,
    primary key (listing_id, category_id)
);


-- ============================================================
-- SUBSCRIBERS (newsletter)
-- Deliberately standalone — someone can drop their email WITHOUT an account.
-- The directory holds the list; GHL handles sending.
-- ============================================================
create table subscribers (
    id            uuid primary key default gen_random_uuid(),
    email         text unique not null,
    source        text,                             -- where they signed up, e.g. "home", "listing"
    synced_to_ghl boolean not null default false,   -- tracks GHL sync status
    created_at    timestamptz not null default now()
);


-- ============================================================
-- POSTS (blog / magazine)
-- Hangs off users by author. A blog post is just "a user wrote some text."
-- ============================================================
create table posts (
    id            uuid primary key default gen_random_uuid(),
    author_id     uuid references users(id),
    status        text not null default 'draft',    -- 'draft' | 'published'
    title         text not null,
    slug          text unique not null,
    excerpt       text,
    body          text,                             -- markdown or HTML
    cover_url     text,
    published_at  timestamptz,
    created_at    timestamptz not null default now()
);


-- ============================================================
-- USEFUL INDEXES
-- ============================================================
create index idx_listings_status      on listings(status);
create index idx_listings_city        on listings(city);
create index idx_posts_status         on posts(status);
create index idx_listing_categories_l on listing_categories(listing_id);
create index idx_listing_categories_c on listing_categories(category_id);


-- ============================================================
-- FUTURE FEATURES — DO NOT BUILD YET (reference only)
-- ============================================================
-- These illustrate how new features ATTACH without changing the core.
-- Keep them commented until their phase arrives.
--
-- CONTESTS (target: next month; may use UpViral first)
--   create table contests (
--       id          uuid primary key default gen_random_uuid(),
--       name        text not null,
--       starts_at   timestamptz,
--       ends_at     timestamptz,
--       created_at  timestamptz not null default now()
--   );
--   create table contest_entries (
--       id          uuid primary key default gen_random_uuid(),
--       contest_id  uuid not null references contests(id),
--       user_id     uuid references users(id),
--       listing_id  uuid references listings(id),   -- reuses listings already built
--       created_at  timestamptz not null default now()
--   );
--
-- Notice: contests reference existing users and listings. Nothing above
-- has to change. That is the test of a good schema — new feature = new
-- table + foreign keys, never a teardown.
-- ============================================================
