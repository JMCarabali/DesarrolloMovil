create table if not exists public.walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  distance_m integer not null default 0 check (distance_m >= 0),
  start_lat double precision,
  start_lng double precision,
  end_lat double precision,
  end_lng double precision,
  coordinates jsonb not null default '[]'::jsonb,
  note text not null default '' check (char_length(note) <= 160),
  photo_path text,
  created_at timestamptz not null default now()
);

alter table public.walks enable row level security;

drop policy if exists "Users can read their walks" on public.walks;
create policy "Users can read their walks"
  on public.walks for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their walks" on public.walks;
create policy "Users can create their walks"
  on public.walks for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their walks" on public.walks;
create policy "Users can update their walks"
  on public.walks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their walks" on public.walks;
create policy "Users can delete their walks"
  on public.walks for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('walk-photos', 'walk-photos', false)
on conflict (id) do nothing;

drop policy if exists "Users can read their walk photos" on storage.objects;
create policy "Users can read their walk photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload their walk photos" on storage.objects;
create policy "Users can upload their walk photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can replace their walk photos" on storage.objects;
create policy "Users can replace their walk photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their walk photos" on storage.objects;
create policy "Users can delete their walk photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'walks'
  ) then
    alter publication supabase_realtime add table public.walks;
  end if;
end
$$;
