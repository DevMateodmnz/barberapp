-- ============================================
-- PHASE 5 AUTH ROBUSTNESS MIGRATION
-- Date: 2026-04-24
-- ============================================

BEGIN;

-- 1) Create profile row automatically from auth.users inserts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
BEGIN
  requested_role := lower(coalesce(NEW.raw_user_meta_data->>'role', 'client'));

  IF requested_role NOT IN ('owner', 'barber', 'client') THEN
    requested_role := 'client';
  END IF;

  INSERT INTO public.users (
    id,
    email,
    role,
    display_name
  )
  VALUES (
    NEW.id,
    lower(coalesce(NEW.email, '')),
    requested_role,
    nullif(trim(coalesce(NEW.raw_user_meta_data->>'display_name', '')), '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    display_name = coalesce(EXCLUDED.display_name, public.users.display_name),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) Backfill missing public.users profiles for existing auth users
INSERT INTO public.users (id, email, role, display_name)
SELECT
  au.id,
  lower(coalesce(au.email, '')),
  CASE
    WHEN lower(coalesce(au.raw_user_meta_data->>'role', 'client')) IN ('owner', 'barber', 'client')
      THEN lower(au.raw_user_meta_data->>'role')
    ELSE 'client'
  END,
  nullif(trim(coalesce(au.raw_user_meta_data->>'display_name', '')), '')
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- 3) Disallow direct client-side inserts into public.users
DROP POLICY IF EXISTS "Users can insert on signup" ON public.users;

COMMIT;
