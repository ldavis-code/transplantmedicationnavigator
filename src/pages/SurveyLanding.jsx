import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Pill, Shield, Quote } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

// Survey Landing Page
// Offers transplant-specific and general medication surveys

export default function SurveyLanding() {
  const { t } = useTranslation();
  useMetaTags(seoMetadata.survey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {t('survey.landing.title')}
          </h1>
          <p className="text-lg text-slate-600">
            {t('survey.landing.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Survey Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* Transplant Survey Card */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {t('survey.landing.transplantTitle')}
              </h2>
            </div>
            <p className="text-slate-600 mb-4">
              {t('survey.landing.transplantText')}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {t('survey.landing.transplantMeta')}
            </p>
            <Link
              to="/survey/transplant"
              className="block w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              {t('survey.landing.transplantStart')}
            </Link>
          </div>

          {/* General Medication Survey Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-slate-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {t('survey.landing.generalTitle')}
              </h2>
            </div>
            <p className="text-slate-600 mb-4">
              {t('survey.landing.generalText')}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {t('survey.landing.generalMeta')}
            </p>
            <Link
              to="/survey/general"
              className="block w-full py-3 px-6 bg-slate-700 text-white text-center rounded-xl font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
            >
              {t('survey.landing.generalStart')}
            </Link>
          </div>
        </div>

        {/* Why We're Asking Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Quote className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            {t('survey.landing.whyTitle')}
          </h3>
          <blockquote className="text-slate-600 italic mb-4 border-l-4 border-emerald-200 pl-4">
            {t('survey.landing.whyQuote')}
          </blockquote>
          <p className="text-sm text-slate-500">
            {t('survey.landing.whyAttribution')}
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span><strong>{t('survey.landing.privacyLabel')}</strong> {t('survey.landing.privacyText')}</span>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {t('survey.common.poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
}
