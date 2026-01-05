/**
 * Subscriber Authentication API
 * Handles login, register, and token verification for subscribers (patients)
 * Uses Supabase for storage (consistent with subscription data)
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lhvemrazkwlmdaljrcln.supabase.co',
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// JWT secret for subscriber tokens (different from admin JWT_SECRET)
const SUBSCRIBER_JWT_SECRET = process.env.SUBSCRIBER_JWT_SECRET || process.env.JWT_SECRET || 'subscriber-secret-change-in-production';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Hash password with salt using PBKDF2
function hashPassword(password, salt = null) {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, useSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: useSalt };
}

// Verify password
function verifyPassword(password, storedHash, salt) {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

// Generate token
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan || 'free',
    subscription_status: user.subscription_status,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days for subscribers
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SUBSCRIBER_JWT_SECRET)
    .update(data)
    .digest('hex');
  return `${data}.${signature}`;
}

// Verify token
function verifyToken(token) {
  try {
    const [data, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', SUBSCRIBER_JWT_SECRET)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64').toString());

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Main handler
export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/subscriber-auth', '');

  try {
    // POST /subscriber-auth/register
    if (event.httpMethod === 'POST' && path === '/register') {
      const { email, password, name } = JSON.parse(event.body);

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password required' }),
        };
      }

      if (password.length < 8) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Password must be at least 8 characters' }),
        };
      }

      // Check if user exists in user_profiles
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id, password_hash')
        .eq('email', email.toLowerCase())
        .single();

      if (existing?.password_hash) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'An account with this email already exists. Please log in.' }),
        };
      }

      // Hash password
      const { hash, salt } = hashPassword(password);
      const passwordHash = `${hash}:${salt}`;

      let user;

      if (existing) {
        // User profile exists (from Stripe checkout), add password
        const { data: updated, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            password_hash: passwordHash,
            name: name || existing.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select('id, email, name, plan, subscription_status, stripe_customer_id')
          .single();

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to create account' }),
          };
        }
        user = updated;
      } else {
        // Create new user profile
        const { data: newUser, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            name: name || null,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id, email, name, plan, subscription_status')
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to create account' }),
          };
        }
        user = newUser;
      }

      const token = generateToken(user);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan || 'free',
            subscription_status: user.subscription_status,
            has_subscription: !!user.stripe_customer_id,
          },
        }),
      };
    }

    // POST /subscriber-auth/login
    if (event.httpMethod === 'POST' && path === '/login') {
      const { email, password } = JSON.parse(event.body);

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password required' }),
        };
      }

      // Find user
      const { data: user, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id, email, password_hash, name, plan, subscription_status, stripe_customer_id, subscription_plan')
        .eq('email', email.toLowerCase())
        .single();

      if (fetchError || !user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }

      if (!user.password_hash) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'No password set for this account. Please create an account first.',
            needsRegistration: true,
          }),
        };
      }

      // Verify password (format: hash:salt)
      const [storedHash, salt] = user.password_hash.split(':');
      if (!verifyPassword(password, storedHash, salt)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Generate token
      const token = generateToken(user);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan || 'free',
            subscription_status: user.subscription_status,
            subscription_plan: user.subscription_plan,
            has_subscription: !!user.stripe_customer_id,
          },
        }),
      };
    }

    // GET /subscriber-auth/verify
    if (event.httpMethod === 'GET' && path === '/verify') {
      const authHeader = event.headers.authorization || event.headers.Authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'No token provided' }),
        };
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' }),
        };
      }

      // Get latest user data from database
      const { data: user } = await supabase
        .from('user_profiles')
        .select('id, email, name, plan, subscription_status, subscription_plan, stripe_customer_id')
        .eq('id', payload.id)
        .single();

      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan || 'free',
            subscription_status: user.subscription_status,
            subscription_plan: user.subscription_plan,
            has_subscription: !!user.stripe_customer_id,
          },
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Subscriber auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
