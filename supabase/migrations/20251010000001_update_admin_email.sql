-- Update Admin Email Documentation
-- This migration updates the documentation for the admin user
-- The actual auth.users email is caspere63@gmail.com (ID: e4ea078b-30b2-4347-801f-6d26a87318b6)
-- This migration ensures the admin_users table has correct documentation

-- Update admin_users notes to reflect correct email
UPDATE public.admin_users
SET notes = 'Superadmin - Email: caspere63@gmail.com (ID: e4ea078b-30b2-4347-801f-6d26a87318b6)'
WHERE id = 'e4ea078b-30b2-4347-801f-6d26a87318b6';

-- Add comment for clarity
COMMENT ON TABLE public.admin_users IS 'Manages admin access and permissions. Primary admin: caspere63@gmail.com (ID: e4ea078b-30b2-4347-801f-6d26a87318b6)';
