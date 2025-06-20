# Database Schema – Happy-Birthday-Website

> Supabase (Postgres + Storage + Realtime) is used as the backend.  This document tracks all tables, buckets and Row-Level-Security (RLS) rules necessary for local/production deployments.

---

## 1. Tables

| Table | Purpose |
|-------|---------|
| `birthdays` | Thông tin ngày sinh, dùng cho countdown & trang chính |
| `messages` | Tin nhắn văn bản trong chat |
| `audio_messages` | Lời chúc ghi âm (file URL) |
| `video_messages` | Lời chúc video (file URL) |
| `media` | Ảnh / video kỷ niệm trong album |
| `gifts` | Quà tặng ảo (emoji) |

### 1.1 birthdays
```sql
create table if not exists public.birthdays (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  dob date not null,
  message text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

### 1.2 messages
```sql
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  birthday_id uuid references public.birthdays(id) on delete cascade,
  sender_id uuid references auth.users(id),
  text text,
  created_at timestamptz default now()
);
```

### 1.3 audio_messages / video_messages (tương tự)
```sql
create table if not exists public.audio_messages (
  id uuid primary key default uuid_generate_v4(),
  birthday_id uuid references public.birthdays(id) on delete cascade,
  sender_id uuid references auth.users(id),
  audio_url text,
  created_at timestamptz default now()
);
```

### 1.4 media
```sql
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  type text check (type in ('photo','video')),
  path text not null,
  tags text[],
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);
```

### 1.5 gifts
```sql
create table if not exists public.gifts (
  id uuid primary key default uuid_generate_v4(),
  birthday_id uuid references public.birthdays(id) on delete cascade,
  sender_id uuid references auth.users(id),
  emoji text not null,
  created_at timestamptz default now()
);
```

---

## 2. Storage Buckets
| Bucket | Usage |
|--------|-------|
| `media` | Ảnh/video album |
| `audio` | Ghi âm lời chúc |
| `video` | Video lời chúc |

All buckets: `public` read, authenticated users write their own files.

---

## 3. Row-Level-Security (RLS)
Example for `media` table:
```sql
-- enable rls
alter table public.media enable row level security;

-- policy: owners can select/update/delete; everyone can select when type = 'photo'
create policy "Media read" on public.media
for select using ( true );

create policy "Media owner write" on public.media
for insert with check ( auth.uid() = owner_id )
using ( auth.uid() = owner_id );
```
> Repeat similar policies for other tables.

---

## 4. Generating TypeScript Types
```bash
# requires supabase CLI
yarn global add supabase
supabase gen types typescript --project-id <your-project-id> > types/supabase.d.ts
```

---

## 5. Migrations
Commit SQL files under `supabase/migrations/` or use `supabase db push`.
