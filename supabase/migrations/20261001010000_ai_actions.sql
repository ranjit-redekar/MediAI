-- AI-drafted actions and the decisions on them.
--
-- Drafts are written by the server (the drafting Edge Function, with the secret
-- key), never by browsers: whether a draft needs a clinician depends on its
-- kind, so the kind has to come from somewhere a client can't relabel. Clients
-- read drafts and decide on them through decide_action(), which checks the
-- caller's role in that hospital. Every decision is appended to ai_action_log.

create type public.ai_action_kind as enum (
  'appointment', 'referral', 'lab', 'medication', 'monitoring', 'outreach', 'education', 'stock'
);
create type public.ai_action_status as enum ('pending', 'approved', 'dismissed');

create table public.ai_actions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  -- ponytail: free text until the patients table exists; becomes a foreign key then.
  patient_ref text not null default '',
  patient_name text not null default '',
  kind public.ai_action_kind not null,
  label text not null check (char_length(btrim(label)) between 1 and 200),
  detail text not null check (char_length(detail) <= 2000),
  rationale text not null default '' check (char_length(rationale) <= 2000),
  source text not null default '' check (char_length(source) <= 2000),
  confidence integer not null default 0 check (confidence between 0 and 100),
  minutes_saved integer not null default 0 check (minutes_saved between 0 and 600),
  -- Derived, so no one can file a medication order as not needing a clinician.
  requires_clinician boolean generated always as (kind in ('medication', 'monitoring')) stored,
  -- For bookings: {doctorId, doctorName, specialty, date, time}.
  booking jsonb,
  status public.ai_action_status not null default 'pending',
  decided_by uuid references auth.users on delete set null,
  decided_by_name text not null default '',
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index ai_actions_workspace_status_idx on public.ai_actions (workspace_id, status);

create table public.ai_action_log (
  id bigint generated always as identity primary key,
  action_id uuid not null references public.ai_actions on delete cascade,
  workspace_id uuid not null references public.workspaces on delete cascade,
  status public.ai_action_status not null,
  detail text not null,
  actor_id uuid references auth.users on delete set null,
  actor_name text not null,
  actor_role public.app_role not null,
  created_at timestamptz not null default now()
);
create index ai_action_log_action_idx on public.ai_action_log (action_id);

/**
 * Which roles may decide which kinds. Mirrors `actionKinds` in
 * src/data/accessRoles.ts (the UI) — this copy is the one that is enforced,
 * and supabase/tests/tenancy.check.mjs checks the two agree on the cases that
 * matter. Medication: doctors only. Monitoring: doctors and assistant doctors.
 */
create function private.can_decide(r public.app_role, k public.ai_action_kind) returns boolean
language sql immutable set search_path = '' as $$
  select case
    when k = 'medication' then r = 'doctor'
    when k = 'monitoring' then r in ('doctor', 'assistant-doctor')
    else (r, k) in (
      ('admin', 'appointment'), ('admin', 'referral'), ('admin', 'lab'), ('admin', 'outreach'), ('admin', 'education'),
      ('doctor', 'appointment'), ('doctor', 'referral'), ('doctor', 'lab'), ('doctor', 'outreach'), ('doctor', 'education'),
      ('assistant-doctor', 'appointment'), ('assistant-doctor', 'referral'), ('assistant-doctor', 'lab'),
      ('assistant-doctor', 'outreach'), ('assistant-doctor', 'education'),
      ('nurse', 'appointment'), ('nurse', 'outreach'), ('nurse', 'education'),
      ('pharmacist', 'stock'),
      ('lab-technician', 'lab'),
      ('receptionist', 'appointment'), ('receptionist', 'referral'), ('receptionist', 'outreach')
    )
  end;
$$;

-- Approve, dismiss, or undo (back to pending), optionally with an edited detail.
create function public.decide_action(
  action_id uuid,
  decision public.ai_action_status,
  final_detail text default null
) returns public.ai_actions
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  act public.ai_actions;
  member public.workspace_members;
begin
  select * into act from public.ai_actions where id = action_id for update;
  if not found then
    raise exception 'draft not found' using errcode = 'P0002';
  end if;

  select * into member from public.workspace_members
  where workspace_id = act.workspace_id and user_id = uid;
  -- Same answer for "not yours" and "doesn't exist": no probing other hospitals.
  if not found then
    raise exception 'draft not found' using errcode = 'P0002';
  end if;

  if not private.can_decide(member.role, act.kind) then
    raise exception 'a % cannot decide a % draft', member.role, act.kind using errcode = '42501';
  end if;

  update public.ai_actions set
    status = decision,
    detail = coalesce(nullif(btrim(final_detail), ''), detail),
    decided_by = case when decision = 'pending' then null else uid end,
    decided_by_name = case when decision = 'pending' then '' else member.full_name end,
    decided_at = case when decision = 'pending' then null else now() end
  where id = act.id
  returning * into act;

  insert into public.ai_action_log (action_id, workspace_id, status, detail, actor_id, actor_name, actor_role)
  values (act.id, act.workspace_id, decision, act.detail, uid, member.full_name, member.role);

  return act;
end;
$$;

alter table public.ai_actions enable row level security;
alter table public.ai_action_log enable row level security;
revoke all on public.ai_actions, public.ai_action_log from anon;
-- Clients only read; drafts come from the server and decisions go through decide_action().
revoke insert, update, delete, truncate on public.ai_actions, public.ai_action_log from authenticated;

create policy "members read their drafts" on public.ai_actions
  for select to authenticated using ((select private.is_member(workspace_id)));
create policy "members read the decision log" on public.ai_action_log
  for select to authenticated using ((select private.is_member(workspace_id)));

revoke all on function public.decide_action(uuid, public.ai_action_status, text) from public, anon;
grant execute on function public.decide_action(uuid, public.ai_action_status, text) to authenticated;
grant execute on function private.can_decide(public.app_role, public.ai_action_kind) to authenticated;
