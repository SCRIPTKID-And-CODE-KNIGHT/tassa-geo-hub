-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin account with username 'Delta' and password 'Delta1234'
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('Delta', crypt('Delta1234', gen_salt('bf')))