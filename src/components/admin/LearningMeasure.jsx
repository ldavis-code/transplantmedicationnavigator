/**
 * Learning measure: confidence in affording transplant medications, 1 to 5,
 * asked on the first step of the quiz and again on the results page.
 *
 * Shared by the Impact Report, Insights, and Center Analytics so the numbers
 * read the same everywhere and in the shape an abstract reports a pre/post
 * patient-education endpoint: n, mean and SD for each half, and for the
 * paired set (both answers from the same browser visit) the mean change and
 * the share who improved. Data comes from lib/confidenceStats.cjs.
 *
 * Admin-only surface, English by design (see scripts/check-i18n.js).
 */

const SCORES = [1, 2, 3, 4, 5];

/** "+1.4", "-0.3", "0.0", or "N/A". */
export function formatGain(gain) {
  if (gain == null || !Number.isFinite(Number(gain))) return 'N/A';
  const n = Number(gain);
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}`;
}

/** Headline value + sublabel for a stat tile. */
export function confidenceHeadline(confidence) {
  const paired = confidence?.available ? confidence.paired : null;
  if (!paired || paired.n === 0) {
    return {
      value: 'N/A',
      sublabel: 'Asked before and after the quiz; fills in as patients answer both',
    };
  }
  return {
    value: formatGain(paired.meanGain),
    sublabel: `${paired.preMean} before, ${paired.postMean} after (of 5) · ${paired.n} paired · ${paired.improvedPct}% improved`,
  };
}

function Stat({ value, label, sub, tone = 'gray' }) {
  const color = { gray: 'text-gray-900', emerald: 'text-emerald-700', indigo: 'text-indigo-700' }[tone] || 'text-gray-900';
  return (
    <div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{sub}</div>}
    </div>
  );
}

function DistributionBars({ title, distribution, n, tone }) {
  const bar = tone === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400';
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">{title} <span className="font-normal text-gray-400">(n {n})</span></h3>
      <div className="space-y-1.5">
        {SCORES.map((score, i) => {
          const count = distribution?.[i] || 0;
          const pct = n > 0 ? Math.round((count / n) * 100) : 0;
          return (
            <div key={score} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-right text-gray-600 tabular-nums">{score}</span>
              <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-16 text-gray-500 tabular-nums">{count} · {pct}%</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 pl-6">
        <span>1 = not at all confident</span>
        <span>5 = very confident</span>
      </div>
    </div>
  );
}

export default function LearningMeasure({ confidence, compact = false }) {
  if (!confidence || !confidence.available) {
    return <p className="text-sm text-gray-500">Learning data is not available yet.</p>;
  }
  const { pre, post, paired } = confidence;
  if (pre.n === 0 && post.n === 0) {
    return (
      <p className="text-sm text-gray-500">
        No confidence answers yet. The quiz asks &ldquo;How confident are you that you can afford your transplant
        medications?&rdquo; (1 to 5) on its first step and again on the results page. This section fills in as
        patients answer.
      </p>
    );
  }
  const sd = (v) => (v != null ? ` · SD ${v}` : '');
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Stat value={pre.mean ?? 'N/A'} label="Before the quiz" sub={`n ${pre.n}${sd(pre.sd)}`} />
        <Stat value={post.mean ?? 'N/A'} label="After the quiz" sub={`n ${post.n}${sd(post.sd)}`} />
        <Stat
          value={paired.n > 0 ? formatGain(paired.meanGain) : 'N/A'}
          label="Mean change (paired)"
          sub={paired.n > 0 ? `${paired.n} answered both${sd(paired.gainSd)}` : 'Needs both answers from the same visit'}
          tone="emerald"
        />
        <Stat
          value={paired.n > 0 ? `${paired.improvedPct}%` : 'N/A'}
          label="Improved"
          sub={paired.n > 0 ? `${paired.improved} up · ${paired.unchanged} same · ${paired.declined} down` : undefined}
          tone="indigo"
        />
      </div>
      {!compact && (
        <div className="grid md:grid-cols-2 gap-6">
          <DistributionBars title="Before" distribution={pre.distribution} n={pre.n} tone="slate" />
          <DistributionBars title="After" distribution={post.distribution} n={post.n} tone="emerald" />
        </div>
      )}
      <p className="text-xs text-gray-400">
        Question: &ldquo;How confident are you that you can afford your transplant medications?&rdquo; on a scale of 1 (not at
        all) to 5 (very), asked on the first step of the quiz and again on the results page. Paired change uses the two
        answers from the same browser visit. Anonymous aggregates; no identity or PHI.
      </p>
    </div>
  );
}
