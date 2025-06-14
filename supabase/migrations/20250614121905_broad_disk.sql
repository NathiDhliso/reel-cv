-- ReelCV Supabase Schema
CREATE TYPE "public"."Role" AS ENUM ('candidate', 'proctor', 'admin');
CREATE TYPE "public"."ProctorStatus" AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('pending_AI_analysis', 'AI_rated', 'proctor_requested', 'proctor_verified', 'failed');
CREATE TYPE "public"."IntegrityStatus" AS ENUM ('clear', 'minor_flags_reviewed', 'major_flags');

CREATE TABLE "public"."User" ( 
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
    "email" text NOT NULL UNIQUE, 
    "firstName" text, 
    "lastName" text, 
    "role" "public"."Role" DEFAULT 'candidate'::"public"."Role" 
);

CREATE TABLE "public"."Skill" ( 
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
    "name" text NOT NULL, 
    "description" text 
);

CREATE TABLE "public"."Assessment" ( 
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
    "candidateId" uuid NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE, 
    "skillId" uuid NOT NULL REFERENCES "public"."Skill"("id") ON DELETE CASCADE, 
    "videoUrl" text, 
    "status" "public"."AssessmentStatus" DEFAULT 'pending_AI_analysis'::"public"."AssessmentStatus", 
    "AI_rating" real, 
    "AI_feedback" text, 
    "proctorRating" real, 
    "proctorComments" text, 
    "integrityStatus" "public"."IntegrityStatus" 
);