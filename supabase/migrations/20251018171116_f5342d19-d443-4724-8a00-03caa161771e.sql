-- Add user_id column to material_requests table
ALTER TABLE public.material_requests 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view their own requests" ON public.material_requests;

-- Create a new SELECT policy that restricts access to only the user's own requests
CREATE POLICY "Users can only view their own requests"
ON public.material_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update the INSERT policy to ensure user_id is set correctly
DROP POLICY IF EXISTS "Anyone can submit material requests" ON public.material_requests;

CREATE POLICY "Users can submit their own material requests"
ON public.material_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);