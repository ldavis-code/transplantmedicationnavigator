/**
 * Generics vs. Brand-Name patient education.
 *
 * Consolidates the guidance that was previously scattered across several FAQ
 * entries into one clear, transplant-specific explainer. Reassures patients
 * that generics are safe and money-saving, while making the one rule that
 * matters for narrow-therapeutic-index anti-rejection drugs unmistakable:
 * stay on the same manufacturer and tell your transplant team before switching.
 *
 * Written at ~6th-grade reading level to match the rest of the site.
 */

import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { ShieldCheck, AlertTriangle, CheckCircle, Pill, FlaskConical, Phone, ArrowRight } from 'lucide-react';

const GenericsVsBrand = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div>
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">{t('education.generics.eyebrow')}</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{t('education.generics.title')}</h2>
                <p className="text-slate-700 mt-2 md:text-lg">
                    {t('education.generics.intro')}
                </p>
            </div>

            {/* Generics are real medicine */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
                    <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    {t('education.generics.real.title')}
                </h3>
                <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
                    <li><Trans i18nKey="education.generics.real.li1" /></li>
                    <li><Trans i18nKey="education.generics.real.li2" /></li>
                    <li><Trans i18nKey="education.generics.real.li3" /></li>
                    <li><Trans i18nKey="education.generics.real.li4" /></li>
                </ul>
            </section>

            {/* Transplant drugs need extra care */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-2">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                    {t('education.generics.extraCare.title')}
                </h3>
                <p className="text-slate-700 text-sm md:text-base mb-2">
                    <Trans i18nKey="education.generics.extraCare.p1" />
                </p>
                <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
                    <li><Trans i18nKey="education.generics.extraCare.li1" /></li>
                    <li><Trans i18nKey="education.generics.extraCare.li2" /></li>
                </ul>
                <p className="text-slate-700 text-sm md:text-base mt-2">
                    <Trans i18nKey="education.generics.extraCare.p2" />
                </p>
            </section>

            {/* The safe way to save */}
            <section className="bg-white border-2 border-emerald-300 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                    <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    {t('education.generics.safeWay.title')}
                </h3>
                <ol className="space-y-2 text-slate-700 text-sm md:text-base list-decimal list-inside">
                    <li><Trans i18nKey="education.generics.safeWay.li1" /></li>
                    <li><Trans i18nKey="education.generics.safeWay.li2" /></li>
                    <li><Trans i18nKey="education.generics.safeWay.li3" /></li>
                    <li><Trans i18nKey="education.generics.safeWay.li4" /></li>
                    <li><Trans i18nKey="education.generics.safeWay.li5" /></li>
                </ol>
            </section>

            {/* When to ask for brand-name */}
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                    <Pill size={20} className="text-blue-600 flex-shrink-0" aria-hidden="true" />
                    {t('education.generics.brand.title')}
                </h3>
                <p className="text-slate-700 text-sm md:text-base mb-2">{t('education.generics.brand.intro')}</p>
                <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
                    <li>{t('education.generics.brand.li1')}</li>
                    <li>{t('education.generics.brand.li2')}</li>
                    <li>{t('education.generics.brand.li3')}</li>
                </ul>
                <Link to="/education/appeals" className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline mt-3 text-sm">
                    {t('education.generics.brand.appealLink')} <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </section>

            {/* Bottom line */}
            <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <FlaskConical size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">{t('education.generics.bottomLine.title')}</h3>
                        <p className="text-slate-700 text-sm md:text-base">
                            <Trans i18nKey="education.generics.bottomLine.text" />
                        </p>
                    </div>
                </div>
            </section>

            <p className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={16} className="flex-shrink-0" aria-hidden="true" />
                {t('education.generics.footer')}
            </p>
        </div>
    );
};

export default GenericsVsBrand;
