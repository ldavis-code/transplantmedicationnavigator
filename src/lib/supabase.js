/**
 * Supabase Client for React App
 * Provides authentication and database access
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhvemrazkwlmdaljrcln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodmVtcmF6a3dsbWRhbGpyY2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDMyOTIsImV4cCI6MjA4MjE3OTI5Mn0.20dRGKemeN3-5J30cEJhMshkB0nBWSs92GfIylJW7QU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get user's profile including plan
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

/**
 * Get or create usage tracking for a user
 */
export async function getUsageTracking(userId) {
  // First try to get existing record
  let { data, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // No record found, create one
    const { data: newData, error: insertError } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        search_count: 0,
        quiz_completions: 0,
        period_start: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating usage tracking:', insertError);
      return null;
    }
    return newData;
  }

  if (error) {
    console.error('Error fetching usage tracking:', error);
    return null;
  }

  // Check if we need to reset for a new month
  if (data) {
    const periodStart = new Date(data.period_start);
    const now = new Date();
    const isNewMonth = periodStart.getMonth() !== now.getMonth() ||
                       periodStart.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      // Reset for new month
      const { data: resetData, error: resetError } = await supabase
        .from('usage_tracking')
        .update({
          search_count: 0,
          quiz_completions: 0,
          period_start: now.toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (resetError) {
        console.error('Error resetting usage tracking:', resetError);
        return data;
      }
      return resetData;
    }
  }

  return data;
}

/**
 * Increment search count for a user
 */
export async function incrementSearchCount(userId) {
  const { data, error } = await supabase.rpc('increment_search_count', {
    p_user_id: userId
  });

  // Fallback if RPC doesn't exist - do it manually
  if (error && error.code === '42883') {
    const current = await getUsageTracking(userId);
    if (current) {
      const { error: updateError } = await supabase
        .from('usage_tracking')
        .update({ search_count: current.search_count + 1 })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error incrementing search count:', updateError);
        return false;
      }
      return true;
    }
    return false;
  }

  if (error) {
    console.error('Error incrementing search count:', error);
    return false;
  }
  return true;
}

/**
 * Increment quiz completions for a user
 */
export async function incrementQuizCompletions(userId) {
  const current = await getUsageTracking(userId);
  if (current) {
    const { error } = await supabase
      .from('usage_tracking')
      .update({ quiz_completions: current.quiz_completions + 1 })
      .eq('user_id', userId);

    if (error) {
      console.error('Error incrementing quiz completions:', error);
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Check if user has Pro plan (unlimited searches)
 */
export async function isProUser(userId) {
  const profile = await getUserProfile(userId);
  return profile?.plan === 'pro' || profile?.plan === 'yearly' || profile?.plan === 'monthly';
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
