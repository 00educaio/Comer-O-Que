create table public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint app_feedback_name_length_check check (
    char_length(btrim(name)) between 2 and 80
  ),
  constraint app_feedback_message_length_check check (
    char_length(btrim(message)) between 6 and 1200
  )
);

create index app_feedback_created_at_idx
  on public.app_feedback(created_at desc);

alter table public.app_feedback enable row level security;

grant insert (name, message) on public.app_feedback to anon;

create policy "anon insert app feedback"
on public.app_feedback
for insert
to anon
with check (
  char_length(btrim(name)) between 2 and 80
  and char_length(btrim(message)) between 6 and 1200
);
