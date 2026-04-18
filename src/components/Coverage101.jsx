import { useEffect, useRef } from 'react';

const Coverage101 = () => {
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
                <img src="/photos/logo.png" alt="Transplant Medication Navigator" />
                <div className="tmn-c101-header-text">
                    <span className="tmn-c101-eyebrow">Coverage 101</span>
                    <h2 className="tmn-c101-title" id="tmn-c101-title">
                        How you pay for transplant medications.
                    </h2>
                    <p className="tmn-c101-sub">
                        The four most common ways patients are covered — what to know, what to watch for, what to do next.
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
                            <span className="tmn-c101-eyebrow-card">Commercial</span>
                            <h3 className="tmn-c101-cardname">Insurance from your job or that you bought yourself.</h3>
                            <p className="tmn-c101-cardtag">Through an employer, the Marketplace, or a spouse/parent's plan.</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-commercial">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">Who qualifies</h4>
                            <ul className="tmn-c101-list">
                                <li>Employees of companies that offer benefits</li>
                                <li>Self-purchased plans through Healthcare.gov</li>
                                <li>Dependents on a family member's plan</li>
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">How it works</h4>
                            <p>You pay a monthly premium. Insurance starts paying more after you hit your <strong>deductible</strong>. Copays and coinsurance apply at the pharmacy until you reach your <strong>out-of-pocket max</strong>.</p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> Watch for</p>
                            <p>High out-of-pocket before you hit your deductible. Narrow networks. Prior-authorization delays.</p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> Next steps</p>
                            <ol>
                                <li data-analytics="next-step" data-coverage-name="Commercial" data-step="1">Check your plan's formulary for transplant medications.</li>
                                <li data-analytics="next-step" data-coverage-name="Commercial" data-step="2">Know your deductible and out-of-pocket max.</li>
                                <li data-analytics="next-step" data-coverage-name="Commercial" data-step="3">Confirm your transplant center is in-network.</li>
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
                            <span className="tmn-c101-eyebrow-card">Medicare</span>
                            <h3 className="tmn-c101-cardname">Federal insurance for 65+ and certain disabilities.</h3>
                            <p className="tmn-c101-cardtag">Includes End-Stage Renal Disease and qualifying long-term disability.</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-medicare">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">Who qualifies</h4>
                            <ul className="tmn-c101-list">
                                <li>Adults 65+</li>
                                <li>People with qualifying disabilities (24+ months on SSDI)</li>
                                <li>Anyone with End-Stage Renal Disease</li>
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">How it works</h4>
                            <p><strong>Part A</strong> covers hospital stays. <strong>Part B</strong> covers outpatient care and some immunosuppressants. <strong>Part D</strong> covers most prescription drugs. Many enroll in <strong>Medicare Advantage</strong> for bundled coverage.</p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> Watch for</p>
                            <p>Coverage gaps in Part D ("donut hole"). Premiums for Part B and Part D add up. <strong>Copay cards are not allowed</strong> with Medicare.</p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> Next steps</p>
                            <ol>
                                <li data-analytics="next-step" data-coverage-name="Medicare" data-step="1">Enroll in Medicare Part A, B, and D (or Advantage).</li>
                                <li data-analytics="next-step" data-coverage-name="Medicare" data-step="2">Apply for Extra Help if your income is limited.</li>
                                <li data-analytics="next-step" data-coverage-name="Medicare" data-step="3">Review your Part D drug formulary every fall.</li>
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
                            <span className="tmn-c101-eyebrow-card">Medicaid</span>
                            <h3 className="tmn-c101-cardname">State-and-federal coverage for limited income.</h3>
                            <p className="tmn-c101-cardtag">Eligibility, benefits, and rules vary by state.</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-medicaid">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">Who qualifies</h4>
                            <ul className="tmn-c101-list">
                                <li>Households below your state's income limit</li>
                                <li>Children, pregnant patients, and people with disabilities</li>
                                <li>Some long-term care and waiver recipients</li>
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">How it works</h4>
                            <p>The state pays for most covered services with low or zero out-of-pocket cost. Each state runs its own program — your benefits, prescription rules, and provider list depend on where you live.</p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> Watch for</p>
                            <p>Income and asset limits — exceed them and you can lose coverage. Provider networks may be limited. <strong>Copay cards are not allowed</strong>.</p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> Next steps</p>
                            <ol>
                                <li data-analytics="next-step" data-coverage-name="Medicaid" data-step="1">Contact your state Medicaid office to apply.</li>
                                <li data-analytics="next-step" data-coverage-name="Medicaid" data-step="2">Gather income, residency, and household documents.</li>
                                <li data-analytics="next-step" data-coverage-name="Medicaid" data-step="3">Re-verify eligibility on the renewal date.</li>
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
                            <span className="tmn-c101-eyebrow-card">Uninsured / Self-Pay</span>
                            <h3 className="tmn-c101-cardname">Paying full cost yourself, with no insurance.</h3>
                            <p className="tmn-c101-cardtag">Between jobs, pre-Medicare, or otherwise without coverage.</p>
                        </div>
                    </button>

                    <div className="tmn-c101-cardbody" id="tmn-c101-body-selfpay">
                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">Who qualifies</h4>
                            <ul className="tmn-c101-list">
                                <li>Hospital charity / financial-assistance programs</li>
                                <li>Manufacturer Patient Assistance Programs (PAPs)</li>
                                <li>Discount cards and pharmacy savings programs</li>
                            </ul>
                        </div>

                        <div className="tmn-c101-block">
                            <h4 className="tmn-c101-block-h">How it works</h4>
                            <p>You receive the full retail bill. Cash prices for transplant medications can run hundreds to thousands per month. Hospitals and pharmacies often negotiate or offer payment plans on request.</p>
                        </div>

                        <div className="tmn-c101-warn" role="note">
                            <p className="tmn-c101-warn-h"><span aria-hidden="true">⚠</span> Watch for</p>
                            <p>Catastrophic out-of-pocket costs. Risk of medical debt. Skipped doses if cost feels impossible.</p>
                        </div>

                        <div className="tmn-c101-next">
                            <p className="tmn-c101-next-h"><span aria-hidden="true">→</span> Next steps</p>
                            <ol>
                                <li data-analytics="next-step" data-coverage-name="Uninsured / Self-Pay" data-step="1">Apply for manufacturer Patient Assistance Programs first.</li>
                                <li data-analytics="next-step" data-coverage-name="Uninsured / Self-Pay" data-step="2">Negotiate cash prices and ask about payment plans.</li>
                                <li data-analytics="next-step" data-coverage-name="Uninsured / Self-Pay" data-step="3">Re-check Medicaid and Marketplace plan eligibility.</li>
                            </ol>
                        </div>
                    </div>
                </article>
            </div>

            <p className="tmn-c101-footnote">
                Educational information only. Eligibility rules and coverage details change — verify with your insurer, state Medicaid office, and transplant team.
            </p>
        </section>
    );
};

export default Coverage101;
