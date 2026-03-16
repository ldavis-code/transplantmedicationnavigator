/**
 * Shared Database Module
 * Centralizes Neon and Supabase client initialization for Netlify functions.
 * Import this instead of duplicating connection setup in every function.
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------- Neon (medications, savings, events, etc.) ----------

let _neonClient: NeonQueryFunction<false, false> | null = null;

/**
 * Returns a lazily-initialized Neon SQL tagged-template client.
 * Throws if DATABASE_URL is not set.
 */
export function getNeonClient(): NeonQueryFunction<false, false> {
  if (!_neonClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _neonClient = neon(process.env.DATABASE_URL);
  }
  return _neonClient;
}

// ---------- Supabase (subscriptions, subscriber auth, profiles) ----------

let _supabaseClient: SupabaseClient | null = null;

/**
 * Returns a lazily-initialized Supabase admin client (service-role key).
 * Throws if SUPABASE_SERVICE_KEY is not set.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required'
      );
    }

    _supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseClient;
}

// ---------- Common CORS headers ----------

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
} as const;

/**
 * Helper: return a 204 preflight response.
 */
export function handleCorsPreFlight() {
  return { statusCode: 204, headers: corsHeaders };
}
