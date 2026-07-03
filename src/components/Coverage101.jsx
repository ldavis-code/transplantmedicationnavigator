import { useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';

const Coverage101 = () => {
    const { t } = useTranslation();
    const rootRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const cards = Array.from(root.querySelectorAll('.tmn-c101-card'));

        const isAccordionMode = () => root.getBoundingClientRect().width <= 1023;

        const setOpen = (card, open) => {
            card.dataset.open = open ? 'true' : 'false';
            const btn = card.querySelector('.tmn-c101-cardhead');
            if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        const syncToMode = () => {
            const accordion = isAccordionMode();
            cards.forEach((card, i) => {
                if (accordion) {
                    setOpen(card, i === 0);
                } else {
                    setOpen(card, true);
                }
            });
        };

        syncToMode();

        let resizeRaf;
        const handleResize = () => {
            cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(syncToMode);
        };
        window.addEventListener('resize', handleResize);

        const track = (name, props) => {
            if (typeof window.tmnTrack === 'function') {
                window.tmnTrack(name, props);
            } else if (typeof window.gtag === 'function') {
                window.gtag('event', name, props || {});
            }
        };

        const cardHandlers = cards.map(card => {
            const btn = card.querySelector('.tmn-c101-cardhead');
            if (!btn) return null;
            const handler = () => {
                if (!isAccordionMode()) return;
                const isOpen = card.dataset.open === 'true';
                cards.forEach(c => { if (c !== card) setOpen(c, false); });
                setOpen(card, !isOpen);
                track('coverage_card_toggle', {
                    coverage: card.dataset.coverage,
                    opened: !isOpen,
                });
            };
            btn.addEventListener('click', handler);
            return { btn, handler };
        });

        const stepEls = Array.from(root.querySelectorAll('[data-analytics="next-step"]'));
        const stepHandlers = stepEls.map(el => {
            const handler = () => {
                track('coverage_next_step_click', {
                    coverage: el.dataset.coverageName,
                    step: el.dataset.step,
                    text: el.textContent.trim(),
                });
            };
            el.addEventListener('click', handler);
            return { el, handler };
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(resizeRaf);
            cardHandlers.forEach(h => h && h.btn.removeEventListener('click', h.handler));
            stepHandlers.forEach(h => h.el.removeEventListener('click', h.handler));
        };
    }, []);

    return (
        <section
            ref={rootRef}
            className="tmn-coverage101"
            aria-labelledby="tmn-c101-title"
        >
            <header className="tmn-c101-header">
                <img src="/photos/logo.png" alt={t('education.coverage101.logoAlt')} />
                <div className="tmn-c101-header-text">
                    <span className="tmn-c101-eyebrow">{t('education.coverage101.eyebrow')}</span>
                    <h2 className="tmn-c101-title" id="tmn-c101-title">
                        {t('education.coverage101.title')}
                    </h2>
                    <p className="tmn-c101-sub">
                        {t('education.coverage101.sub')}
                    </p>
                </div>
            </header>

            <div className="tmn-c101-grid" role="list">
                {/* COMMERCIAL */}
                <article className="tmn-c101-card" data-coverage="commercial" data-open="false" role="listitem">
                    <button
                        type="button"
                        className="tmn-c101-cardhead"
                        aria-expanded="true"
                        aria-controls="tmn-c101-body-commercial"
                        data-analytics="card-toggle"
                        data-coverage-name="Commercial"
                    >
                        <div className="tmn-c101-cardhead-row">
                            <span className="tmn-c101-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </span>
                            <span className="tmn-c101-chevron" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </div>
                        <div>
                            <span className="tmn-c101-eyebrow-card">{t('education.coverage101.commercial.eyebrow')}</span>
                            <h3 className="tmn-c101-cardname">{t('education.coverage101.commercial.name')}</h3>
                            <p className="tmn-c101-cardtag">{t('education.coverage101.commercial.tag')}</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-commercial">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.whoQualifies')}</h4>
                            <ul className="tmn-c101-list">
                                {t('education.coverage101.commercial.who', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.howItWorks')}</h4>
                            <p><Trans i18nKey="education.coverage101.commercial.how" /></p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> {t('education.coverage101.watchFor')}</p>
                            <p>{t('education.coverage101.commercial.warn')}</p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> {t('education.coverage101.nextSteps')}</p>
                            <ol>
                                {t('education.coverage101.commercial.steps', { returnObjects: true }).map((step, i) => (
                                    <li key={i} data-analytics="next-step" data-coverage-name="Commercial" data-step={String(i + 1)}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </article>

                {/* MEDICARE */}
                <article className="tmn-c101-card" data-coverage="medicare" data-open="false" role="listitem">
                    <button
                        type="button"
                        className="tmn-c101-cardhead"
                        aria-expanded="true"
                        aria-controls="tmn-c101-body-medicare"
                        data-analytics="card-toggle"
                        data-coverage-name="Medicare"
                    >
                        <div className="tmn-c101-cardhead-row">
                            <span className="tmn-c101-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v6"/><path d="M9 14l3-2 3 2"/><path d="M10 21l-1-7"/><path d="M14 21l1-7"/><path d="M18 14v7"/></svg>
                            </span>
                            <span className="tmn-c101-chevron" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </div>
                        <div>
                            <span className="tmn-c101-eyebrow-card">{t('education.coverage101.medicare.eyebrow')}</span>
                            <h3 className="tmn-c101-cardname">{t('education.coverage101.medicare.name')}</h3>
                            <p className="tmn-c101-cardtag">{t('education.coverage101.medicare.tag')}</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-medicare">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.whoQualifies')}</h4>
                            <ul className="tmn-c101-list">
                                {t('education.coverage101.medicare.who', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.howItWorks')}</h4>
                            <p><Trans i18nKey="education.coverage101.medicare.how" /></p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> {t('education.coverage101.watchFor')}</p>
                            <p><Trans i18nKey="education.coverage101.medicare.warn" /></p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> {t('education.coverage101.nextSteps')}</p>
                            <ol>
                                {t('education.coverage101.medicare.steps', { returnObjects: true }).map((step, i) => (
                                    <li key={i} data-analytics="next-step" data-coverage-name="Medicare" data-step={String(i + 1)}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </article>

                {/* MEDICAID */}
                <article className="tmn-c101-card" data-coverage="medicaid" data-open="false" role="listitem">
                    <button
                        type="button"
                        className="tmn-c101-cardhead"
                        aria-expanded="true"
                        aria-controls="tmn-c101-body-medicaid"
                        data-analytics="card-toggle"
                        data-coverage-name="Medicaid"
                    >
                        <div className="tmn-c101-cardhead-row">
                            <span className="tmn-c101-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="2.5"/><circle cx="17" cy="7" r="2"/><path d="M3 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3"/><path d="M15 21v-2a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v2"/></svg>
                            </span>
                            <span className="tmn-c101-chevron" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </div>
                        <div>
                            <span className="tmn-c101-eyebrow-card">{t('education.coverage101.medicaid.eyebrow')}</span>
                            <h3 className="tmn-c101-cardname">{t('education.coverage101.medicaid.name')}</h3>
                            <p className="tmn-c101-cardtag">{t('education.coverage101.medicaid.tag')}</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-medicaid">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.whoQualifies')}</h4>
                            <ul className="tmn-c101-list">
                                {t('education.coverage101.medicaid.who', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.howItWorks')}</h4>
                            <p>{t('education.coverage101.medicaid.how')}</p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> {t('education.coverage101.watchFor')}</p>
                            <p><Trans i18nKey="education.coverage101.medicaid.warn" /></p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> {t('education.coverage101.nextSteps')}</p>
                            <ol>
                                {t('education.coverage101.medicaid.steps', { returnObjects: true }).map((step, i) => (
                                    <li key={i} data-analytics="next-step" data-coverage-name="Medicaid" data-step={String(i + 1)}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </article>

                {/* UNINSURED / SELF-PAY */}
                <article className="tmn-c101-card" data-coverage="selfpay" data-open="false" role="listitem">
                    <button
                        type="button"
                        className="tmn-c101-cardhead"
                        aria-expanded="true"
                        aria-controls="tmn-c101-body-selfpay"
                        data-analytics="card-toggle"
                        data-coverage-name="Uninsured / Self-Pay"
                    >
                        <div className="tmn-c101-cardhead-row">
                            <span className="tmn-c101-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M12 6v4M10.5 8h3"/><path d="M3 20a9 9 0 0 1 18 0"/></svg>
                            </span>
                            <span className="tmn-c101-chevron" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </div>
                        <div>
                            <span className="tmn-c101-eyebrow-card">{t('education.coverage101.selfpay.eyebrow')}</span>
                            <h3 className="tmn-c101-cardname">{t('education.coverage101.selfpay.name')}</h3>
                            <p className="tmn-c101-cardtag">{t('education.coverage101.selfpay.tag')}</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-selfpay">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.whoQualifies')}</h4>
                            <ul className="tmn-c101-list">
                                {t('education.coverage101.selfpay.who', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">{t('education.coverage101.howItWorks')}</h4>
                            <p>{t('education.coverage101.selfpay.how')}</p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> {t('education.coverage101.watchFor')}</p>
                            <p>{t('education.coverage101.selfpay.warn')}</p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> {t('education.coverage101.nextSteps')}</p>
                            <ol>
                                {t('education.coverage101.selfpay.steps', { returnObjects: true }).map((step, i) => (
                                    <li key={i} data-analytics="next-step" data-coverage-name="Uninsured / Self-Pay" data-step={String(i + 1)}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </article>
            </div>

            <p className="tmn-c101-footnote">
                {t('education.coverage101.footnote')}
            </p>
        </section>
    );
};

export default Coverage101;
