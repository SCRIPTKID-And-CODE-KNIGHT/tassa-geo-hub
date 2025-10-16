-- Add is_premium column to materials table
ALTER TABLE public.materials
ADD COLUMN is_premium boolean NOT NULL DEFAULT false;

-- Create premium_codes table to store access codes for premium materials
CREATE TABLE public.premium_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_premium_access table to track which users have accessed which premium materials
CREATE TABLE public.user_premium_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  code_used text NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Enable RLS on new tables
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for premium_codes (only visible through admin functions)
CREATE POLICY "Premium codes are not publicly visible"
ON public.premium_codes
FOR SELECT
USING (false);

-- RLS policies for user_premium_access
CREATE POLICY "Users can view their own premium access"
ON public.user_premium_access
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own premium access"
ON public.user_premium_access
FOR INSERT
WITH CHECK (true);

-- Update materials RLS to allow viewing non-premium materials
-- Premium materials will be handled through the application logic
CREATE POLICY "Anyone can view non-premium materials"
ON public.materials
FOR SELECT
USING (NOT is_premium OR is_premium = false);

-- Create trigger for premium_codes updated_at
CREATE TRIGGER update_premium_codes_updated_at
BEFORE UPDATE ON public.premium_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();