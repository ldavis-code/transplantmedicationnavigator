/**
 * When to ask "Did you get your medication today?"
 *
 * The check-in only means something after the patient has had time to act
 * on their results: asked the moment the results page opens, it mostly
 * collects "No" from people who just arrived. So the results page notes the
 * first time it was seen and asks on a later visit, at least a day after
 * that — and never again once answered. All on-device (localStorage).
 */
const RESULTS_FIRST_SEEN_KEY = 'tmn_results_first_seen';
const FEEDBACK_ANSWERED_KEY = 'tmn_feedback_answered';
export const FEEDBACK_DELAY_MS = 24 * 60 * 60 * 1000;

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode: ask never, fine */ } };

/** Record the first results view (no-op after the first). */
export function noteResultsSeen() {
    if (!read(RESULTS_FIRST_SEEN_KEY)) write(RESULTS_FIRST_SEEN_KEY, String(Date.now()));
}

/** True when the first view was at least FEEDBACK_DELAY_MS ago and no answer was given. */
export function feedbackIsDue(now = Date.now()) {
    if (read(FEEDBACK_ANSWERED_KEY)) return false;
    const first = Number(read(RESULTS_FIRST_SEEN_KEY));
    return first > 0 && now - first >= FEEDBACK_DELAY_MS;
}

export function markFeedbackAnswered() {
    write(FEEDBACK_ANSWERED_KEY, String(Date.now()));
}
