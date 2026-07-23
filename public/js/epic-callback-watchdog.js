// Watchdog for the Epic OAuth callback page. Loaded as an external file:
// the site's CSP (script-src 'self') blocks inline scripts, which is why
// this page's logic must never be inlined in the HTML.
// Watchdog: this page must never spin forever. If the module script
// below fails to load (stale cached module, blocked import, JS error)
// nothing would run and the pre-rendered spinner would sit silently.
// Surface that as a visible, actionable error instead.
window.__epicCallbackStarted = false;
function __epicShowStuckError(msg) {
    var processing = document.getElementById('state-processing');
    var error = document.getElementById('state-error');
    var errMsg = document.getElementById('error-msg');
    if (!processing || processing.classList.contains('hidden')) return;
    processing.classList.add('hidden');
    if (errMsg) errMsg.textContent = msg;
    if (error) error.classList.remove('hidden');
}
setTimeout(function () {
    if (!window.__epicCallbackStarted) {
        __epicShowStuckError('This page could not start. Please hard-refresh (Ctrl+Shift+R) and try connecting again.');
    }
}, 6000);
setTimeout(function () {
    __epicShowStuckError('The connection is taking too long. Please go back and try again. If this keeps happening, hard-refresh this page (Ctrl+Shift+R) first.');
}, 45000);
