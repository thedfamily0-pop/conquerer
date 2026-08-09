-- Parent-managed LLM provider and Nomi style configuration.
-- Provider keys are stored only in Supabase Vault and are never returned to browser clients.

begin;

create table if not exists public.family_llm_provider_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  provider text not null default 'gemini' check (provider in ('gemini', 'openai', 'claude')),
  model text,
  system_prompt text not null default '',
  api_key_secret_id uuid references vault.secrets(id) on delete set null,
  updated_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (model is null or model ~ '^[A-Za-z0-9._:-]{1,100}$'),
  check (char_length(system_prompt) <= 2000)
);

alter table public.family_llm_provider_settings enable row level security;
revoke all on table public.family_llm_provider_settings from anon, authenticated;

create or replace function public.get_my_family_llm_provider_settings()
returns table (
  provider text,
  model text,
  system_prompt text,
  api_key_configured boolean,
  updated_at timestamptz
)
language plpgsql security definer set search_path = public
as $$
declare
  v_family uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_members
    where user_id = auth.uid() and role = 'parent' limit 1;
  if v_family is null then raise exception 'Parent access required'; end if;

  return query
    select coalesce(s.provider, 'gemini'), s.model, coalesce(s.system_prompt, ''),
      s.api_key_secret_id is not null, s.updated_at
    from (select v_family as family_id) f
    left join public.family_llm_provider_settings s on s.family_id = f.family_id;
end;
$$;

create or replace function public.save_my_family_llm_provider_settings(
  p_provider text,
  p_model text default null,
  p_system_prompt text default '',
  p_api_key text default null
)
returns table (
  provider text,
  model text,
  system_prompt text,
  api_key_configured boolean,
  updated_at timestamptz
)
language plpgsql security definer set search_path = public, vault
as $$
declare
  v_family uuid;
  v_secret_id uuid;
  v_provider text := lower(trim(coalesce(p_provider, '')));
  v_model text := nullif(trim(coalesce(p_model, '')), '');
  v_prompt text := trim(coalesce(p_system_prompt, ''));
  v_key text := nullif(trim(coalesce(p_api_key, '')), '');
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select family_id into v_family from public.family_members
    where user_id = auth.uid() and role = 'parent' limit 1;
  if v_family is null then raise exception 'Parent access required'; end if;
  if v_provider not in ('gemini', 'openai', 'claude') then raise exception 'Choose Gemini, OpenAI, or Claude'; end if;
  if v_model is not null and v_model !~ '^[A-Za-z0-9._:-]{1,100}$' then raise exception 'Model name is not valid'; end if;
  if char_length(v_prompt) > 2000 then raise exception 'Personality prompt must be 2,000 characters or fewer'; end if;

  select api_key_secret_id into v_secret_id
    from public.family_llm_provider_settings where family_id = v_family;
  if v_key is not null then
    if v_secret_id is null then
      select vault.create_secret(v_key, 'family-llm-provider-' || v_family::text, 'Parent-managed LLM provider key') into v_secret_id;
    else
      perform vault.update_secret(v_secret_id, v_key, 'family-llm-provider-' || v_family::text, 'Parent-managed LLM provider key');
    end if;
  end if;
  if v_provider in ('openai', 'claude') and v_secret_id is null then
    raise exception 'A provider key is required for the selected provider';
  end if;

  insert into public.family_llm_provider_settings (
    family_id, provider, model, system_prompt, api_key_secret_id, updated_by_user_id
  ) values (
    v_family, v_provider, v_model, v_prompt, v_secret_id, auth.uid()
  ) on conflict (family_id) do update set
    provider = excluded.provider,
    model = excluded.model,
    system_prompt = excluded.system_prompt,
    api_key_secret_id = excluded.api_key_secret_id,
    updated_by_user_id = excluded.updated_by_user_id,
    updated_at = now();

  return query select s.provider, s.model, s.system_prompt, s.api_key_secret_id is not null, s.updated_at
    from public.family_llm_provider_settings s where s.family_id = v_family;
end;
$$;

-- This RPC is service-role-only and exists solely for the protected AI Edge
-- Function. It is never granted to browser roles and is the only code path
-- that can read the decrypted provider key.
create or replace function public.get_family_llm_provider_runtime(p_family_id uuid)
returns table (
  provider text,
  model text,
  system_prompt text,
  api_key text
)
language sql security definer set search_path = public, vault
as $$
  select coalesce(s.provider, 'gemini'), s.model, coalesce(s.system_prompt, ''), d.decrypted_secret
  from (select p_family_id as family_id) f
  left join public.family_llm_provider_settings s on s.family_id = f.family_id
  left join vault.decrypted_secrets d on d.id = s.api_key_secret_id
$$;

revoke all on function public.get_my_family_llm_provider_settings() from public;
revoke all on function public.save_my_family_llm_provider_settings(text, text, text, text) from public;
revoke all on function public.get_family_llm_provider_runtime(uuid) from public;
grant execute on function public.get_my_family_llm_provider_settings() to authenticated;
grant execute on function public.save_my_family_llm_provider_settings(text, text, text, text) to authenticated;
grant execute on function public.get_family_llm_provider_runtime(uuid) to service_role;

commit;
