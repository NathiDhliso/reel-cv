/*
  # Fix User Sync and Foreign Key Constraints

  1. Database Changes
    - Create trigger to automatically sync Supabase Auth users to User table
    - Add function to handle user creation on signup
    - Ensure proper foreign key relationships

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, "firstName", "lastName", role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'candidate')::public."Role"
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create User record when auth.users record is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert existing auth users into User table if they don't exist
INSERT INTO public."User" (id, email, "firstName", "lastName", role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'firstName', au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'lastName', au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'candidate')::public."Role"
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public."User" u WHERE u.id = au.id
);