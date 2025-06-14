/*
  # Add Sample Skills for ReelCV Platform

  1. New Data
    - Add comprehensive list of skills across different categories
    - Include technical, soft skills, and industry-specific competencies
    - Provide meaningful descriptions for each skill

  2. Categories Covered
    - Programming & Development
    - Communication & Leadership
    - Business & Management
    - Creative & Design
    - Data & Analytics
    - Customer Relations
*/

-- Insert sample skills with existence checks to prevent duplicates
DO $$
BEGIN
  -- Programming & Development Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'JavaScript Programming') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('JavaScript Programming', 'Demonstrate your JavaScript coding abilities through practical examples and problem-solving');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Python Development') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Python Development', 'Show your Python programming skills and ability to build applications');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'React Development') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('React Development', 'Display your expertise in building modern React applications');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Database Design') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Database Design', 'Showcase your ability to design and optimize database structures');
  END IF;

  -- Communication & Leadership Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Public Speaking') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Public Speaking', 'Showcase your presentation and communication skills in front of an audience');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Team Leadership') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Team Leadership', 'Demonstrate your ability to lead, motivate, and guide team members');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Conflict Resolution') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Conflict Resolution', 'Show your skills in mediating disputes and finding collaborative solutions');
  END IF;

  -- Business & Management Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Project Management') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Project Management', 'Display your ability to plan, execute, and deliver projects on time and within budget');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Strategic Planning') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Strategic Planning', 'Demonstrate your capability to develop long-term business strategies');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Budget Management') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Budget Management', 'Show your expertise in financial planning and resource allocation');
  END IF;

  -- Data & Analytics Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Data Analysis') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Data Analysis', 'Show your analytical thinking and data interpretation skills using various tools');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Statistical Modeling') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Statistical Modeling', 'Demonstrate your ability to create and interpret statistical models');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Business Intelligence') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Business Intelligence', 'Showcase your skills in transforming data into actionable business insights');
  END IF;

  -- Creative & Design Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'UI/UX Design') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('UI/UX Design', 'Present your user interface and user experience design capabilities');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Graphic Design') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Graphic Design', 'Display your creative design skills and visual communication abilities');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Content Creation') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Content Creation', 'Show your ability to create engaging and compelling content across various media');
  END IF;

  -- Marketing & Sales Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Digital Marketing') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Digital Marketing', 'Present your marketing strategy and campaign development skills across digital platforms');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Sales Presentation') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Sales Presentation', 'Demonstrate your ability to pitch products and close deals effectively');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Social Media Marketing') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Social Media Marketing', 'Showcase your expertise in building brand presence on social platforms');
  END IF;

  -- Customer Relations Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Customer Service') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Customer Service', 'Demonstrate your interpersonal and problem-solving abilities in customer interactions');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Client Relationship Management') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Client Relationship Management', 'Show your skills in building and maintaining long-term client relationships');
  END IF;

  -- Technical Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'System Administration') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('System Administration', 'Demonstrate your ability to manage and maintain IT infrastructure');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Cybersecurity') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Cybersecurity', 'Show your expertise in protecting systems and data from security threats');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Cloud Computing') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Cloud Computing', 'Display your knowledge of cloud platforms and distributed computing solutions');
  END IF;

  -- Specialized Skills
  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Teaching & Training') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Teaching & Training', 'Demonstrate your ability to educate and develop others effectively');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Problem Solving') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Problem Solving', 'Show your analytical approach to identifying and resolving complex challenges');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "public"."Skill" WHERE name = 'Innovation & Creativity') THEN
    INSERT INTO "public"."Skill" (name, description) VALUES
      ('Innovation & Creativity', 'Present your ability to think outside the box and develop innovative solutions');
  END IF;

END $$;