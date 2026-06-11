# CLAUDE.md — AMMPLFY Directory

This file is the source of truth for building the AMMPLFY Directory. Any AI builder (Claude Code, Replit Agent) working on this project must read and follow this file before writing or changing code. When in doubt, follow this document.

---

## 1. What We're Building

The AMMPLFY Directory is a curated directory of California small businesses that serve achievement-minded, entrepreneurial families. It is the free "front door" of the AMMPLFY value ladder — the businesses listed here are our "Dream 100."

**Critical principle:** This is **v1 of a platform**, not a one-off directory. It starts as a directory but will grow to include newsletters, a blog/magazine, and contests. Build every decision so future features *attach* to what exists rather than forcing a rebuild.

This month's job: a barebones-but-polished directory that lets us add business listings, capture newsletter subscribers, and serve as a blog/magazine-style funnel hub.

---

## 2. Core Architecture Rules (Do Not Violate)

1. **The database is sovereign and host-independent.** All data lives in **Supabase (Postgres)**. We own it. The host (Replit now, possibly Vercel later) must be swappable without touching the data.
2. **Real relational schema from day one.** Listings, users, and categories are separate, related tables. This is what makes future features bolt on cleanly.
3. **A new feature is a new table with foreign keys pointing at the core — never a teardown of existing tables.** The core (users, listings, categories) must stay stable.
4. **UUIDs for primary keys**, not sequential integers. (Don't reveal record counts; avoid collisions on merges.)
5. **The `status` field on listings runs the submission workflow.** Public site shows only `approved` listings.
6. **Keep business logic in the app, not in third-party tools.** GHL is a swappable marketing plug-in (email sending), never the backbone.

---

## 3. Tech Stack

- **Database:** Supabase (Postgres). Connected to Claude Code via the Supabase MCP server.
- **Primary builder:** Claude Code — owns the data model and load-bearing code. Make careful architectural decisions; avoid unrequested assumptions.
- **Scaffolding & host:** Replit Agent 4 for fast UI scaffolding; codebase lives and deploys on Replit.
- **Email / Newsletter sending:** GHL via its native MCP server. The directory *holds* the subscriber list in Supabase; GHL *sends*.
- **Frontend:** React + TypeScript. Clean, polished, mobile-responsive.

---

## 4. v1 Scope (Build This Now)

**In scope:**
- Business listings with full detail (see schema): name, description, category, contact, website, address, hours, logo/photos, social links.
- Listing submission → approval flow (via `status` field).
- Two intake paths: team adds manually now; businesses can self-submit later (build the submission form, but listings start as `pending` until approved).
- Categories with many-to-many relationship to listings.
- Newsletter signup (capture email → store in Supabase → sync/send via GHL).
- Blog / magazine-style home that doubles as the funnel hub (posts).

**Explicitly NOT in v1 (but schema must be ready for):**
- Contests (target next month; may use UpViral first).
- Advanced platform features (fall).

**Design bar:** barebones in feature count, but visually polished and professional. This is the Dream 100's first impression of AMMPLFY.

---

## 5. The Offer Context (Why This Exists)

The directory is the **free "A — Authority"** rung of the ACE value ladder:
- **Free:** directory listing (builds the business's authority/visibility).
- **Hook:** an "ACE Founders Gift" incentivizes them to start a GHL trial.
- **Core conversion:** GHL trial signup (the profit center).
- **Back end / Ongoing:** ACE upgrade + mastermind.

The directory must make a business feel they got something genuinely valuable for free, and naturally lead toward "now capture the leads this sends you" (GHL). Keep this in mind for any calls-to-action or funnel touchpoints.

---

## 6. Build Order

1. Stand up Supabase; create the core schema (see schema file).
2. Build listing display + category filtering (public, approved-only).
3. Build the admin/manual add + approval flow.
4. Build the self-submit form (creates `pending` listings).
5. Add newsletter capture (store in Supabase; wire GHL sending).
6. Add the blog/magazine home (posts).
7. Polish UI; deploy to a live URL on Replit.

---

## 7. Tone & Brand Notes

- AMMPLFY balances cinematic edge with family-friendliness. Professional and aspirational, not clinical.
- The directory serves businesses (B2B) this month. Voice is confident, helpful, and premium — these are partners we're inviting into something special, not leads we're processing.

---

*This is a living document. Update it as decisions evolve so every builder stays aligned.*
