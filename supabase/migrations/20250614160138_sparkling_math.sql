/*
  # Create Demo Users and Skills

  1. New Data
    - Demo skills for testing the application
    - Demo user accounts (candidate and proctor) with hashed passwords
    
  2. Security
    - Uses proper bcrypt hashed passwords
    - Follows existing RLS policies
    
  3. Notes
    - Password for both demo accounts is 'password'
    - Uses DO blocks to prevent duplicate insertions
*/

-- Insert demo skills with existence checks
DO $$
BEGIN
  -- JavaScript Programming
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'JavaScript Programming') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('JavaScript Programming', 'Demonstrate your JavaScript coding abilities through practical examples');
  END IF;

  -- Public Speaking
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Public Speaking') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Public Speaking', 'Showcase your presentation and communication skills');
  END IF;

  -- Project Management
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Project Management') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Project Management', 'Display your ability to plan, execute, and deliver projects');
  END IF;

  -- Data Analysis
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Data Analysis') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Data Analysis', 'Show your analytical thinking and data interpretation skills');
  END IF;

  -- Customer Service
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Customer Service') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Customer Service', 'Demonstrate your interpersonal and problem-solving abilities');
  END IF;

  -- Digital Marketing
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Digital Marketing') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Digital Marketing', 'Present your marketing strategy and campaign development skills');
  END IF;
END $$;

-- Insert demo users with existence checks
-- Password hash is for 'password' using bcrypt with salt rounds 10: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
DO $$
BEGIN
  -- Demo Candidate
  IF NOT EXISTS (SELECT 1 FROM "public"."User" WHERE email = 'candidate@demo.com') THEN
    INSERT INTO "public"."User" (email, "firstName", "lastName", role, "passwordHash") VALUES
      ('candidate@demo.com', 'Demo', 'Candidate', 'candidate', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
  END IF;

  -- Demo Proctor
  IF NOT EXISTS (SELECT 1 FROM "public"."User" WHERE email = 'proctor@demo.com') THEN
    INSERT INTO "public"."User" (email, "firstName", "lastName", role, "passwordHash") VALUES
      ('proctor@demo.com', 'Demo', 'Proctor', 'proctor', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
  END IF;
END $$;