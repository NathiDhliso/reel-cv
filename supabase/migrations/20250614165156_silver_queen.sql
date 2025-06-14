/*
  # Fix RLS Policies and Security Setup

  1. Security
    - Enable RLS on all tables
    - Create proper policies for data access
    - Set up storage bucket and policies
    - Use User table role column instead of auth metadata

  2. Changes
    - Fixed user role checking to use User table
    - Proper RLS policies for all tables
    - Storage bucket configuration
    - Assessment video access controls
*/

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProctorRequest" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Skills are readable by authenticated users" ON "Skill";
DROP POLICY IF EXISTS "Candidates can read own assessments" ON "Assessment";
DROP POLICY IF EXISTS "Candidates can insert own assessments" ON "Assessment";
DROP POLICY IF EXISTS "Candidates can update own assessments" ON "Assessment";
DROP POLICY IF EXISTS "Proctors can read assessments for review" ON "Assessment";
DROP POLICY IF EXISTS "Proctors can update assessments for verification" ON "Assessment";
DROP POLICY IF EXISTS "ProctorRequests are readable by authenticated users" ON "ProctorRequest";
DROP POLICY IF EXISTS "ProctorRequests can be inserted by authenticated users" ON "ProctorRequest";
DROP POLICY IF EXISTS "ProctorRequests can be updated by authenticated users" ON "ProctorRequest";

-- User table policies
CREATE POLICY "Users can read own data"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Skill table policies (readable by all authenticated users)
CREATE POLICY "Skills are readable by authenticated users"
  ON "Skill"
  FOR SELECT
  TO authenticated
  USING (true);

-- Assessment table policies
CREATE POLICY "Candidates can read own assessments"
  ON "Assessment"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "candidateId");

CREATE POLICY "Proctors can read assessments for review"
  ON "Assessment"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role = 'proctor'
    )
  );

CREATE POLICY "Candidates can insert own assessments"
  ON "Assessment"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "candidateId");

CREATE POLICY "Candidates can update own assessments"
  ON "Assessment"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "candidateId");

CREATE POLICY "Proctors can update assessments for verification"
  ON "Assessment"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role = 'proctor'
    )
  );

-- ProctorRequest table policies
CREATE POLICY "ProctorRequests are readable by authenticated users"
  ON "ProctorRequest"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ProctorRequests can be inserted by authenticated users"
  ON "ProctorRequest"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ProctorRequests can be updated by authenticated users"
  ON "ProctorRequest"
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create storage bucket for assessment videos (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assessment-videos', 'assessment-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assessment videos
DROP POLICY IF EXISTS "Authenticated users can upload assessment videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view assessment videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assessment videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assessment videos" ON storage.objects;

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
  USING (bucket_id = 'assessment-videos' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own assessment videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'assessment-videos' AND auth.uid() = owner);