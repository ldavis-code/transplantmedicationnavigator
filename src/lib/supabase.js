import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://lhvemrazkwlmdaljrcln.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodmVtcmF6a3dsbWRhbGpyY2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDMyOTIsImV4cCI6MjA4MjE3OTI5Mn0.20dRGKemeN3-5J2cEJhMshkB0nBWSs92GfIylJW7QU'
);
