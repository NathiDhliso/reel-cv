/*
  # Fix signup database error

  1. Data Setup
    - Insert default 'candidate' role if it doesn't exist
    - Insert other required roles for the system
  
  2. Verification
    - Ensure the handle_new_user trigger can find the candidate role
    - Verify role_id foreign key constraint can be satisfied
*/

-- Insert default roles if they don't exist
INSERT INTO public.roles (name, description) VALUES 
  ('candidate', 'Default role for new users who take assessments'),
  ('proctor', 'Users who can verify and rate assessments'),
  ('recruiter', 'Users who can view verified assessments and hire candidates'),
  ('admin', 'System administrators with full access')
ON CONFLICT (name) DO NOTHING;

-- Verify the handle_new_user trigger function exists and works correctly
-- This function should create a User record when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  candidate_role_id uuid;
BEGIN
  -- Get the candidate role ID
  SELECT id INTO candidate_role_id 
  FROM public.roles 
  WHERE name = 'candidate';
  
  -- Insert the new user with the candidate role
  INSERT INTO public."User" (id, email, role_id)
  VALUES (new.id, new.email, candidate_role_id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();