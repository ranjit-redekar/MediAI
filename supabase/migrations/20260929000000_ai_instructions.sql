-- Each hospital's instructions for the AI agents, appended after MediAI's fixed
-- base prompt (supabase/functions/_shared/system-prompt.ts). Append-only: every
-- save is a new version, the newest is the one agents use, and a rollback is a
-- new version with an old body — so the history can't be rewritten.

create table public.ai_instructions (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces on delete cascade,
  version int not null,
  body text not null check (char_length(body) <= 4000),
  note text not null default '' check (char_length(note) <= 200),
  author_id uuid references auth.users on delete set null,
  author_name text not null default '',
  created_at timestamptz not null default now(),
  unique (workspace_id, version)
);

-- Version, author and time come from the database, never from the client.
-- ponytail: two admins saving in the same instant collide on the unique
-- constraint and one save fails with an error; it can simply be retried.
create function private.stamp_ai_instructions() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.version := coalesce(
    (select max(version) from public.ai_instructions where workspace_id = new.workspace_id), 0
  ) + 1;
  new.author_id := (select auth.uid());
  new.author_name := coalesce((
    select full_name from public.workspace_members
    where workspace_id = new.workspace_id and user_id = (select auth.uid())
  ), '');
  new.created_at := now();
  return new;
end;
$$;

create trigger stamp_ai_instructions
  before insert on public.ai_instructions
  for each row execute function private.stamp_ai_instructions();

alter table public.ai_instructions enable row level security;
revoke all on public.ai_instructions from anon;
revoke update, delete, truncate on public.ai_instructions from authenticated;

create policy "admins read ai instructions" on public.ai_instructions
  for select to authenticated using ((select private.is_admin(workspace_id)));
create policy "admins add ai instructions" on public.ai_instructions
  for insert to authenticated with check ((select private.is_admin(workspace_id)));
