-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Delete existing admin user and recreate with proper hashing
DELETE FROM admin_users WHERE username = 'Delta';

-- Insert admin user with properly hashed password
INSERT INTO admin_users (username, password_hash)
VALUES ('Delta', crypt('Delta1234', gen_salt('bf')));