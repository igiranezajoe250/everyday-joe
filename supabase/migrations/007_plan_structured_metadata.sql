-- Plan structured metadata for the expanded note, journal, and planning system.
-- Existing notes remain plain-text compatible; these columns let Bount reason
-- over modes, highlights, financial/planning blocks, links, versions, privacy,
-- and AI action history without introducing a new storage model.

alter table public.plan_files
  add column if not exists mode text not null default 'personal',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists versions jsonb not null default '[]'::jsonb,
  add column if not exists ai_history jsonb not null default '[]'::jsonb,
  add column if not exists privacy jsonb not null default '{"level":"private","bount_access":true}'::jsonb,
  add column if not exists links jsonb not null default '[]'::jsonb;

create index if not exists plan_files_mode_idx on public.plan_files(user_id, mode);
create index if not exists plan_files_metadata_gin_idx on public.plan_files using gin(metadata);
