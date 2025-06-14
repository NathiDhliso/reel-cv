/*
  # Add password hash field to User table

  1. Changes
    - Add `passwordHash` column to `User` table for storing hashed passwords
    - This enables JWT-based authentication alongside Supabase auth

  2. Security
    - Passwords will be hashed using bcrypt before storage
    - No plain text passwords stored in database
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'passwordHash'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "passwordHash" text;
  END IF;
END $$;