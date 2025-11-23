-- Create function to verify admin password using pgcrypto
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
  -- Get the password hash for the username
  SELECT password_hash INTO v_password_hash
  FROM public.admin_users
  WHERE username = p_username;
  
  -- If user not found, return false
  IF v_password_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Compare password using crypt
  RETURN (crypt(p_password, v_password_hash) = v_password_hash);
END;
$$;

-- Create function to create admin user with hashed password
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