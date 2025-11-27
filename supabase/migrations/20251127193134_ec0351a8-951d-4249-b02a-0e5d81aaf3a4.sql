-- Recreate the verify_admin_password function to use pgcrypto
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_password_hash TEXT;
BEGIN
  SELECT password_hash INTO v_password_hash
  FROM public.admin_users
  WHERE username = p_username;
  
  IF v_password_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (extensions.crypt(p_password, v_password_hash) = v_password_hash);
END;
$function$;

-- Recreate the create_admin_user function to use pgcrypto
CREATE OR REPLACE FUNCTION public.create_admin_user(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  INSERT INTO public.admin_users (username, password_hash)
  VALUES (p_username, extensions.crypt(p_password, extensions.gen_salt('bf')));
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;