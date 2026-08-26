/**
 * ShareButton — pass the site to another transplant patient.
 *
 * Word of mouth is how a free tool with no ad budget reaches the next
 * patient, and until now there was nothing to press.
 *
 * Two behaviours behind one button, chosen by what the device can do:
 *   - navigator.share exists (phones, and where a patient most likely is
 *     when a coordinator says "look this up") — the OS sheet opens, which
 *     is what makes "text this to someone" real: Messages, WhatsApp, and
 *     mail are all in there without us building any of them.
 *   - otherwise (most desktops) — the link and message go to the clipboard
 *     and the button says so for a few seconds.
 *
 * Shares the site root in the reader's own language, not the current URL:
 * someone passing this on wants the recipient to land at the beginning, and
 * a Spanish speaker sharing should send the Spanish page. Deep links stay
 * the job of the per-page copy-link controls (see MedicationSearch).
 *
 * Same navigator.share/clipboard pattern SavingsDashboard already uses, with
 * the inline confirmation MedicationSearch uses, so this behaves like the
 * rest of the site rather than introducing a third convention.
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Check } from 'lucide-react';
import { trackServerEvent } from '../lib/trackServerEvent.js';

export default function ShareButton({ source = 'home', className = '' }) {
    const { t, i18n } = useTranslation();
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(null);

    // Don't set state on an unmounted component if the visitor navigates
    // away inside the confirmation window.
    useEffect(() => () => clearTimeout(timerRef.current), []);

    const isSpanish = (i18n.resolvedLanguage || i18n.language || '').startsWith('es');

    const handleShare = async () => {
        const url = `${window.location.origin}${isSpanish ? '/es/' : '/'}`;
        const title = t('share.title');
        const text = t('share.message');

        trackServerEvent('resource_view', { resource: 'share', source });

        try {
            if (navigator.share) {
                // Passing url separately (rather than glued into text) lets the
                // OS render a link preview and lets mail clients build a subject.
                await navigator.share({ title, text, url });
                return;
            }
        } catch (err) {
            // AbortError is the visitor closing the share sheet — that is a
            // decision, not a failure, so don't fall through to copying a
            // link they just declined to send.
            if (err?.name === 'AbortError') return;
            // Anything else (permission, unsupported payload): fall through
            // to the clipboard so the button still does something useful.
        }

        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            setCopied(true);
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setCopied(false), 3000);
        } catch {
            // Clipboard blocked (insecure context, permissions policy). Leave
            // the label unchanged rather than claiming a copy that never
            // happened — the visitor can still copy the address bar.
        }
    };

    return (
        <div className={className}>
            <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition min-h-[48px] w-full sm:w-auto"
            >
                {copied
                    ? <><Check size={18} aria-hidden="true" /> {t('share.copied')}</>
                    : <><Share2 size={18} aria-hidden="true" /> {t('share.button')}</>}
            </button>
            {/* Announced rather than only shown: the label swap is the only
                feedback a copy gives, and a screen reader would miss it. */}
            <span role="status" aria-live="polite" className="sr-only">
                {copied ? t('share.copiedAnnounce') : ''}
            </span>
        </div>
    );
}
