// Print button for static pages (TrumpRx guide and its Spanish version).
// External file because the site's Content-Security-Policy blocks inline
// script execution (script-src 'self') — an onclick attribute would be
// silently ignored.
document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-print-page]');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            window.print();
        });
    }
});
