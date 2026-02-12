# ImportFlow

UX-focused SaaS dashboard for managing data imports, built with Next.js and Tailwind CSS.

ImportFlow is a frontend application designed to help non-technical users monitor, understand, and manage data import processes without dealing with logs or technical complexity.

---

## 🎯 Project Purpose

The goal of this project is to showcase a **product-oriented frontend approach**, focusing on:

- clear and reassuring user experience
- async state management (loading, progress, error, retry)
- realistic SaaS dashboard architecture
- thoughtful UX copy and edge case handling
- clean and scalable frontend structure

The project is intentionally frontend-only, with mocked data and APIs, to focus on **UX and architectural decisions**.

---

## 👤 Target Users

- Operations / Admin users
- Non-technical stakeholders
- Business environments (SaaS, backoffice tools)

User needs:
- understand import status at a glance
- receive clear feedback when something goes wrong
- know what actions are available at every step

---

## 🧭 UX Overview

### Dashboard
Provides an immediate overview of the system status.

- KPI cards (running, completed, failed imports)
- Latest imports summary
- Contextual messages for:
  - all good
  - issues requiring attention
  - first-time usage (empty state)

---

### Imports List
Allows users to monitor and manage all imports.

- Table with status badges and progress indicators
- Simple filtering
- Clear empty and loading states

Import statuses are expressed in **human-readable language**, not technical codes.

---

### Import Details
Helps users understand what is happening and what to do next.

- Visual step progression (upload → validation → processing → completed)
- Progress feedback
- Error explanations in plain language
- Contextual actions (retry, duplicate, cancel)

---

### Create Import Flow
Guides users through the creation of a new import.

- Step-by-step form
- Inline validation
- Clear confirmation and submission feedback

---

## 🎨 UX Principles

- No unnecessary technical terminology
- Explicit handling of all UI states (loading, empty, error)
- Calm and reassuring tone of voice
- The system never blames the user

---

## 🛠️ Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Mocked APIs / data

---

## 🗂️ Project Structure

src/
├─ app/
│ ├─ dashboard/
│ ├─ imports/
│ │ ├─ page.tsx
│ │ └─ [id]/
│ └─ layout.tsx
├─ components/
│ ├─ ui/
│ ├─ dashboard/
│ └─ imports/
├─ hooks/
├─ services/
├─ lib/
└─ types/

---

## 🚀 Getting Started

```bash
npm install
npm run dev

## ☁️ Optional Supabase Setup (No Custom Backend)

The app can use Supabase as external backend for imports.
If Supabase env vars are missing, it automatically falls back to `localStorage`.

1. Copy env file and set values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

2. In Supabase SQL editor, create the table:

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

3. Enable RLS and add policies (for quick testing):

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
