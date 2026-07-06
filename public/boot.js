// Small boot script, kept external so the Content-Security-Policy can
// disallow all inline/eval script execution (script-src without
// 'unsafe-inline'/'unsafe-eval').

// Service worker cache reset - fixes stale redirect issues
(function () {
    if ('serviceWorker' in navigator && 'caches' in window) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            registrations.forEach(function (registration) {
                registration.update();
            });
        });
    }
})();

// Internet Explorer detection - only runs for IE users
(function () {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (isIE) {
        document.getElementById('root').innerHTML = '<div style="padding: 40px; max-width: 600px; margin: 40px auto; font-family: Arial, sans-serif; text-align: center; background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px;">' +
            '<h1 style="color: #dc2626; margin-bottom: 20px;">Browser Update Needed</h1>' +
            '<p style="margin-bottom: 16px;">The Transplant Medication Navigator&trade; works best with a modern browser.</p>' +
            '<p style="margin-bottom: 24px;">Please try <a href="https://www.microsoft.com/edge" style="color: #2563eb;">Microsoft Edge</a>, <a href="https://www.google.com/chrome" style="color: #2563eb;">Chrome</a>, or <a href="https://www.mozilla.org/firefox" style="color: #2563eb;">Firefox</a>.</p>' +
            '<p style="color: #666; font-size: 14px;">Need help? Ask a family member or contact your local library.</p>' +
            '</div>';
    }
})();
