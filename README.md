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