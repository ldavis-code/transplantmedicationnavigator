-- Migration: Add patient code redemption columns
-- Tracks when patients redeem assistance codes for free Pro access
-- Run this in your Supabase SQL Editor

-- Add patient code columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS patient_code_redeemed TEXT,
ADD COLUMN IF NOT EXISTS patient_code_redeemed_at TIMESTAMPTZ;

-- Create index for tracking code usage
CREATE INDEX IF NOT EXISTS idx_user_profiles_patient_code
ON user_profiles(patient_code_redeemed);

COMMENT ON COLUMN user_profiles.patient_code_redeemed IS 'Patient assistance code that was redeemed for free Pro access';
COMMENT ON COLUMN user_profiles.patient_code_redeemed_at IS 'Timestamp when the patient code was redeemed';
