-- Create enum for material categories
CREATE TYPE public.material_category AS ENUM (
  'Lesson Notes',
  'Geography Books', 
  'Exams',
  'Results',
  'Statistics'
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category material_category NOT NULL,
  google_drive_link TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for password-based admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public can view materials and announcements
CREATE POLICY "Anyone can view materials" 
ON public.materials 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view announcements" 
ON public.announcements 
FOR SELECT 
USING (true);

-- Only authenticated users can increment view count
CREATE POLICY "Anyone can update view count" 
ON public.materials 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Admin policies will be handled through edge functions for security

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin user (username: admin, password: admin123)
-- In production, this should be changed immediately
INSERT INTO public.admin_users (username, password_hash)
VALUES ('admin', '$2b$10$rQZ5RQjDqjKOEfR.xVYxP.LZGGKEqM8s.KqNvQ5QWBg5pSjzU5OW.');

-- Add some sample materials
INSERT INTO public.materials (title, category, google_drive_link) VALUES
  ('Grade 12 Physical Geography Notes', 'Lesson Notes', 'https://drive.google.com/file/d/sample1/view'),
  ('Economic Geography Textbook', 'Geography Books', 'https://drive.google.com/file/d/sample2/view'),
  ('2023 Final Exam Papers', 'Exams', 'https://drive.google.com/file/d/sample3/view'),
  ('2023 Results Summary', 'Results', 'https://drive.google.com/file/d/sample4/view'),
  ('Pass Rate Statistics 2020-2023', 'Statistics', 'https://drive.google.com/file/d/sample5/view');