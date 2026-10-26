/**
 * What's changing in 2027: the Medicare, Medicaid, and Marketplace changes
 * that start January 1, 2027, in one page the home banner links to.
 * Every figure is from CMS (sources listed at the bottom of the page).
 * When the 2027 Part B / Part B-ID amounts are announced (usually
 * November), update changes2027.page.pending in both locale files.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CalendarDays, AlertTriangle, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

// CMS fact sheet, negotiated prices for 2027 (30-day supply; list price is
// the 2024 wholesale price). Transplant-relevant drugs only; the other 8
// are named in the text.
const PRICE_ROWS = [
    { name: 'Xifaxan', useKey: 'xifaxan', list: 2696, price: 1000 },
    { name: 'Ozempic / Rybelsus / Wegovy', useKey: 'semaglutide', list: 959, price: 274 },
    { name: 'Janumet / Janumet XR', useKey: 'janumet', list: 526, price: 80 },
    { name: 'Tradjenta', useKey: 'tradjenta', list: 488, price: 78 },
    { name: 'Trelegy Ellipta', useKey: 'trelegy', list: 654, price: 175 },
    { name: 'Breo Ellipta', useKey: 'breo', list: 397, price: 67 },
    { name: 'Ofev', useKey: 'ofev', list: 12622, price: 6350 },
];

const SOURCES = [
    { key: 'partD', url: 'https://www.cms.gov/files/document/2027-announcement.pdf' },
    { key: 'prices', url: 'https://www.cms.gov/files/document/fact-sheet-negotiated-prices-ipay-2027.pdf' },
    { key: 'medicaid', url: 'https://www.cms.gov/newsroom/fact-sheets/medicaid-community-engagement-requirement-certain-individuals-interim-final-rule-comment-period-cms' },
    { key: 'healthcare', url: 'https://www.healthcare.gov/quick-guide/dates-and-deadlines/', esUrl: 'https://www.cuidadodesalud.gov/es/quick-guide/dates-and-deadlines/' },
];

const money = (n) => `$${n.toLocaleString('en-US')}`;

const ExternalA = ({ href, children, className }) => {
    const { t } = useTranslation();
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
            <ExternalLink size={14} className="inline ml-1 -mt-0.5" aria-hidden="true" />
            <span className="sr-only"> {t('changes2027.page.externalNote')}</span>
        </a>
    );
};

const ActionList = ({ title, items }) => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
        <h3 className="font-bold text-emerald-900 mb-2">{title}</h3>
        <ul className="space-y-2">
            {items.map((item) => (
                <li key={item} className="flex gap-2 text-slate-800">
                    <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const Section = ({ id, title, children }) => (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-7 shadow-sm" aria-labelledby={id}>
        <h2 id={id} className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{title}</h2>
        {children}
    </section>
);

const Changes2027 = () => {
    useMetaTags(seoMetadata.changes2027);
    const { t, i18n } = useTranslation();
    const isSpanish = (i18n.resolvedLanguage || i18n.language || '').startsWith('es');
    const list = (key) => t(key, { returnObjects: true });
    const dates = list('changes2027.page.dates');
    const healthcareUrl = isSpanish ? 'https://www.cuidadodesalud.gov/es/' : 'https://www.healthcare.gov/';
    const linkClass = 'text-emerald-700 font-semibold underline hover:text-emerald-800';

    return (
        <article className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium">
                <ArrowLeft size={18} aria-hidden="true" /> {t('changes2027.page.back')}
            </Link>

            <header>
                <p className="inline-block text-xs font-bold tracking-wide uppercase bg-amber-100 text-amber-900 px-3 py-1 rounded-full mb-3">
                    {t('changes2027.page.badge')}
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 mb-3">{t('changes2027.page.title')}</h1>
                <p className="text-lg text-slate-600">{t('changes2027.page.intro')}</p>
            </header>

            <Section id="c27-dates" title={t('changes2027.page.datesTitle')}>
                <ul className="divide-y divide-slate-100">
                    {dates.map((d) => (
                        <li key={d.when} className="py-3 flex flex-col sm:flex-row sm:gap-4">
                            <span className="flex items-center gap-2 font-bold text-emerald-800 sm:w-56 flex-shrink-0">
                                <CalendarDays size={18} aria-hidden="true" /> {d.when}
                            </span>
                            <span className="text-slate-700">{d.what}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section id="c27-partd" title={t('changes2027.page.partD.title')}>
                <p className="text-slate-700 mb-4">{t('changes2027.page.partD.lead')}</p>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {[
                        { label: 'capLabel', was: 2100, now: 2400 },
                        { label: 'deductibleLabel', was: 615, now: 700 },
                    ].map((row) => (
                        <div key={row.label} className="border border-slate-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-slate-600 mb-1">{t(`changes2027.page.partD.${row.label}`)}</p>
                            <p className="text-slate-800">
                                <span className="text-slate-500">{t('changes2027.page.partD.was')}: {money(row.was)}</span>
                                <ArrowRight size={16} className="inline mx-2 text-slate-400" aria-hidden="true" />
                                <span className="font-extrabold text-2xl text-emerald-800">{t('changes2027.page.partD.now')}: {money(row.now)}</span>
                            </p>
                        </div>
                    ))}
                </div>
                <p className="text-slate-700 mb-3">{t('changes2027.page.partD.p1')}</p>
                <p className="text-slate-700">{t('changes2027.page.partD.p2')}</p>
                <ActionList title={t('changes2027.page.partD.actionTitle')} items={list('changes2027.page.partD.actions')} />
                <p className="mt-4">
                    <ExternalA href="https://www.medicare.gov/plan-compare/" className={linkClass}>{t('changes2027.page.partD.planFinder')}</ExternalA>
                </p>
            </Section>

            <Section id="c27-prices" title={t('changes2027.page.prices.title')}>
                <p className="text-slate-700 mb-4">{t('changes2027.page.prices.lead')}</p>
                <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-200 text-slate-600">
                                <th scope="col" className="py-2 px-1 font-semibold">{t('changes2027.page.prices.colDrug')}</th>
                                <th scope="col" className="py-2 px-1 font-semibold">{t('changes2027.page.prices.colUse')}</th>
                                <th scope="col" className="py-2 px-1 font-semibold text-right">{t('changes2027.page.prices.colList')}</th>
                                <th scope="col" className="py-2 px-1 font-semibold text-right">{t('changes2027.page.prices.colNew')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PRICE_ROWS.map((r) => (
                                <tr key={r.name} className="border-b border-slate-100 align-top">
                                    <th scope="row" className="py-2 px-1 font-bold text-slate-900">{r.name}</th>
                                    <td className="py-2 px-1 text-slate-700">{t(`changes2027.page.prices.uses.${r.useKey}`)}</td>
                                    <td className="py-2 px-1 text-right text-slate-500 whitespace-nowrap">{money(r.list)}</td>
                                    <td className="py-2 px-1 text-right font-bold text-emerald-800 whitespace-nowrap">{money(r.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-slate-700 mt-4">
                    <span className="font-semibold">{t('changes2027.page.prices.othersLabel')}</span> {t('changes2027.page.prices.others')}
                </p>
                <p className="text-sm text-slate-600 mt-3">{t('changes2027.page.prices.note')}</p>
                <p className="text-sm text-slate-600 mt-2">{t('changes2027.page.prices.round1')}</p>
            </Section>

            <Section id="c27-medicaid" title={t('changes2027.page.medicaid.title')}>
                <div className="flex gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4" role="note">
                    <AlertTriangle size={22} className="text-amber-700 flex-shrink-0" aria-hidden="true" />
                    <p className="font-semibold text-amber-900">{t('changes2027.page.medicaid.warning')}</p>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{t('changes2027.page.medicaid.whoTitle')}</h3>
                <p className="text-slate-700 mb-4">{t('changes2027.page.medicaid.who')}</p>
                <h3 className="font-bold text-slate-900 mb-1">{t('changes2027.page.medicaid.exemptTitle')}</h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700 mb-4">
                    {list('changes2027.page.medicaid.exempt').map((item) => <li key={item}>{item}</li>)}
                </ul>
                <h3 className="font-bold text-slate-900 mb-1">{t('changes2027.page.medicaid.transplantTitle')}</h3>
                <p className="text-slate-700">{t('changes2027.page.medicaid.transplant')}</p>
                <ActionList title={t('changes2027.page.medicaid.actionTitle')} items={list('changes2027.page.medicaid.actions')} />
                <p className="text-sm text-slate-600 mt-4">{t('changes2027.page.medicaid.notMedicare')}</p>
                <p className="mt-2">
                    <ExternalA href="https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip" className={linkClass}>{t('changes2027.page.medicaid.stateLink')}</ExternalA>
                </p>
            </Section>

            <Section id="c27-marketplace" title={t('changes2027.page.marketplace.title')}>
                <p className="text-slate-700 mb-3">{t('changes2027.page.marketplace.lead')}</p>
                <p className="text-slate-700 mb-3">{t('changes2027.page.marketplace.p1')}</p>
                <p className="text-slate-700">{t('changes2027.page.marketplace.p2')}</p>
                <ActionList title={t('changes2027.page.marketplace.actionTitle')} items={list('changes2027.page.marketplace.actions')} />
                <p className="mt-4">
                    <ExternalA href={healthcareUrl} className={linkClass}>{t('changes2027.page.marketplace.link')}</ExternalA>
                </p>
            </Section>

            <section className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 md:p-7" aria-labelledby="c27-pending">
                <h2 id="c27-pending" className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                    <Clock size={20} className="text-slate-500" aria-hidden="true" /> {t('changes2027.page.pending.title')}
                </h2>
                <p className="text-slate-700 mb-2">{t('changes2027.page.pending.p1')}</p>
                <p className="text-slate-700">{t('changes2027.page.pending.p2')}</p>
            </section>

            <section className="bg-emerald-700 text-white rounded-2xl p-5 md:p-7" aria-labelledby="c27-checklist">
                <h2 id="c27-checklist" className="text-xl md:text-2xl font-bold mb-3">{t('changes2027.page.checklistTitle')}</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    {list('changes2027.page.checklist').map((item) => <li key={item}>{item}</li>)}
                </ol>
            </section>

            <section className="text-center bg-white border border-slate-200 rounded-2xl p-6" aria-labelledby="c27-help">
                <h2 id="c27-help" className="text-xl font-bold text-slate-900 mb-2">{t('changes2027.page.helpTitle')}</h2>
                <p className="text-slate-600 mb-4">{t('changes2027.page.helpText')}</p>
                <Link to="/wizard" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition">
                    {t('changes2027.page.helpCta')} <ArrowRight size={18} aria-hidden="true" />
                </Link>
            </section>

            <section aria-labelledby="c27-sources" className="text-sm text-slate-600">
                <h2 id="c27-sources" className="font-bold text-slate-800 mb-2">{t('changes2027.page.sourcesTitle')}</h2>
                <p className="mb-2">{t('changes2027.page.sourcesNote')}</p>
                <ul className="space-y-1">
                    {SOURCES.map((s) => (
                        <li key={s.key}>
                            <ExternalA href={(isSpanish && s.esUrl) || s.url} className="text-emerald-700 underline hover:text-emerald-800">
                                {t(`changes2027.page.sources.${s.key}`)}
                            </ExternalA>
                        </li>
                    ))}
                </ul>
            </section>
        </article>
    );
};

export default Changes2027;
