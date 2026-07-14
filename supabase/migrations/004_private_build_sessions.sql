-- Stable, unguessable URL for each private create/build session.
alter table public.builds add column if not exists public_code text unique;
create unique index if not exists builds_public_code_idx on public.builds(public_code) where public_code is not null;
