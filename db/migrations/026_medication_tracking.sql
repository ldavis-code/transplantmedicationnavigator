-- Medication Tracking Migration
-- Tracks user interactions with medications (searches, views, clicks)
-- Used for analytics to understand which medications are most searched/viewed

CREATE TABLE IF NOT EXISTS medication_tracking (
    id SERIAL PRIMARY KEY,
    medication_name TEXT NOT NULL,
    interaction_type TEXT NOT NULL,          -- 'search', 'view', 'add_to_list', 'program_click'
    search_query TEXT,                       -- Original search query (nullable, only for search interactions)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying by medication name
CREATE INDEX IF NOT EXISTS idx_medication_tracking_name ON medication_tracking(medication_name);

-- Index for filtering by interaction type
CREATE INDEX IF NOT EXISTS idx_medication_tracking_type ON medication_tracking(interaction_type);

-- Index for time-based analytics queries
CREATE INDEX IF NOT EXISTS idx_medication_tracking_created_at ON medication_tracking(created_at);

-- Composite index for common analytics pattern: what's most searched/viewed recently
CREATE INDEX IF NOT EXISTS idx_medication_tracking_type_created ON medication_tracking(interaction_type, created_at DESC);
