/**
 * Shared Database Module
 * Centralizes Neon client initialization for Netlify functions.
 * Import this instead of duplicating connection setup in every function.
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';

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

// ---------- Default export: Neon SQL client ----------

const sql = getNeonClient();
export default sql;
