/*
  # Enable RLS and Create Comprehensive Security Policies

  1. Security Setup
    - Enable RLS on all tables
    - Create role-based access policies
    - Ensure data isolation between users

  2. Storage Setup
    - Create storage bucket for assessment videos
    - Set up storage policies for secure file access
*/

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProctorRequest" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own data" ON "public"."User";
DROP POLICY IF EXISTS "Users can update own data" ON "public"."User";
DROP POLICY IF EXISTS "Skills are readable by authenticated users" ON "public"."Skill";
DROP POLICY IF EXISTS "Candidates can read own assessments" ON "public"."Assessment";
DROP POLICY IF EXISTS "Proctors can read assessments for review" ON "public"."Assessment";
DROP POLICY IF EXISTS "Candidates can insert own assessments" ON "public"."Assessment";
DROP POLICY IF EXISTS "Candidates can update own assessments" ON "public"."Assessment";
DROP POLICY IF EXISTS "Proctors can update assessments for verification" ON "public"."Assessment";
DROP POLICY IF EXISTS "ProctorRequests are readable by authenticated users" ON "public"."ProctorRequest";
DROP POLICY IF EXISTS "ProctorRequests can be inserted by authenticated users" ON "public"."ProctorRequest";
DROP POLICY IF EXISTS "ProctorRequests can be updated by authenticated users" ON "public"."ProctorRequest";

-- User table policies
CREATE POLICY "Users can read own data"
  ON "public"."User"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON "public"."User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Skill table policies (readable by all authenticated users)
CREATE POLICY "Skills are readable by authenticated users"
  ON "public"."Skill"
  FOR SELECT
  TO authenticated
  USING (true);

-- Assessment table policies
CREATE POLICY "Candidates can read own assessments"
  ON "public"."Assessment"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "candidateId"::text);

CREATE POLICY "Proctors can read all assessments"
  ON "public"."Assessment"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'proctor'
    )
  );

CREATE POLICY "Candidates can insert own assessments"
  ON "public"."Assessment"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "candidateId"::text);

CREATE POLICY "Candidates can update own assessments"
  ON "public"."Assessment"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "candidateId"::text);

CREATE POLICY "Proctors can update assessments for verification"
  ON "public"."Assessment"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'proctor'
    )
  );

-- ProctorRequest table policies
CREATE POLICY "ProctorRequests are readable by authenticated users"
  ON "public"."ProctorRequest"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ProctorRequests can be inserted by authenticated users"
  ON "public"."ProctorRequest"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ProctorRequests can be updated by authenticated users"
  ON "public"."ProctorRequest"
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create storage bucket for assessment videos (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assessment-videos', 'assessment-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assessment videos
CREATE POLICY "Authenticated users can upload assessment videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assessment-videos');

CREATE POLICY "Authenticated users can view assessment videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'assessment-videos');

CREATE POLICY "Users can update their own assessment videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'assessment-videos' AND auth.uid()::text = owner::text);

CREATE POLICY "Users can delete their own assessment videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'assessment-videos' AND auth.uid()::text = owner::text);