/**
 * Learning-measure aggregates for the admin reports.
 *
 * The quiz asks one question twice: "How confident are you that you can
 * afford your transplant medications?" on a 1-5 scale, once on the first
 * step (event confidence_pre, sent with quiz_start) and once on the results
 * page (confidence_post). Confidence gain before and after an education
 * intervention is the standard endpoint for patient-education studies, so
 * the numbers here are shaped the way an abstract reports them: n, mean and
 * SD for each half, and for the paired set (same browser tab answered both)
 * the mean change and how many improved, stayed the same, or declined.
 *
 * Pairing uses meta_json.sessionId, the random per-tab id trackServerEvent
 * attaches to every event. It identifies a browser tab, never a person.
 * The first "before" and the last "after" from a tab are paired, so a
 * restart inside one tab does not create a second pair.
 *
 * CommonJS so both module styles in netlify/functions can load it:
 * admin-impact.js and admin-center-analytics.js require() it, admin-api.js
 * imports it (Node and esbuild both resolve named imports from a
 * `module.exports = { ... }` object).
 */

const CONFIDENCE_SCORES = [1, 2, 3, 4, 5];

const toInt = (v) => (v == null ? 0 : parseInt(v, 10) || 0);
const round = (v, places = 2) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/**
 * @param {Function} db  neon tagged-template client
 * @param {object} [options]
 * @param {string} [options.startIso]  window start (inclusive), default all time
 * @param {string} [options.endIso]    window end (inclusive), default all time
 * @param {string|null} [options.partner]  center slug (events.partner) to restrict to
 */
async function getConfidenceStats(db, options = {}) {
  const startIso = options.startIso || '1970-01-01T00:00:00.000Z';
  const endIso = options.endIso || '2099-12-31T23:59:59.999Z';
  const partner = options.partner || null;

  try {
    const [summaryRows, distributionRows] = await Promise.all([
      db`
        WITH scored AS (
          SELECT event_name,
                 meta_json->>'sessionId' AS sid,
                 (meta_json->>'score')::int AS score,
                 ts
          FROM events
          WHERE event_name IN ('confidence_pre', 'confidence_post')
            AND meta_json->>'score' ~ '^[1-5]$'
            AND ts >= ${startIso} AND ts <= ${endIso}
            AND (${partner}::text IS NULL OR partner = ${partner}::text)
        ),
        pre AS (SELECT * FROM scored WHERE event_name = 'confidence_pre'),
        post AS (SELECT * FROM scored WHERE event_name = 'confidence_post'),
        first_pre AS (
          SELECT DISTINCT ON (sid) sid, score FROM pre WHERE sid IS NOT NULL ORDER BY sid, ts ASC
        ),
        last_post AS (
          SELECT DISTINCT ON (sid) sid, score FROM post WHERE sid IS NOT NULL ORDER BY sid, ts DESC
        ),
        paired AS (
          SELECT p.score AS pre_score, q.score AS post_score
          FROM first_pre p JOIN last_post q USING (sid)
        )
        SELECT
          (SELECT COUNT(*) FROM pre)                 AS pre_n,
          (SELECT AVG(score) FROM pre)               AS pre_mean,
          (SELECT STDDEV_SAMP(score) FROM pre)       AS pre_sd,
          (SELECT COUNT(*) FROM post)                AS post_n,
          (SELECT AVG(score) FROM post)              AS post_mean,
          (SELECT STDDEV_SAMP(score) FROM post)      AS post_sd,
          (SELECT COUNT(*) FROM paired)              AS paired_n,
          (SELECT AVG(pre_score) FROM paired)        AS paired_pre_mean,
          (SELECT AVG(post_score) FROM paired)       AS paired_post_mean,
          (SELECT AVG(post_score - pre_score) FROM paired)          AS mean_gain,
          (SELECT STDDEV_SAMP(post_score - pre_score) FROM paired)  AS gain_sd,
          (SELECT COUNT(*) FILTER (WHERE post_score > pre_score) FROM paired) AS improved,
          (SELECT COUNT(*) FILTER (WHERE post_score = pre_score) FROM paired) AS unchanged,
          (SELECT COUNT(*) FILTER (WHERE post_score < pre_score) FROM paired) AS declined
      `,
      db`
        SELECT event_name, (meta_json->>'score')::int AS score, COUNT(*) AS count
        FROM events
        WHERE event_name IN ('confidence_pre', 'confidence_post')
          AND meta_json->>'score' ~ '^[1-5]$'
          AND ts >= ${startIso} AND ts <= ${endIso}
          AND (${partner}::text IS NULL OR partner = ${partner}::text)
        GROUP BY event_name, (meta_json->>'score')::int
      `,
    ]);

    const r = summaryRows[0] || {};
    const distribution = { confidence_pre: [0, 0, 0, 0, 0], confidence_post: [0, 0, 0, 0, 0] };
    for (const row of distributionRows) {
      const idx = toInt(row.score) - 1;
      if (distribution[row.event_name] && idx >= 0 && idx < 5) {
        distribution[row.event_name][idx] = toInt(row.count);
      }
    }

    const pairedN = toInt(r.paired_n);
    return {
      available: true,
      scale: { min: CONFIDENCE_SCORES[0], max: CONFIDENCE_SCORES[CONFIDENCE_SCORES.length - 1] },
      pre: {
        n: toInt(r.pre_n),
        mean: round(r.pre_mean),
        sd: round(r.pre_sd),
        distribution: distribution.confidence_pre,
      },
      post: {
        n: toInt(r.post_n),
        mean: round(r.post_mean),
        sd: round(r.post_sd),
        distribution: distribution.confidence_post,
      },
      paired: {
        n: pairedN,
        preMean: round(r.paired_pre_mean),
        postMean: round(r.paired_post_mean),
        meanGain: round(r.mean_gain),
        gainSd: round(r.gain_sd),
        improved: toInt(r.improved),
        unchanged: toInt(r.unchanged),
        declined: toInt(r.declined),
        improvedPct: pairedN > 0 ? Math.round((toInt(r.improved) / pairedN) * 100) : 0,
      },
    };
  } catch (err) {
    // Events table missing or unreachable: the reports render "no data yet"
    // rather than failing the whole page.
    console.warn('[confidenceStats] query failed:', err.message);
    return { available: false, error: err.message };
  }
}

module.exports = { getConfidenceStats, CONFIDENCE_SCORES };
