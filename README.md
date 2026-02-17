# ImportFlow

ImportFlow is a frontend dashboard to monitor and manage data imports with clear UX states (loading, empty, error, success), built with Next.js App Router and TypeScript.

## Features

- Dashboard with KPI cards (all, pending, failed, completed)
- Latest imports table (top 5 by `updatedAt`)
- Warning banner when failed imports are present
- Imports page with status filter (`all`, `pending`, `completed`, `failed`)
- Create import modal with:
  - name validation
  - file drag-and-drop
  - file type validation (`CSV`, `Excel`, `XML`, `JSON`)
  - CSV delimiter selection (`comma`, `semicolon`, `tab`)
- CSV export for imports list
- Global loader overlay
- Toast notifications (alert/info)
- Internationalization with `next-intl` (`it`, `en`)
- Optional Supabase persistence with automatic fallback to `localStorage`

## Tech Stack

- Next.js 16 (App Router)
- React (see `package.json` for current version)
- TypeScript
- Tailwind CSS 4
- next-intl
- react-icons

## Routes

- `/` -> app entry page
- `/dashboard` -> KPI + latest imports
- `/imports` -> list, filter, export, create modal

## Data Layer

Data access is implemented in `src/lib/data/importsRepository.ts`.

- If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured, the app reads/writes imports via Supabase REST API.
- If config is missing or request fails, it falls back to browser `localStorage` (`imports` key).

## Project Structure

```text
src/
  app/
    (pages)/
      dashboard/page.tsx
      imports/page.tsx
      layout.tsx
    components/
      ui/
      card/
      popup/
      imports-table/
      empty-states/
    layout.tsx
    page.tsx
  lib/
    context/MenuContext.tsx
    data/importsRepository.ts
    i18n/{it,en}.json
    types/types.ts
```

## Prerequisites

- Node.js `v20.9.0`
- npm `v10.1.0`

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - start dev server
- `npm run build` - build app
- `npm start` - run production build
- `npm run lint` - run Next.js lint
- `npm test` - currently placeholder script

## Optional Supabase Setup

1. Create `.env.local` from example:

```bash
cp .env.example .env.local
```

2. Set environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3. Create table in Supabase SQL editor:

```sql
create table if not exists public.imports (
  id uuid primary key,
  name text not null,
  type text not null,
  status text not null check (status in ('pending', 'completed', 'failed')),
  progress integer null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
```

4. Enable RLS and basic anon policies (for quick testing):

```sql
alter table public.imports enable row level security;

create policy "Allow read imports" on public.imports
for select
to anon
using (true);

create policy "Allow insert imports" on public.imports
for insert
to anon
with check (true);
```
