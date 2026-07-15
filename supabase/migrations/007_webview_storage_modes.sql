-- Controls WebView cache/data behavior per generated app.
alter table public.builds add column if not exists storage_mode text not null default 'low' check(storage_mode in ('normal','low','ephemeral'));
