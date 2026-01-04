-- Migration: Add subscriber authentication and data sync tables
-- This migration adds password authentication to user_profiles and creates
-- the user_quiz_data table for syncing quiz progress across devices.
--
-- NOTE: This migration is for Supabase PostgreSQL.
-- Run this in your Supabase SQL editor.

-- Add authentication columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS legacy_savings_id TEXT;

-- Create user_quiz_data table for syncing quiz progress
CREATE TABLE IF NOT EXISTS user_quiz_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}',
    selected_medications JSONB NOT NULL DEFAULT '[]',
    results JSONB NOT NULL DEFAULT '{}',
    usage_tracking JSONB NOT NULL DEFAULT '{}',
    quiz_progress JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_quiz_data_user_id ON user_quiz_data(user_id);

-- Add programs column to user_medications if it doesn't exist
ALTER TABLE user_medications
ADD COLUMN IF NOT EXISTS programs JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for user_medications user lookup
CREATE INDEX IF NOT EXISTS idx_user_medications_user_id ON user_medications(user_id);

-- Add RLS policies for user_quiz_data (if RLS is enabled)
-- Users can only access their own quiz data
ALTER TABLE user_quiz_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz data"
ON user_quiz_data FOR SELECT
USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own quiz data"
ON user_quiz_data FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own quiz data"
ON user_quiz_data FOR UPDATE
USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own quiz data"
ON user_quiz_data FOR DELETE
USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Grant service role access (for Netlify functions)
GRANT ALL ON user_quiz_data TO service_role;
GRANT ALL ON user_medications TO service_role;
GRANT ALL ON user_profiles TO service_role;

COMMENT ON TABLE user_quiz_data IS 'Stores quiz progress and answers for authenticated subscribers';
COMMENT ON COLUMN user_profiles.password_hash IS 'PBKDF2 password hash in format hash:salt';
COMMENT ON COLUMN user_profiles.legacy_savings_id IS 'Links to old tmn_savings_user_id from localStorage';
