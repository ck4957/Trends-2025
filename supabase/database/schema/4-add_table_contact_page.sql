create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists page_visits (
  id uuid primary key default gen_random_uuid(),
  visit_id text not null, -- unique identifier for the visitor (from cookie/localStorage)
  page text not null,
  user_agent text,
  ip text,
  created_at timestamp with time zone default timezone('utc', now())
);