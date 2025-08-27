-- Adds manual capacity fields on Clients table.
-- Run this migration in your DB (e.g., Supabase/psql).
ALTER TABLE public."Clients"
  ADD COLUMN IF NOT EXISTS personal_sending_capacity_per_day integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS work_sending_capacity_per_day integer NOT NULL DEFAULT 100;

-- Optional: basic non-negative check constraints
-- ALTER TABLE public."Clients"
--   ADD CONSTRAINT clients_personal_capacity_nonneg CHECK (personal_sending_capacity_per_day IS NULL OR personal_sending_capacity_per_day >= 0),
--   ADD CONSTRAINT clients_work_capacity_nonneg CHECK (work_sending_capacity_per_day IS NULL OR work_sending_capacity_per_day >= 0);


