/**
 * Subscriber Data API
 * Handles CRUD operations for subscriber data (quiz progress, medications)
 * Stores data in Supabase for cross-device sync
 */

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
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

const SUBSCRIBER_JWT_SECRET = process.env.SUBSCRIBER_JWT_SECRET || process.env.JWT_SECRET || 'subscriber-secret-change-in-production';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// Verify token and extract user ID
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

// Get user from auth header
function getUserFromRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const user = getUserFromRequest(event);
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const path = event.path.replace('/.netlify/functions/subscriber-data', '');
  const params = event.queryStringParameters || {};

  try {
    // GET /subscriber-data - Get all user data
    if (event.httpMethod === 'GET' && !path) {
      // Get user's quiz data
      const { data: quizData } = await supabase
        .from('user_quiz_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user's medications
      const { data: medications } = await supabase
        .from('user_medications')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          quizData: quizData || null,
          medications: medications || [],
        }),
      };
    }

    // GET /subscriber-data/quiz - Get quiz data only
    if (event.httpMethod === 'GET' && path === '/quiz') {
      const { data } = await supabase
        .from('user_quiz_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || {}),
      };
    }

    // POST /subscriber-data/quiz - Save quiz data
    if (event.httpMethod === 'POST' && path === '/quiz') {
      const body = JSON.parse(event.body);
      const { answers, selectedMedications, results, usageTracking, quizProgress } = body;

      // Upsert quiz data
      const { data, error } = await supabase
        .from('user_quiz_data')
        .upsert({
          user_id: user.id,
          answers: answers || {},
          selected_medications: selectedMedications || [],
          results: results || {},
          usage_tracking: usageTracking || {},
          quiz_progress: quizProgress || {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving quiz data:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save quiz data' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data }),
      };
    }

    // GET /subscriber-data/medications - Get medications
    if (event.httpMethod === 'GET' && path === '/medications') {
      const { data } = await supabase
        .from('user_medications')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || []),
      };
    }

    // POST /subscriber-data/medications - Add medication
    if (event.httpMethod === 'POST' && path === '/medications') {
      const body = JSON.parse(event.body);
      const { medication_name, brand_name, dosage, monthly_cost, renewal_date, renewal_type, programs } = body;

      const { data, error } = await supabase
        .from('user_medications')
        .insert({
          user_id: user.id,
          medication_name,
          brand_name,
          dosage,
          monthly_cost,
          renewal_date,
          renewal_type,
          programs: programs || [],
          added_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding medication:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to add medication' }),
        };
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(data),
      };
    }

    // PUT /subscriber-data/medications/:id - Update medication
    if (event.httpMethod === 'PUT' && path.startsWith('/medications/')) {
      const medicationId = path.replace('/medications/', '');
      const body = JSON.parse(event.body);

      const { data, error } = await supabase
        .from('user_medications')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', medicationId)
        .eq('user_id', user.id) // Ensure user owns this medication
        .select()
        .single();

      if (error) {
        console.error('Error updating medication:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to update medication' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // DELETE /subscriber-data/medications/:id - Delete medication
    if (event.httpMethod === 'DELETE' && path.startsWith('/medications/')) {
      const medicationId = path.replace('/medications/', '');

      const { error } = await supabase
        .from('user_medications')
        .delete()
        .eq('id', medicationId)
        .eq('user_id', user.id); // Ensure user owns this medication

      if (error) {
        console.error('Error deleting medication:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to delete medication' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // POST /subscriber-data/medications/sync - Sync multiple medications
    if (event.httpMethod === 'POST' && path === '/medications/sync') {
      const body = JSON.parse(event.body);
      const { medications } = body;

      if (!Array.isArray(medications)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'medications must be an array' }),
        };
      }

      // Get existing medications
      const { data: existing } = await supabase
        .from('user_medications')
        .select('id, medication_name, brand_name')
        .eq('user_id', user.id);

      const existingNames = new Set(existing?.map(m => `${m.medication_name}-${m.brand_name}`) || []);

      // Filter out duplicates
      const newMedications = medications.filter(m =>
        !existingNames.has(`${m.medication_name || m.name}-${m.brand_name || m.brandName}`)
      );

      if (newMedications.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ synced: 0, message: 'No new medications to sync' }),
        };
      }

      // Insert new medications
      const toInsert = newMedications.map(m => ({
        user_id: user.id,
        medication_name: m.medication_name || m.name || m.genericName,
        brand_name: m.brand_name || m.brandName,
        dosage: m.dosage,
        monthly_cost: m.monthly_cost || m.monthlyCost,
        renewal_date: m.renewal_date || m.renewalDate,
        renewal_type: m.renewal_type || m.renewalType,
        programs: m.programs || [],
        added_at: m.added_at || new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('user_medications')
        .insert(toInsert)
        .select();

      if (error) {
        console.error('Error syncing medications:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to sync medications' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ synced: data.length, medications: data }),
      };
    }

    // POST /subscriber-data/migrate - Migrate all local data to server
    if (event.httpMethod === 'POST' && path === '/migrate') {
      const body = JSON.parse(event.body);
      const { quizData, medications, legacySavingsUserId } = body;

      const results = {
        quizData: false,
        medications: 0,
        savingsLinked: false,
      };

      // Migrate quiz data if provided
      if (quizData && Object.keys(quizData).length > 0) {
        const { error } = await supabase
          .from('user_quiz_data')
          .upsert({
            user_id: user.id,
            answers: quizData.answers || {},
            selected_medications: quizData.selectedMedications || [],
            results: quizData.results || {},
            usage_tracking: quizData.usageTracking || {},
            quiz_progress: quizData.quizProgress || {},
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (!error) {
          results.quizData = true;
        }
      }

      // Migrate medications if provided
      if (medications && medications.length > 0) {
        // Get existing medications to avoid duplicates
        const { data: existing } = await supabase
          .from('user_medications')
          .select('medication_name, brand_name')
          .eq('user_id', user.id);

        const existingNames = new Set(existing?.map(m => `${m.medication_name}-${m.brand_name}`) || []);

        const newMeds = medications.filter(m => {
          const name = m.medication_name || m.name || m.genericName;
          const brand = m.brand_name || m.brandName;
          return !existingNames.has(`${name}-${brand}`);
        });

        if (newMeds.length > 0) {
          const toInsert = newMeds.map(m => ({
            user_id: user.id,
            medication_name: m.medication_name || m.name || m.genericName,
            brand_name: m.brand_name || m.brandName,
            dosage: m.dosage,
            monthly_cost: m.monthly_cost || m.monthlyCost,
            renewal_date: m.renewal_date || m.renewalDate,
            renewal_type: m.renewal_type || m.renewalType,
            programs: m.programs || [],
            added_at: m.added_at || new Date().toISOString(),
          }));

          const { data } = await supabase
            .from('user_medications')
            .insert(toInsert)
            .select();

          results.medications = data?.length || 0;
        }
      }

      // Link legacy savings user ID to subscriber account
      if (legacySavingsUserId) {
        await supabase
          .from('user_profiles')
          .update({ legacy_savings_id: legacySavingsUserId })
          .eq('id', user.id);
        results.savingsLinked = true;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          migrated: results,
        }),
      };
    }

    // DELETE /subscriber-data/account - Delete all user data and account
    if (event.httpMethod === 'DELETE' && path === '/account') {
      const deletionResults = {
        quiz_data: false,
        medications: false,
        savings: false,
        profile: false,
      };

      // 1. Delete quiz data
      const { error: quizError } = await supabase
        .from('user_quiz_data')
        .delete()
        .eq('user_id', user.id);
      deletionResults.quiz_data = !quizError;

      // 2. Delete medications
      const { error: medsError } = await supabase
        .from('user_medications')
        .delete()
        .eq('user_id', user.id);
      deletionResults.medications = !medsError;

      // 3. Delete savings data from Neon DB (linked via legacy_savings_id)
      try {
        // Look up the user's legacy savings ID
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('legacy_savings_id')
          .eq('id', user.id)
          .single();

        if (profile?.legacy_savings_id && process.env.DATABASE_URL) {
          const neonSql = neon(process.env.DATABASE_URL);
          await neonSql`
            DELETE FROM user_savings
            WHERE user_id = ${profile.legacy_savings_id}
          `;
        }
        deletionResults.savings = true;
      } catch (savingsErr) {
        console.error('Error deleting savings data:', savingsErr);
        // Non-fatal: continue with account deletion
        deletionResults.savings = false;
      }

      // 4. Delete the user profile (must be last since other tables reference it)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);
      deletionResults.profile = !profileError;

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Failed to delete account',
            details: deletionResults,
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Account and all associated data have been deleted',
          deleted: deletionResults,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Subscriber data error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
