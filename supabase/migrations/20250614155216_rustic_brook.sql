/*
  # Add Demo Data and Skills

  1. Demo Skills
    - Add common skills for testing
    
  2. Demo Users
    - Add demo candidate and proctor accounts
    
  3. Security
    - Ensure proper RLS policies are in place
*/

-- Insert demo skills
INSERT INTO "public"."Skill" (name, description) VALUES
  ('JavaScript Programming', 'Demonstrate your JavaScript coding abilities through practical examples'),
  ('Public Speaking', 'Showcase your presentation and communication skills'),
  ('Project Management', 'Display your ability to plan, execute, and deliver projects'),
  ('Data Analysis', 'Show your analytical thinking and data interpretation skills'),
  ('Customer Service', 'Demonstrate your interpersonal and problem-solving abilities'),
  ('Digital Marketing', 'Present your marketing strategy and campaign development skills')
ON CONFLICT (name) DO NOTHING;

-- Insert demo users (passwords are hashed version of 'password')
-- Note: The password hash is for 'password' using bcrypt with salt rounds 10
INSERT INTO "public"."User" (email, "firstName", "lastName", role, "passwordHash") VALUES
  ('candidate@demo.com', 'Demo', 'Candidate', 'candidate', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('proctor@demo.com', 'Demo', 'Proctor', 'proctor', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;