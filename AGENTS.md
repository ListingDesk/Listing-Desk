# AGENTS.md – ListHub Architecture

This document provides an overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

ListHub is a classified ads / listing management site. There are two distinct audiences:
- **Buyers** – browse and view listings publicly
- **Admin** – the main ad lister who creates and manages all listings (single-user admin)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Database | Netlify Database (managed Postgres) via Drizzle ORM |
| Auth | Netlify Identity (`@netlify/identity`) |
| API | Netlify Functions (REST) |
| Icons | Lucide React |
| Language | TypeScript 5 |
| Deployment | Netlify |

## Directory Structure

```
src/routes/
  index.tsx                    # Public browse page (search, filter by category, listing grid)
  listings/$listingId.tsx      # Public listing detail page
  admin/
    route.tsx                  # Admin layout + auth guard (redirects to /admin/login if not logged in)
    login.tsx                  # Admin login form (Netlify Identity)
    index.tsx                  # Admin dashboard (listings table, quick actions)
    listings/
      new.tsx                  # Create listing form
      $listingId/edit.tsx      # Edit listing form

src/components/
  ListingForm.tsx              # Shared form used by both new.tsx and edit.tsx

netlify/functions/
  listings.ts                  # GET /api/listings, POST /api/listings
  listing-by-id.ts             # GET/PATCH/DELETE /api/listings/:id

db/
  schema.ts                    # Drizzle ORM schema – single `listings` table
  index.ts                     # Drizzle client (drizzle-orm/netlify-db)

netlify/database/migrations/   # Auto-generated SQL migrations (Netlify applies on deploy)
drizzle.config.ts              # Drizzle Kit config
```

## Data Model

The `listings` table has:
- `id`, `title`, `description`, `category`, `price` (cents integer, nullable = "contact for price")
- `location`, `contactName`, `contactEmail`, `contactPhone`
- `imageUrl`, `status` (active/sold/expired), `featured` (bool), timestamps

## Auth Strategy

- Netlify Identity for admin auth. The auth guard lives in `src/routes/admin/route.tsx` using `getUser()`.
- API mutation endpoints (POST/PATCH/DELETE) require `Authorization: Bearer <token>`. The frontend attaches `user.token.access_token`.
- Public read endpoints (GET) require no auth.
- `netlify.toml` CDN redirects further restrict `/admin/*` to users with the `admin` role.

## First Admin Setup

After deployment, go to Netlify Identity dashboard → Invite users → add `admin` role to your user.

## Coding Conventions

- All imports use the `@/` alias for `src/`.
- API route function imports use relative paths with `.js` extension (ESM requirement).
- Schema changes require `npx drizzle-kit generate` — never run `migrate` or `push`.
- Price is stored in cents (integer). `null` means "contact for price".
- `ListingForm` is the single source of truth for form fields.
- `GET /api/listings?all=true` returns all statuses (used by admin dashboard).
