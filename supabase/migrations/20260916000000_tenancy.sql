-- Tenancy core: a hospital (workspace), who belongs to it, and who has been invited.
-- Clinical tables (patients, appointments, …) arrive in later migrations and all
-- key off workspace_id, reusing the helpers below for their policies.

create type public.app_role as enum (
  'admin', 'doctor', 'assistant-doctor', 'nurse',
  'pharmacist', 'lab-technician', 'receptionist', 'patient'
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  facility_type text not null default 'hospital'
    check (facility_type in ('hospital', 'clinic', 'diagnostic', 'chain')),
  team_size text not null default '1-25'
    check (team_size in ('1-25', '26-150', '151-500', '500+')),
  plan_id text not null default 'growth'
    check (plan_id in ('starter', 'growth', 'enterprise')),
  -- Null once the hospital pays. Set by the database, never by the client.
  trial_ends_at timestamptz default now() + interval '14 days',
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role public.app_role not null,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_id_idx on public.workspace_members (user_id);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  email text not null check (email = lower(btrim(email)) and email like '_%@_%'),
  -- Admins are whoever signs a hospital up; patients come through the portal.
  role public.app_role not null check (role not in ('admin', 'patient')),
  invited_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

-- Helpers live outside `public` so the API never exposes them. SECURITY DEFINER
-- lets policies on workspace_members read workspace_members without recursing.
create schema if not exists private;

create function private.is_member(ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = (select auth.uid())
  );
$$;

create function private.is_admin(ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = (select auth.uid()) and role = 'admin'
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_member(uuid), private.is_admin(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invites enable row level security;

-- Nothing here is readable signed-out.
revoke all on public.workspaces, public.workspace_members, public.invites from anon;

create policy "members read their workspace" on public.workspaces
  for select to authenticated using ((select private.is_member(id)));
create policy "admins update their workspace" on public.workspaces
  for update to authenticated
  using ((select private.is_admin(id))) with check ((select private.is_admin(id)));

-- Plan and trial change only through billing (a server-side function with the
-- secret key), so admins may edit the descriptive columns and nothing else.
revoke insert, update, delete on public.workspaces from authenticated;
grant update (name, facility_type, team_size) on public.workspaces to authenticated;

create policy "members read their colleagues" on public.workspace_members
  for select to authenticated using ((select private.is_member(workspace_id)));
-- ponytail: no client writes to membership yet; invite acceptance adds them.
revoke insert, update, delete on public.workspace_members from authenticated;

create policy "admins read invites" on public.invites
  for select to authenticated using ((select private.is_admin(workspace_id)));
create policy "admins send invites" on public.invites
  for insert to authenticated with check ((select private.is_admin(workspace_id)));
create policy "admins revoke invites" on public.invites
  for delete to authenticated using ((select private.is_admin(workspace_id)));
revoke update on public.invites from authenticated;

-- Self-serve sign-up: the hospital, its admin membership and the first invites
-- are created in the same transaction as the auth user, so a sign-up can never
-- leave an account without a workspace — with or without email confirmation.
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := new.raw_user_meta_data;
  ws_id uuid;
  ws_slug text;
begin
  -- Invited staff sign up without a workspace; they join through their invite.
  if coalesce(btrim(meta ->> 'workspace_name'), '') = '' then
    return new;
  end if;

  ws_slug := coalesce(nullif(meta ->> 'workspace_slug', ''), 'workspace');
  -- Two hospitals with the same name get distinct subdomains.
  -- ponytail: check-then-insert can race; the unique constraint still wins, the
  -- loser's sign-up fails and can simply be retried.
  if exists (select 1 from public.workspaces where slug = ws_slug) then
    ws_slug := ws_slug || '-' || substr(md5(gen_random_uuid()::text), 1, 5);
  end if;

  insert into public.workspaces (name, slug, facility_type, team_size, plan_id)
  values (
    btrim(meta ->> 'workspace_name'),
    ws_slug,
    coalesce(meta ->> 'facility_type', 'hospital'),
    coalesce(meta ->> 'team_size', '1-25'),
    coalesce(meta ->> 'plan_id', 'growth')
  )
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role, full_name)
  values (ws_id, new.id, 'admin', coalesce(btrim(meta ->> 'full_name'), ''));

  insert into public.invites (workspace_id, email, role, invited_by)
  select ws_id, lower(btrim(i ->> 'email')), (i ->> 'role')::public.app_role, new.id
  from jsonb_array_elements(coalesce(meta -> 'invites', '[]'::jsonb)) as i
  where coalesce(btrim(i ->> 'email'), '') <> ''
  on conflict (workspace_id, email) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
