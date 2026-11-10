-- v345 : 일반계정(role='user') 비밀번호를 숫자 4자리로 쓸 수 있게 한다.
--   · 일반계정 : 숫자 4자리, 또는 기존처럼 6자 이상 (이미 쓰던 비밀번호도 그대로 로그인 가능)
--   · 관리자/마스터 : 지금처럼 6자 이상만 허용
--   · Supabase 기본 비밀번호 변경(/auth/v1/user)은 6자 미만을 거부하므로,
--     일반계정 본인 변경은 새 RPC set_my_pin 으로 한다.
-- Supabase SQL Editor 에서 한 번만 실행하세요.

create or replace function public.mes_password_ok(p_role text, p_password text)
returns boolean language sql immutable as $$
  select case
    when coalesce(p_role,'user') in ('master','admin') then length(coalesce(p_password,'')) >= 6
    else coalesce(p_password,'') ~ '^[0-9]{4}$' or length(coalesce(p_password,'')) >= 6
  end;
$$;

CREATE OR REPLACE FUNCTION public.create_mes_user(p_name text, p_user_id text, p_password text, p_department_name text DEFAULT NULL::text, p_role text DEFAULT 'user'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare v_email text; v_uid uuid := gen_random_uuid(); v_key text; v_caller text;
begin
  select role into v_caller from users where auth_email = auth.jwt()->>'email';
  if coalesce(v_caller,'') not in ('master','admin') then
    raise exception '관리자 또는 마스터만 사용자를 등록할 수 있습니다.';
  end if;
  if p_role in ('master','admin') and v_caller <> 'master' then
    raise exception '관리자/마스터 계정 생성은 마스터만 가능합니다.';
  end if;
  if p_name is null or trim(p_name)='' then raise exception '이름은 필수입니다.'; end if;
  if p_user_id is null or trim(p_user_id)='' then raise exception '아이디는 필수입니다.'; end if;
  if not mes_password_ok(p_role, p_password) then
    if p_role in ('master','admin') then raise exception '관리자/마스터 비밀번호는 6자 이상이어야 합니다.';
    else raise exception '일반계정 비밀번호는 숫자 4자리(또는 6자 이상)여야 합니다.'; end if;
  end if;
  if exists (select 1 from users where name=trim(p_name) and auth_email is not null) then
    raise exception '같은 이름의 로그인 사용자가 이미 있습니다. (동명이인이면 아이디로 구분해 주세요)';
  end if;
  if exists (select 1 from users where user_id=trim(p_user_id)) then
    raise exception '이미 사용 중인 아이디입니다.';
  end if;

  v_email := lower(trim(p_user_id)) || '@dgmes.demo';
  v_key   := coalesce(nullif(trim(p_department_name),''),'00000') || '_' || trim(p_name);

  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
    confirmation_token,recovery_token,email_change,email_change_token_new,email_change_token_current)
  values ('00000000-0000-0000-0000-000000000000',v_uid,'authenticated','authenticated',
    v_email,crypt(p_password,gen_salt('bf')),now(),
    '{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','');
  insert into auth.identities (id,user_id,provider_id,identity_data,provider,created_at,updated_at,last_sign_in_at)
  values (gen_random_uuid(),v_uid,v_uid::text,
    jsonb_build_object('sub',v_uid::text,'email',v_email,'email_verified',true),'email',now(),now(),now());

  insert into users (user_key,user_id,name,department_name,factory,is_active,auth_email,role)
  values (v_key,trim(p_user_id),trim(p_name),nullif(trim(p_department_name),''),'1공장',true,v_email,
          case when p_role in ('master','admin') then p_role else 'user' end)
  on conflict (user_key) do update set user_id=excluded.user_id,auth_email=excluded.auth_email,role=excluded.role;

  insert into user_initial_passwords (user_id,temp_password,issued_by,changed_by_user)
  values (trim(p_user_id), p_password, auth.jwt()->>'email', false)
  on conflict (user_id) do update set temp_password=excluded.temp_password,
    issued_by=excluded.issued_by, issued_at=now(), changed_by_user=false;

  return v_email;
end $function$;

CREATE OR REPLACE FUNCTION public.reset_user_password(p_user_id text, p_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare v_email text; v_caller text; v_target_role text;
begin
  select role into v_caller from users where auth_email = auth.jwt()->>'email';
  if coalesce(v_caller,'') not in ('master','admin') then
    raise exception '관리자 또는 마스터만 비밀번호를 재설정할 수 있습니다.';
  end if;
  select auth_email, role into v_email, v_target_role from users where user_id=trim(p_user_id);
  if v_email is null then raise exception '해당 아이디의 로그인 사용자를 찾을 수 없습니다.'; end if;
  if v_target_role = 'master' and v_caller <> 'master' then
    raise exception '마스터 계정의 비밀번호는 마스터만 변경할 수 있습니다.';
  end if;
  if not mes_password_ok(v_target_role, p_password) then
    if v_target_role in ('master','admin') then raise exception '관리자/마스터 비밀번호는 6자 이상이어야 합니다.';
    else raise exception '일반계정 비밀번호는 숫자 4자리(또는 6자 이상)여야 합니다.'; end if;
  end if;
  update auth.users set encrypted_password=crypt(p_password,gen_salt('bf')), updated_at=now() where email=v_email;
  insert into user_initial_passwords (user_id,temp_password,issued_by,changed_by_user)
  values (trim(p_user_id), p_password, auth.jwt()->>'email', false)
  on conflict (user_id) do update set temp_password=excluded.temp_password,
    issued_by=excluded.issued_by, issued_at=now(), changed_by_user=false;
end $function$;

-- 일반계정 본인이 숫자 4자리 비밀번호로 바꾸는 RPC (관리자/마스터는 기존 비밀번호 변경을 사용)
CREATE OR REPLACE FUNCTION public.set_my_pin(p_pin text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare v_email text := auth.jwt()->>'email'; v_role text;
begin
  if v_email is null then raise exception '로그인이 필요합니다.'; end if;
  select role into v_role from users where auth_email = v_email;
  if coalesce(v_role,'user') in ('master','admin') then
    raise exception '관리자/마스터 계정은 숫자 4자리 비밀번호를 쓸 수 없습니다.';
  end if;
  if coalesce(p_pin,'') !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리여야 합니다.'; end if;
  update auth.users set encrypted_password=crypt(p_pin,gen_salt('bf')), updated_at=now() where email=v_email;
  update user_initial_passwords set changed_by_user = true
  where user_id = (select user_id from users where auth_email = v_email);
end $function$;
revoke execute on function public.set_my_pin(text) from public, anon;
grant  execute on function public.set_my_pin(text) to authenticated;

notify pgrst, 'reload schema';
