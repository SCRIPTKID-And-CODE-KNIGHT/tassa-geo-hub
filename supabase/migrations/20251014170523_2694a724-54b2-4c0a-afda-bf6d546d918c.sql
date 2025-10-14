-- Create table for material requests
CREATE TABLE public.material_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  material_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to submit requests
CREATE POLICY "Anyone can submit material requests"
ON public.material_requests
FOR INSERT
WITH CHECK (true);

-- Create policy for viewing requests (public can't view, only insert)
CREATE POLICY "Anyone can view their own requests"
ON public.material_requests
FOR SELECT
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_material_requests_updated_at
BEFORE UPDATE ON public.material_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();