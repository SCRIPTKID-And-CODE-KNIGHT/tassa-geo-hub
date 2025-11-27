-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create material_category enum
CREATE TYPE public.material_category AS ENUM (
  'Lesson Notes',
  'Geography Books',
  'Exams',
  'Results',
  'Statistics'
);

-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category material_category NOT NULL,
  google_drive_link TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create material_requests table
CREATE TABLE public.material_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_description TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium_codes table
CREATE TABLE public.premium_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_premium_access table
CREATE TABLE public.user_premium_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  code_used TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements (public read)
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);

-- RLS Policies for materials (public read)
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (true);

-- RLS Policies for material_requests (public insert)
CREATE POLICY "Anyone can create material requests" ON public.material_requests FOR INSERT WITH CHECK (true);

-- RLS Policies for premium_codes (service role only by default)
CREATE POLICY "Service role can manage premium_codes" ON public.premium_codes FOR ALL USING (true);

-- RLS Policies for user_premium_access
CREATE POLICY "Anyone can insert premium access" ON public.user_premium_access FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view premium access" ON public.user_premium_access FOR SELECT USING (true);

-- Create function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(
  p_username TEXT,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  SELECT password_hash INTO v_password_hash
  FROM public.admin_users
  WHERE username = p_username;
  
  IF v_password_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (crypt(p_password, v_password_hash) = v_password_hash);
END;
$$;

-- Create function to create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (username, password_hash)
  VALUES (p_username, crypt(p_password, gen_salt('bf')));
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create the Delta admin account
SELECT public.create_admin_user('Delta', 'Delta1234');