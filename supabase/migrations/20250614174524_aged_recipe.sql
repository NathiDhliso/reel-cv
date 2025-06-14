/*
  # Complete RBAC System Implementation

  1. Database Schema Changes
    - Create roles, permissions, and role_permissions tables
    - Add role_id to User table
    - Create permission checking functions
    - Update RLS policies to use new RBAC system

  2. Data Migration
    - Migrate existing role enum values to new system
    - Assign appropriate permissions to each role
    - Update existing users to use new role_id references

  3. Security
    - Enable RLS on all new tables
    - Create comprehensive permission-based policies
    - Add helper functions for permission checking
*/

-- Create the new RBAC tables (if they don't exist)
CREATE TABLE IF NOT EXISTS "public"."roles" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "public"."permissions" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text,
  "resource" text,
  "action" text,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
  "role_id" uuid NOT NULL REFERENCES "public"."roles"("id") ON DELETE CASCADE,
  "permission_id" uuid NOT NULL REFERENCES "public"."permissions"("id") ON DELETE CASCADE,
  "created_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("role_id", "permission_id")
);

-- Add role_id to User table (nullable initially for migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE "public"."User" ADD COLUMN "role_id" uuid REFERENCES "public"."roles"("id");
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for RBAC tables
DROP POLICY IF EXISTS "Roles are readable by authenticated users" ON "public"."roles";
CREATE POLICY "Roles are readable by authenticated users"
  ON "public"."roles"
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permissions are readable by authenticated users" ON "public"."permissions";
CREATE POLICY "Permissions are readable by authenticated users"
  ON "public"."permissions"
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Role permissions are readable by authenticated users" ON "public"."role_permissions";
CREATE POLICY "Role permissions are readable by authenticated users"
  ON "public"."role_permissions"
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial roles
INSERT INTO "public"."roles" (name, description) VALUES
  ('candidate', 'Job seekers who submit skill assessments'),
  ('proctor', 'Professional verifiers who review assessments'),
  ('recruiter', 'Talent acquisition specialists who view verified candidates'),
  ('admin', 'System administrators with full access')
ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive permissions
INSERT INTO "public"."permissions" (name, description, resource, action) VALUES
  ('assessment:create', 'Create new skill assessments', 'assessment', 'create'),
  ('assessment:read_own', 'Read own assessments', 'assessment', 'read'),
  ('assessment:update_own', 'Update own assessments', 'assessment', 'update'),
  ('assessment:verify', 'Verify and rate assessments', 'assessment', 'verify'),
  ('assessment:read_verified', 'Read all verified assessments', 'assessment', 'read_verified'),
  ('assessment:read_all', 'Read all assessments regardless of status', 'assessment', 'read_all'),
  ('user:read_own', 'Read own user profile', 'user', 'read'),
  ('user:update_own', 'Update own user profile', 'user', 'update'),
  ('user:read_all', 'Read all user profiles', 'user', 'read_all'),
  ('user:update_all', 'Update any user profile', 'user', 'update_all'),
  ('skill:read', 'Read available skills', 'skill', 'read'),
  ('skill:manage', 'Create and manage skills', 'skill', 'manage'),
  ('system:admin', 'Full system administration access', 'system', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Candidate Permissions
INSERT INTO "public"."role_permissions" (role_id, permission_id) VALUES
  ((SELECT id FROM roles WHERE name = 'candidate'), (SELECT id FROM permissions WHERE name = 'assessment:create')),
  ((SELECT id FROM roles WHERE name = 'candidate'), (SELECT id FROM permissions WHERE name = 'assessment:read_own')),
  ((SELECT id FROM roles WHERE name = 'candidate'), (SELECT id FROM permissions WHERE name = 'assessment:update_own')),
  ((SELECT id FROM roles WHERE name = 'candidate'), (SELECT id FROM permissions WHERE name = 'user:read_own')),
  ((SELECT id FROM roles WHERE name = 'candidate'), (SELECT id FROM permissions WHERE name = 'user:update_own')),
  ((SELECT id FROM roles WHERE name = 'candidate'), (SELECT id FROM permissions WHERE name = 'skill:read'))
ON CONFLICT DO NOTHING;

-- Proctor Permissions
INSERT INTO "public"."role_permissions" (role_id, permission_id) VALUES
  ((SELECT id FROM roles WHERE name = 'proctor'), (SELECT id FROM permissions WHERE name = 'assessment:verify')),
  ((SELECT id FROM roles WHERE name = 'proctor'), (SELECT id FROM permissions WHERE name = 'assessment:read_all')),
  ((SELECT id FROM roles WHERE name = 'proctor'), (SELECT id FROM permissions WHERE name = 'user:read_own')),
  ((SELECT id FROM roles WHERE name = 'proctor'), (SELECT id FROM permissions WHERE name = 'user:update_own')),
  ((SELECT id FROM roles WHERE name = 'proctor'), (SELECT id FROM permissions WHERE name = 'skill:read'))
ON CONFLICT DO NOTHING;

-- Recruiter Permissions
INSERT INTO "public"."role_permissions" (role_id, permission_id) VALUES
  ((SELECT id FROM roles WHERE name = 'recruiter'), (SELECT id FROM permissions WHERE name = 'assessment:read_verified')),
  ((SELECT id FROM roles WHERE name = 'recruiter'), (SELECT id FROM permissions WHERE name = 'user:read_own')),
  ((SELECT id FROM roles WHERE name = 'recruiter'), (SELECT id FROM permissions WHERE name = 'user:update_own')),
  ((SELECT id FROM roles WHERE name = 'recruiter'), (SELECT id FROM permissions WHERE name = 'skill:read'))
ON CONFLICT DO NOTHING;

-- Admin Permissions (all permissions)
INSERT INTO "public"."role_permissions" (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'admin'),
  p.id
FROM permissions p
ON CONFLICT DO NOTHING;

-- Migrate existing users to new role system
UPDATE "public"."User" 
SET role_id = (
  CASE 
    WHEN role = 'candidate' THEN (SELECT id FROM roles WHERE name = 'candidate')
    WHEN role = 'proctor' THEN (SELECT id FROM roles WHERE name = 'proctor')
    WHEN role = 'recruiter' THEN (SELECT id FROM roles WHERE name = 'recruiter')
    WHEN role = 'admin' THEN (SELECT id FROM roles WHERE name = 'admin')
    ELSE (SELECT id FROM roles WHERE name = 'candidate')
  END
)
WHERE role_id IS NULL;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id uuid)
RETURNS TABLE(permission_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name
  FROM "public"."User" u
  JOIN "public"."roles" r ON u.role_id = r.id
  JOIN "public"."role_permissions" rp ON r.id = rp.role_id
  JOIN "public"."permissions" p ON rp.permission_id = p.id
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permission
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_user_permissions(user_id) WHERE permission_name = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update User table policies to use new RBAC system
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";

CREATE POLICY "Users can read own data"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    has_permission(auth.uid(), 'user:read_all')
  );

CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    has_permission(auth.uid(), 'user:update_all')
  );

-- Update Assessment table policies
DROP POLICY IF EXISTS "Users can read assessments based on permissions" ON "Assessment";
DROP POLICY IF EXISTS "Users can insert assessments based on permissions" ON "Assessment";
DROP POLICY IF EXISTS "Users can update assessments based on permissions" ON "Assessment";

CREATE POLICY "Users can read assessments based on permissions"
  ON "Assessment"
  FOR SELECT
  TO authenticated
  USING (
    (has_permission(auth.uid(), 'assessment:read_own') AND auth.uid() = "candidateId") OR
    has_permission(auth.uid(), 'assessment:verify') OR
    (has_permission(auth.uid(), 'assessment:read_verified') AND status = 'proctor_verified') OR
    has_permission(auth.uid(), 'assessment:read_all')
  );

CREATE POLICY "Users can insert assessments based on permissions"
  ON "Assessment"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_permission(auth.uid(), 'assessment:create') AND auth.uid() = "candidateId"
  );

CREATE POLICY "Users can update assessments based on permissions"
  ON "Assessment"
  FOR UPDATE
  TO authenticated
  USING (
    (has_permission(auth.uid(), 'assessment:update_own') AND auth.uid() = "candidateId") OR
    has_permission(auth.uid(), 'assessment:verify') OR
    has_permission(auth.uid(), 'assessment:read_all')
  );

-- Update trigger function to use new role system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, "firstName", "lastName", role, role_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'candidate')::public."Role",
    (SELECT id FROM roles WHERE name = COALESCE(new.raw_user_meta_data->>'role', 'candidate'))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;