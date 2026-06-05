# ListHub – Listing & Ad Management Site

ListHub is a full-stack classified ads / listing management platform built on Netlify. Buyers can browse and search published listings; the admin (the main ad lister) can create, edit, feature, and delete listings from a protected dashboard.

## Tech Stack

- **Framework**: TanStack Start (React, file-based routing, SSR)
- **Styling**: Tailwind CSS v4
- **Database**: Netlify Database (managed Postgres) via Drizzle ORM
- **Auth**: Netlify Identity (`@netlify/identity`)
- **API**: Netlify Functions (REST endpoints for listings CRUD)
- **Icons**: Lucide React

## Running Locally

```bash
npm install
netlify dev --port 8889
```

The app will be available at `http://localhost:8889`. Netlify Identity and Database require a deployed site — use `netlify dev` (not plain `vite dev`) to get full feature parity locally.

## First-Time Admin Setup

After deployment:
1. Go to **Identity** in your Netlify project dashboard
2. Click **Invite users** and enter your email
3. Accept the invite and set a password
4. Open the user's detail page → add the `admin` role
5. Sign in at `/admin/login`
