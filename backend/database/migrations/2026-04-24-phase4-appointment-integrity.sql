-- ============================================
-- PHASE 4 APPOINTMENT INTEGRITY MIGRATION
-- Date: 2026-04-24
-- ============================================

BEGIN;

-- 1) Pre-flight data validation (fail fast with clear messages)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.services
    WHERE barbershop_id IS NULL
  ) THEN
    RAISE EXCEPTION 'services has rows with NULL barbershop_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.employees
    WHERE barbershop_id IS NULL OR user_id IS NULL
  ) THEN
    RAISE EXCEPTION 'employees has rows with NULL barbershop_id or user_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.clients
    WHERE barbershop_id IS NULL
  ) THEN
    RAISE EXCEPTION 'clients has rows with NULL barbershop_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE barbershop_id IS NULL
       OR service_id IS NULL
       OR employee_id IS NULL
       OR client_id IS NULL
  ) THEN
    RAISE EXCEPTION 'appointments has NULL reference fields';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE starts_at >= ends_at
  ) THEN
    RAISE EXCEPTION 'appointments has invalid time ranges (starts_at >= ends_at)';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    LEFT JOIN public.services s ON s.id = a.service_id
    WHERE s.id IS NULL OR s.barbershop_id <> a.barbershop_id
  ) THEN
    RAISE EXCEPTION 'appointments has service references outside appointment barbershop';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    LEFT JOIN public.employees e ON e.id = a.employee_id
    WHERE e.id IS NULL OR e.barbershop_id <> a.barbershop_id
  ) THEN
    RAISE EXCEPTION 'appointments has employee references outside appointment barbershop';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    LEFT JOIN public.clients c ON c.id = a.client_id
    WHERE c.id IS NULL OR c.barbershop_id <> a.barbershop_id
  ) THEN
    RAISE EXCEPTION 'appointments has client references outside appointment barbershop';
  END IF;
END;
$$;

-- 2) Enforce NOT NULL on relational fields
ALTER TABLE public.services ALTER COLUMN barbershop_id SET NOT NULL;
ALTER TABLE public.employees ALTER COLUMN barbershop_id SET NOT NULL;
ALTER TABLE public.employees ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.clients ALTER COLUMN barbershop_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN barbershop_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN service_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN employee_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN client_id SET NOT NULL;

-- 3) Ensure composite uniqueness for cross-table FKs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'services_id_barbershop_unique'
      AND conrelid = 'public.services'::regclass
  ) THEN
    ALTER TABLE public.services
      ADD CONSTRAINT services_id_barbershop_unique UNIQUE (id, barbershop_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'employees_id_barbershop_unique'
      AND conrelid = 'public.employees'::regclass
  ) THEN
    ALTER TABLE public.employees
      ADD CONSTRAINT employees_id_barbershop_unique UNIQUE (id, barbershop_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clients_id_barbershop_unique'
      AND conrelid = 'public.clients'::regclass
  ) THEN
    ALTER TABLE public.clients
      ADD CONSTRAINT clients_id_barbershop_unique UNIQUE (id, barbershop_id);
  END IF;
END;
$$;

-- 4) Time-range check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointments_time_range_chk'
      AND conrelid = 'public.appointments'::regclass
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_time_range_chk CHECK (starts_at < ends_at) NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.appointments VALIDATE CONSTRAINT appointments_time_range_chk;

-- 5) Cross-barbershop integrity via composite FKs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointments_service_barbershop_fk'
      AND conrelid = 'public.appointments'::regclass
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_service_barbershop_fk
      FOREIGN KEY (service_id, barbershop_id)
      REFERENCES public.services(id, barbershop_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointments_employee_barbershop_fk'
      AND conrelid = 'public.appointments'::regclass
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_employee_barbershop_fk
      FOREIGN KEY (employee_id, barbershop_id)
      REFERENCES public.employees(id, barbershop_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointments_client_barbershop_fk'
      AND conrelid = 'public.appointments'::regclass
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_client_barbershop_fk
      FOREIGN KEY (client_id, barbershop_id)
      REFERENCES public.clients(id, barbershop_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.appointments VALIDATE CONSTRAINT appointments_service_barbershop_fk;
ALTER TABLE public.appointments VALIDATE CONSTRAINT appointments_employee_barbershop_fk;
ALTER TABLE public.appointments VALIDATE CONSTRAINT appointments_client_barbershop_fk;

COMMIT;
