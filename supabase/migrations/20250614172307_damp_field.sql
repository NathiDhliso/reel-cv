/*
  # Add Recruiter Role to System

  1. Schema Changes
    - Add 'recruiter' to the Role enum type
    - This allows users to have recruiter role in addition to candidate, proctor, and admin

  2. Security
    - No additional RLS policies needed yet - will be handled in application logic
    - Existing policies will work with the new role
*/

-- Add recruiter to the Role enum
ALTER TYPE "public"."Role" ADD VALUE 'recruiter';