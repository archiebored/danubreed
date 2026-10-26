-- Expo push tokens for the native app (mobile/).
-- Safe to run more than once: every statement is idempotent.
-- Run in the Supabase SQL editor.

create table if not exists public.expo_push_tokens (
  token      text primary key,
  member_id  uuid,
  created_at timestamptz not null default now()
);

-- Optional: link tokens to members. Only run this if public.members.id is uuid;
-- if it is text, this errors and you can simply skip it — nothing else depends on it.
-- alter table public.expo_push_tokens
--   add constraint expo_push_tokens_member_id_fkey
--   foreign key (member_id) references public.members(id) on delete set null;

alter table public.expo_push_tokens enable row level security;

-- The app registers its own token using the publishable (anon) key.
-- Insert/update only: tokens are never readable by clients.
drop policy if exists "anon can register a push token" on public.expo_push_tokens;
create policy "anon can register a push token"
  on public.expo_push_tokens
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anon can refresh its push token" on public.expo_push_tokens;
create policy "anon can refresh its push token"
  on public.expo_push_tokens
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Reading and deleting stay service-role only (the send-notification function),
-- so no client can enumerate the congregation's push tokens.
