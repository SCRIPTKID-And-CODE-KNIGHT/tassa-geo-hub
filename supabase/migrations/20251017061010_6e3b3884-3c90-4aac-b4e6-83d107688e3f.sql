-- Add used_by column to premium_codes to track single-use codes
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS used_by text;
ALTER TABLE premium_codes ADD COLUMN IF NOT EXISTS used_at timestamp with time zone;

-- Remove the unique constraint on material_id since we want multiple codes per material
-- (This allows multiple codes for the same material)