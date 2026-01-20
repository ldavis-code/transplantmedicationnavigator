-- Migration: Add quiz_email_leads table for email collection
-- This table stores email addresses collected from quiz users before showing results.
-- These are anonymous users who haven't created an account yet.
--
-- NOTE: This migration is for Supabase PostgreSQL.
-- Run this in your Supabase SQL editor.

-- Create quiz_email_leads table
CREATE TABLE IF NOT EXISTS quiz_email_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    marketing_opt_in BOOLEAN DEFAULT FALSE,
    quiz_answers JSONB DEFAULT '{}',
    selected_medications JSONB DEFAULT '[]',
    source TEXT DEFAULT 'quiz',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_to_user BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ
);

-- Create index for email lookups (useful for deduplication and conversion tracking)
CREATE INDEX IF NOT EXISTS idx_quiz_email_leads_email ON quiz_email_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_email_leads_created_at ON quiz_email_leads(created_at);

-- Allow anonymous inserts (for quiz users who haven't signed up yet)
-- RLS policy allows anyone to insert but only service_role can read
ALTER TABLE quiz_email_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a lead (no auth required for quiz completion)
CREATE POLICY "Allow anonymous inserts"
ON quiz_email_leads FOR INSERT
WITH CHECK (true);

-- Only service role can read/update/delete (for admin and conversion tracking)
CREATE POLICY "Service role full access"
ON quiz_email_leads FOR ALL
USING (auth.role() = 'service_role');

-- Grant service role full access
GRANT ALL ON quiz_email_leads TO service_role;

-- Allow anon role to insert
GRANT INSERT ON quiz_email_leads TO anon;

COMMENT ON TABLE quiz_email_leads IS 'Stores email addresses collected from quiz users before showing results';
COMMENT ON COLUMN quiz_email_leads.marketing_opt_in IS 'Whether user opted in to receive medication assistance updates';
COMMENT ON COLUMN quiz_email_leads.converted_to_user IS 'Set to true when this lead creates an account';
