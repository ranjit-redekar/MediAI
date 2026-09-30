-- Invited staff join their hospital. Sign-up only creates a workspace for the
-- person registering it; everyone else arrives through an invite, which this
-- claims. It is an RPC the app calls when a signed-in user has no membership,
-- rather than a sign-up trigger, so it also works for someone who already had
-- an account when they were invited.

create function public.accept_invites() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  addr text;
  name text;
  joined integer;
begin
  -- Only a confirmed address can claim an invite. Otherwise anyone could sign
  -- up as nurse@hospital.test and walk into that hospital.
  select lower(email), coalesce(btrim(raw_user_meta_data ->> 'full_name'), '')
    into addr, name
  from auth.users
  where id = uid and email_confirmed_at is not null;
  if addr is null then
    return 0;
  end if;

  -- The invite is spent either way; an existing membership is left as it is.
  with claimed as (
    delete from public.invites where email = addr
    returning workspace_id, role
  )
  insert into public.workspace_members (workspace_id, user_id, role, full_name)
  select workspace_id, uid, role, name from claimed
  on conflict (workspace_id, user_id) do nothing;

  get diagnostics joined = row_count;
  return joined;
end;
$$;

revoke all on function public.accept_invites() from public, anon;
grant execute on function public.accept_invites() to authenticated;
