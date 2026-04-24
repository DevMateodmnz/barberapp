-- ============================================
-- PHASE 3 SECURITY HARDENING MIGRATION
-- Date: 2026-04-24
-- ============================================

BEGIN;

-- 1) Strengthen client identity linkage
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Optional best-effort backfill using email match
UPDATE public.clients c
SET user_id = u.id
FROM public.users u
WHERE c.user_id IS NULL
  AND c.email IS NOT NULL
  AND lower(trim(c.email)) = lower(trim(u.email));

-- Keep this unique only for authenticated links
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_barbershop_user_unique
  ON public.clients(barbershop_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_user ON public.clients(user_id);

-- 2) Replace phone-based appointment access policy
DROP POLICY IF EXISTS "Clients see their appointments" ON public.appointments;
CREATE POLICY "Clients see their appointments" ON public.appointments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- 3) Allow clients to read their own profile rows
DROP POLICY IF EXISTS "Clients can read own profiles" ON public.clients;
CREATE POLICY "Clients can read own profiles" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

COMMIT;
