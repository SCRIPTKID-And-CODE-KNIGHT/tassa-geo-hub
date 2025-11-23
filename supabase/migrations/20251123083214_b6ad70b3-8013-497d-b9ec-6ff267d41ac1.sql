-- Delete the old admin user with the fake bcrypt hash
DELETE FROM public.admin_users WHERE username = 'admin';

-- Note: After this migration, you'll need to create a new admin user
-- You can do this through the CreateAdminDialog component in your app
-- The new admin will have a proper bcrypt hash