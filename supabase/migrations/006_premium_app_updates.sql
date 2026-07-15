-- Links premium app updates to their previous version.
alter table public.builds add column if not exists parent_build_id uuid references public.builds(id) on delete set null;
create index if not exists builds_parent_build_idx on public.builds(parent_build_id) where parent_build_id is not null;
