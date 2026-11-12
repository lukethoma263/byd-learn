create table if not exists users (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('teacher', 'student')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id text primary key,
  title text not null,
  description text not null default '',
  created_by text not null references users(id),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists materials (
  id text primary key,
  course_id text references courses(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('pdf', 'video', 'document')),
  body text,
  mime_type text,
  file_name text,
  file_data bytea,
  sort_order integer not null default 0,
  created_by text not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_course_id_idx on materials(course_id);
create index if not exists courses_created_by_idx on courses(created_by);
