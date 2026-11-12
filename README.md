# BYD Learn

Greenfield LMS MVP for Project BYD_LMS: teachers publish courses with interactive PDFs, videos, and markdown documents; students browse and view materials only.

## Quick start

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Local development uses in-memory **PGlite** (Postgres-compatible). Published apps declare Postgres via `cursor-app.json`.

Unset any inherited `DATABASE_URL` when developing locally (`npm run dev` already does this).

## Demo accounts

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Teacher | teacher@byd.learn  | teacher123  |
| Student | student@byd.learn  | student123  |

## Features

- Cookie-based teacher / student sign-in
- Teacher studio: create courses, upload interactive PDFs and videos, write markdown documents
- Student space: browse published courses and open materials (no edit controls)
- Files stored in the database and served inline (`/api/files/[id]`)

## Interactive PDF notes

Browsers often render PDFs with limited support for InDesign interactivity (buttons, embedded media, forms). BYD Learn serves PDFs inline and offers download so learners can open them in Adobe Acrobat for full features.
