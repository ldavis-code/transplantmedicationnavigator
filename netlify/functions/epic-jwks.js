// netlify/functions/epic-jwks.js
// JWK Set (JWKS) endpoint for Epic Backend Systems OAuth.
//
// Per Epic Breaking Change Notification Q-7365177, backend OAuth apps must
// host their public keys at a JWK Set URL (JKU) instead of uploading static
// keys. This endpoint serves the app's RSA public key(s) in standard JWK Set
// format so Epic can fetch them to verify JWT client assertions.
//
// Environment variables:
//   EPIC_PRIVATE_KEY       - RSA private key in PEM format (required)
//   EPIC_KEY_ID            - Key ID (kid) for the JWK (optional, derived from key if not set)
//   EPIC_PRIVATE_KEY_2     - Optional second RSA private key for key rotation
//   EPIC_KEY_ID_2          - Key ID for the second key (optional)

import crypto from 'crypto';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
  // JWKS should be cacheable but not for too long to allow key rotation
  'Cache-Control': 'public, max-age=3600'
};

/**
 * Normalize a PEM key string that may have been stored as a single-line
 * environment variable with literal "\n" characters.
 */
function normalizePem(pem) {
  if (!pem) return null;
  // Replace literal \n with actual newlines
  let normalized = pem.replace(/\\n/g, '\n');
  // Ensure proper PEM formatting
  normalized = normalized.trim();
  return normalized;
}

/**
 * Derive a stable key ID (kid) from the public key by hashing it.
 * Uses the first 16 hex characters of the SHA-256 hash of the
 * DER-encoded public key.
 */
function deriveKeyId(publicKey) {
  const der = publicKey.export({ type: 'spki', format: 'der' });
  return crypto.createHash('sha256').update(der).digest('hex').substring(0, 16);
}

/**
 * Convert an RSA private key PEM to a JWK public key entry with
 * required Epic metadata fields.
 */
function privateKeyToJwkEntry(pemString, explicitKid) {
  const privateKey = crypto.createPrivateKey(pemString);
  const publicKey = crypto.createPublicKey(privateKey);
  const kid = explicitKid || deriveKeyId(publicKey);

  // Export the public key in JWK format (Node 20+ supports this natively)
  const jwk = publicKey.export({ format: 'jwk' });

  return {
    ...jwk,
    kid,
    use: 'sig',
    alg: 'RS384',
    key_ops: ['verify']
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const rawKey = process.env.EPIC_PRIVATE_KEY;
    if (!rawKey) {
      console.error('[epic-jwks] EPIC_PRIVATE_KEY environment variable is not set');
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
        body: JSON.stringify({
          error: 'JWKS not configured. Set EPIC_PRIVATE_KEY environment variable.'
        })
      };
    }

    const pem = normalizePem(rawKey);
    const keys = [];

    // Primary key
    try {
      const entry = privateKeyToJwkEntry(pem, process.env.EPIC_KEY_ID);
      keys.push(entry);
      console.log('[epic-jwks] Primary key loaded, kid=' + entry.kid);
    } catch (e) {
      console.error('[epic-jwks] Failed to parse primary key:', e.message);
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
        body: JSON.stringify({
          error: 'Failed to parse EPIC_PRIVATE_KEY. Ensure it is a valid RSA private key in PEM format.'
        })
      };
    }

    // Optional second key for rotation
    const rawKey2 = process.env.EPIC_PRIVATE_KEY_2;
    if (rawKey2) {
      try {
        const pem2 = normalizePem(rawKey2);
        const entry2 = privateKeyToJwkEntry(pem2, process.env.EPIC_KEY_ID_2);
        keys.push(entry2);
        console.log('[epic-jwks] Rotation key loaded, kid=' + entry2.kid);
      } catch (e) {
        console.warn('[epic-jwks] Failed to parse rotation key (EPIC_PRIVATE_KEY_2):', e.message);
        // Don't fail the entire response if the rotation key is bad
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ keys })
    };
  } catch (error) {
    console.error('[epic-jwks] Unexpected error:', error.message);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'Internal error generating JWKS' })
    };
  }
}
