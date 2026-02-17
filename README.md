# ImportFlow

ImportFlow is a Next.js dashboard to manage data imports with clear UX states (loading, empty, success, error), i18n support, and optional Supabase persistence.

## Core Features

- Dashboard KPIs: `all`, `pending`, `failed`, `completed`
- Latest imports table (top 5 by `updatedAt`)
- Warning banner when failed imports exist
- Imports page:
  - status filter (`all`, `pending`, `completed`, `failed`)
  - search by name/id with debounce
  - paginated fetch (`limit/offset`) with in-memory page cache
  - CSV export for current filtered dataset
  - create-import modal
- Import detail page:
  - metadata cards (type, status, progress, duration, created/updated)
  - file info (name, size)
  - download action
  - delete action with confirmation modal
- Create import flow:
  - import name validation
  - drag and drop file upload
  - file extension validation by selected type (`CSV`, `Excel`, `XML`, `JSON`)
  - CSV delimiter selection (`comma`, `semicolon`, `tab`)
- Global loader and toast notifications
- Localization via `next-intl` (`it`, `en`)

## Routes

- `/` redirects to `/dashboard`
- `/dashboard` KPI cards + latest imports
- `/imports` full list (filter/search/pagination/export/create)
- `/imports/[id]/detail` import detail (download/delete)

## Data Layer

Repository: `src/lib/data/importsRepository.ts`

- With `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, data is stored in Supabase (REST + Storage).
- Storage bucket defaults to `import-files` and can be overridden with `NEXT_PUBLIC_SUPABASE_IMPORTS_BUCKET`.
- If Supabase config is missing, or a remote call fails, repository falls back to `localStorage` (`imports` key).

## Tech Stack

- Next.js `^16.1.5` (App Router)
- React `^19.2.4`
- TypeScript
- Tailwind CSS `^4`
- next-intl
- react-icons

## Prerequisites

- Node.js `>=20`
- npm `>=10`

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Run in development

```bash
npm run dev
```

3. Production build

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` starts development server
- `npm run build` builds the app
- `npm start` starts production server
- `npm run lint` runs Next lint
- `npm test` placeholder script (no automated tests yet)

## Optional Supabase Setup

1. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

2. Configure variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
# Optional (default: import-files)
NEXT_PUBLIC_SUPABASE_IMPORTS_BUCKET=import-files
```

3. Create `imports` table:

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

4. Enable RLS + anon policies:

```sql
alter table public.imports enable row level security;

create policy "Allow read imports" on public.imports
for select to anon using (true);

create policy "Allow insert imports" on public.imports
for insert to anon with check (true);

create policy "Allow delete imports" on public.imports
for delete to anon using (true);
```

5. Create storage bucket + policies:

```sql
insert into storage.buckets (id, name, public)
values ('import-files', 'import-files', false)
on conflict (id) do nothing;

create policy "Allow upload import files" on storage.objects
for insert to anon with check (bucket_id = 'import-files');

create policy "Allow list/read import files" on storage.objects
for select to anon using (bucket_id = 'import-files');

create policy "Allow delete import files" on storage.objects
for delete to anon using (bucket_id = 'import-files');
```
