/*
  # Add Proctoring Features to ReelCV

  1. New Columns
    - Add proctor-related fields to User table (proctorStatus, companyName, yearsExperience, created_at)
    - Add proctorId and created_at to Assessment table

  2. New Tables
    - `ProctorRequest` table for tracking verification jobs

  3. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access control
*/

-- Add proctor-related fields to User table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'proctorStatus'
  ) THEN
    ALTER TABLE "public"."User"
    ADD COLUMN "proctorStatus" "public"."ProctorStatus" DEFAULT 'pending'::"public"."ProctorStatus";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'companyName'
  ) THEN
    ALTER TABLE "public"."User"
    ADD COLUMN "companyName" text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'yearsExperience'
  ) THEN
    ALTER TABLE "public"."User"
    ADD COLUMN "yearsExperience" integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "public"."User"
    ADD COLUMN "created_at" timestamptz DEFAULT now();
  END IF;
END $$;

-- Add proctorId and created_at to Assessment table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Assessment' AND column_name = 'proctorId'
  ) THEN
    ALTER TABLE "public"."Assessment"
    ADD COLUMN "proctorId" uuid REFERENCES "public"."User"("id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Assessment' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "public"."Assessment"
    ADD COLUMN "created_at" timestamptz DEFAULT now();
  END IF;
END $$;

-- Create ProctorRequest table
CREATE TABLE IF NOT EXISTS "public"."ProctorRequest" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "assessmentId" uuid NOT NULL REFERENCES "public"."Assessment"("id") ON DELETE CASCADE,
    "proctorId" uuid REFERENCES "public"."User"("id") ON DELETE SET NULL,
    "status" text DEFAULT 'pending'::text,
    "created_at" timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProctorRequest" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
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

-- RLS Policies for User table
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

-- RLS Policies for Skill table (readable by all authenticated users)
CREATE POLICY "Skills are readable by authenticated users"
  ON "public"."Skill"
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for Assessment table
CREATE POLICY "Candidates can read own assessments"
  ON "public"."Assessment"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "candidateId"::text);

CREATE POLICY "Proctors can read assessments for review"
  ON "public"."Assessment"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."User"
      WHERE id = auth.uid() AND role = 'proctor'
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
      SELECT 1 FROM "public"."User"
      WHERE id = auth.uid() AND role = 'proctor'
    )
  );

-- RLS Policies for ProctorRequest table
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