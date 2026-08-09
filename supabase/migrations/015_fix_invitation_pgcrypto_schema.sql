-- pgcrypto lives in Supabase's extensions schema. The invitation RPCs run with
-- search_path = public, so every pgcrypto call must be explicitly qualified.
-- This keeps token generation, hashing, and later redemption available without
-- widening the security-definer search path.

begin;

create or replace function public.create_family_invitation(
  p_email text,
  p_display_name text,
  p_role text
)
returns table (invitation_id uuid, invitation_token text, invitation_expires_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := left(trim(coalesce(p_display_name, '')), 80);
  v_token text;
  v_id uuid;
  v_expires_at timestamptz := now() + interval '7 days';
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_administrators where user_id = auth.uid() limit 1;
  if v_family is null then raise exception 'Family administrator access required'; end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'A valid invitation email is required'; end if;
  if v_name = '' then raise exception 'An invitee name is required'; end if;
  if p_role not in ('parent', 'child') then raise exception 'Invitation role must be parent or child'; end if;
  if exists (select 1 from public.family_invitations where family_id = v_family and invited_email = v_email and status = 'accepted') then
    raise exception 'This email has already accepted a family invitation';
  end if;
  if p_role = 'child' and exists (
    select 1 from public.profiles where family_id = v_family and role = 'child' and user_id is not null
  ) then
    raise exception 'This family already has a linked child profile';
  end if;
  if p_role = 'child' and exists (
    select 1 from public.family_invitations
    where family_id = v_family and role = 'child' and status = 'pending' and expires_at > now() and invited_email <> v_email
  ) then
    raise exception 'A child invitation is already pending for this family';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.family_invitations (
    family_id, invited_email, display_name, role, token_hash, status, expires_at,
    accepted_at, accepted_user_id, revoked_at, sent_at, delivery_error, updated_at
  ) values (
    v_family, v_email, v_name, p_role, encode(extensions.digest(v_token, 'sha256'), 'hex'), 'pending', v_expires_at,
    null, null, null, null, null, now()
  )
  on conflict (family_id, invited_email) do update set
    display_name = excluded.display_name,
    role = excluded.role,
    token_hash = excluded.token_hash,
    status = 'pending',
    expires_at = excluded.expires_at,
    accepted_at = null,
    accepted_user_id = null,
    revoked_at = null,
    sent_at = null,
    delivery_error = null,
    updated_at = now()
  where public.family_invitations.status <> 'accepted'
  returning id into v_id;

  if v_id is null then raise exception 'This invitation cannot be replaced'; end if;
  return query select v_id, v_token, v_expires_at;
end;
$$;

revoke all on function public.create_family_invitation(text, text, text) from public;
grant execute on function public.create_family_invitation(text, text, text) to authenticated;

create or replace function public.redeem_family_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_provider text := coalesce(auth.jwt() -> 'app_metadata' ->> 'provider', '');
  v_invitation public.family_invitations%rowtype;
  v_child uuid;
  v_existing_family uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_provider <> 'google' then raise exception 'Google sign-in is required to accept a family invitation'; end if;
  if v_email = '' then raise exception 'Google account email is unavailable'; end if;
  if coalesce(length(p_token), 0) < 32 then raise exception 'The invitation link is invalid'; end if;

  select * into v_invitation
  from public.family_invitations
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;
  if not found then raise exception 'The invitation link is invalid or has already been replaced'; end if;
  if v_invitation.status = 'revoked' then raise exception 'This invitation has been revoked'; end if;
  if v_invitation.status = 'accepted' then
    if v_invitation.accepted_user_id = v_user then return v_invitation.family_id; end if;
    raise exception 'This invitation has already been accepted';
  end if;
  if v_invitation.expires_at <= now() then raise exception 'This invitation has expired'; end if;
  if v_invitation.invited_email <> v_email then raise exception 'Sign in with the Google account that received this invitation'; end if;

  select family_id into v_existing_family from public.family_members where user_id = v_user limit 1;
  if v_existing_family is not null then
    if v_existing_family = v_invitation.family_id then return v_existing_family; end if;
    raise exception 'This Google account already belongs to another family';
  end if;

  if v_invitation.role = 'child' then
    select id into v_child from public.profiles where family_id = v_invitation.family_id and role = 'child' limit 1;
    if v_child is not null and exists (select 1 from public.profiles where id = v_child and user_id is not null and user_id <> v_user) then
      raise exception 'This family already has a linked child profile';
    end if;
  end if;

  insert into public.family_members (family_id, user_id, role)
    values (v_invitation.family_id, v_user, v_invitation.role);

  if v_invitation.role = 'child' then
    if v_child is null then
      insert into public.profiles (user_id, family_id, role, display_name)
        values (v_user, v_invitation.family_id, 'child', v_invitation.display_name);
    else
      update public.profiles
        set user_id = v_user, display_name = v_invitation.display_name, updated_at = now()
        where id = v_child and user_id is null;
    end if;
  else
    insert into public.profiles (user_id, family_id, role, display_name)
      values (v_user, v_invitation.family_id, 'parent', v_invitation.display_name)
      on conflict (user_id) do update set family_id = excluded.family_id, role = excluded.role, display_name = excluded.display_name, updated_at = now();
  end if;

  update public.family_invitations
    set status = 'accepted', accepted_at = now(), accepted_user_id = v_user, updated_at = now()
    where id = v_invitation.id;
  return v_invitation.family_id;
end;
$$;

revoke all on function public.redeem_family_invitation(text) from public;
grant execute on function public.redeem_family_invitation(text) to authenticated;

commit;
