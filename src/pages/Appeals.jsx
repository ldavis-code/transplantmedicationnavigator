import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
  ShieldAlert,
  Download,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Circle,
  FileText,
  Copy,
  AlertTriangle,
  Pill,
  ClipboardList,
  Heart,
  MessageSquare,
  Lightbulb,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Stethoscope,
  ExternalLink
} from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import LanguageToggle from '../components/LanguageToggle.jsx';

export default function Appeals() {
  const { t } = useTranslation();
  useMetaTags({
    title: t('appeals.meta.title'),
    description: t('appeals.meta.description'),
    keywords: 'insurance appeal, step therapy, prior authorization, transplant medication denial, medical necessity letter'
  });

  // Interactive section states
  const [expandedSections, setExpandedSections] = useState({
    whyDenied: true,
    stepTherapy: false,
    generics: false,
    howToAppeal: false
  });

  // Appeal steps tracker
  const [completedSteps, setCompletedSteps] = useState({});

  // Letter builder states
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [transplantType, setTransplantType] = useState('');
  const [transplantDate, setTransplantDate] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);

  // Specialty pharmacy appeal letter states
  const [spAppealName, setSpAppealName] = useState('');
  const [spAppealDrug, setSpAppealDrug] = useState('');
  const [spAppealReason, setSpAppealReason] = useState('Financial Hardship');
  const [spGeneratedLetter, setSpGeneratedLetter] = useState('');
  const [spCopied, setSpCopied] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleStep = (stepNum) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = 6;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const generateLetter = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Letter body intentionally not localized — goes to US insurers/providers in English.
    const letter = `Date: ${date}

Dear Dr. ${doctorName || "[Doctor's Name]"},

I am writing to ask for your help with an insurance appeal for my transplant medication.

My insurance company has denied coverage for ${medicationName || "[Medication Name]"}. ${denialReason ? `They stated the reason was: ${denialReason}.` : ''}

As you know, I received a ${transplantType || "[organ type]"} transplant${transplantDate ? ` on ${transplantDate}` : ''}, and I need this medication to prevent rejection of my transplant.

I am requesting that you write a letter of medical necessity on my behalf to support my appeal. A strong letter from you explaining why I need this specific medication would greatly help my case.

In your letter, it would be helpful if you could include:
• My diagnosis and transplant history
• Why this specific medication is necessary for my care
• Any clinical reasons why alternative medications are not appropriate for me
• The risks of not having access to this medication

${additionalInfo ? `Additional information that may be helpful: ${additionalInfo}` : ''}

I have attached a copy of my denial letter for your reference. Please let me know if you need any additional information from me, or if there is anything else I can provide to help with this appeal.

Thank you so much for your support. I know you are busy, and I truly appreciate your help with this.

Sincerely,
${patientName || "[Your Name]"}

Contact: [Your Phone Number]
[Your Email Address]`;

    setGeneratedLetter(letter);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSpAppealLetter = () => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    // Letter body intentionally not localized — goes to US insurers/providers in English.
    const text = `Date: ${date}\n\nTo Whom It May Concern:\n\nI am writing to appeal the coverage denial or specialty pharmacy requirement for my medication, ${spAppealDrug}. \n\nPatient Name: ${spAppealName}\nMedication: ${spAppealDrug}\n\nReason for Appeal: ${spAppealReason}\n\nThis medication is medically necessary for my transplant care. The current requirement creates a significant barrier to my adherence and health outcomes because ${
      spAppealReason === 'Financial Hardship'
        ? 'the cost at the required specialty pharmacy creates an undue financial burden.'
        : spAppealReason === 'Access Issues'
          ? 'the specialty pharmacy has caused repeated delays in delivery, putting my health at risk.'
          : 'I am clinically stable on my current medication regimen and any changes could jeopardize my transplant.'
    }\n\nPlease review this appeal and allow me to access my medication at my pharmacy of choice.\n\nSincerely,\n${spAppealName}`;
    setSpGeneratedLetter(text);
    setSpCopied(false);
  };

  const copySpToClipboard = () => {
    navigator.clipboard.writeText(spGeneratedLetter);
    setSpCopied(true);
    setTimeout(() => setSpCopied(false), 2000);
  };

  // Section header component with color coding
  const SectionHeader = ({ id, title, icon: Icon, color, isExpanded, onToggle, children }) => {
    const colorClasses = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        headerBg: 'bg-red-100',
        text: 'text-red-900',
        hoverBg: 'hover:bg-red-100'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        headerBg: 'bg-amber-100',
        text: 'text-amber-900',
        hoverBg: 'hover:bg-amber-100'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        headerBg: 'bg-blue-100',
        text: 'text-blue-900',
        hoverBg: 'hover:bg-blue-100'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        headerBg: 'bg-emerald-100',
        text: 'text-emerald-900',
        hoverBg: 'hover:bg-emerald-100'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        headerBg: 'bg-purple-100',
        text: 'text-purple-900',
        hoverBg: 'hover:bg-purple-100'
      }
    };

    const c = colorClasses[color];

    return (
      <section id={id} className={`mb-6 rounded-xl border-2 ${c.border} overflow-hidden transition-all duration-300`}>
        <button
          onClick={onToggle}
          className={`w-full ${c.headerBg} px-6 py-4 flex items-center justify-between gap-4 ${c.hoverBg} transition-colors`}
          aria-expanded={isExpanded}
          aria-controls={`${id}-content`}
        >
          <div className="flex items-center gap-3">
            <div className={`${c.iconBg} p-2 rounded-lg`}>
              <Icon size={24} className={c.iconColor} aria-hidden="true" />
            </div>
            <h2 className={`text-xl font-bold ${c.text}`}>{title}</h2>
          </div>
          {isExpanded ? (
            <ChevronUp size={24} className={c.iconColor} aria-hidden="true" />
          ) : (
            <ChevronDown size={24} className={c.iconColor} aria-hidden="true" />
          )}
        </button>
        {isExpanded && (
          <div id={`${id}-content`} className={`${c.bg} px-6 py-5`}>
            {children}
          </div>
        )}
      </section>
    );
  };

  // Appeal step component
  const AppealStep = ({ number, title, description, tips, isCompleted, onToggle }) => (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
      isCompleted
        ? 'bg-emerald-50 border-emerald-300'
        : 'bg-white border-slate-200 hover:border-emerald-300'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 text-left"
        aria-pressed={isCompleted}
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
          isCompleted
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-200 text-slate-600'
        }`}>
          {isCompleted ? <Check size={20} aria-hidden="true" /> : number}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-lg mb-1 ${isCompleted ? 'text-emerald-800' : 'text-slate-800'}`}>
            {title}
          </h4>
          <p className={`text-base ${isCompleted ? 'text-emerald-700' : 'text-slate-600'}`}>
            {description}
          </p>
          {tips && (
            <div className={`mt-3 p-3 rounded-lg ${isCompleted ? 'bg-emerald-100' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={16} className={isCompleted ? 'text-emerald-600' : 'text-amber-600'} aria-hidden="true" />
                <span className={`font-semibold text-sm ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>{t('appeals.tracker.tipLabel')}</span>
              </div>
              <p className={`text-sm ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>{tips}</p>
            </div>
          )}
        </div>
      </button>
    </div>
  );

  // Denial reason card component
  const DenialReasonCard = ({ icon: Icon, title, description, color }) => {
    const colorClasses = {
      red: 'bg-red-100 text-red-600 border-red-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200'
    };

    return (
      <div className={`p-4 rounded-lg border-2 ${colorClasses[color]} transition-transform hover:scale-102`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon size={20} aria-hidden="true" />
          <span className="font-bold">{title}</span>
        </div>
        <p className="text-slate-700 text-sm">{description}</p>
      </div>
    );
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link to="/education" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('appeals.header.back')}
      </Link>

      {/* Page Header - Color coded hero */}
      <header className="mb-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-emerald-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg" aria-hidden="true">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">{t('appeals.header.title')}</h1>
            <p className="text-emerald-700 font-semibold text-lg mt-1">{t('appeals.header.tagline')}</p>
          </div>
        </div>
        <p className="text-lg text-slate-700 leading-relaxed">
          <Trans i18nKey="appeals.header.intro" />
        </p>

        <div className="mt-6 flex justify-start">
          <LanguageToggle />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">{t('appeals.header.stats.winRate')}</div>
            <div className="text-sm text-slate-600">{t('appeals.header.stats.winRateLabel')}</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">{t('appeals.header.stats.days')}</div>
            <div className="text-sm text-slate-600">{t('appeals.header.stats.daysLabel')}</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">{t('appeals.header.stats.free')}</div>
            <div className="text-sm text-slate-600">{t('appeals.header.stats.freeLabel')}</div>
          </div>
        </div>

        {/* Download Appeal Guide CTA */}
        <div className="mt-6 bg-white rounded-lg p-4 border-2 border-emerald-300 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <FileText size={24} className="text-emerald-600" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{t('appeals.header.guideTitle')}</p>
                <p className="text-sm text-slate-600">{t('appeals.header.guideSubtitle')}</p>
              </div>
            </div>
            <a
              href="/appeal-guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Download size={18} aria-hidden="true" />
              {t('appeals.header.guideDownload')}
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Navigation */}
      <nav className="bg-white rounded-xl p-5 mb-8 border-2 border-slate-200 shadow-sm" aria-label={t('appeals.nav.ariaLabel')}>
        <p className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <ClipboardList size={20} className="text-slate-600" aria-hidden="true" />
          {t('appeals.nav.prompt')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, whyDenied: true})); document.getElementById('why-denied')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-800 font-semibold hover:bg-red-100 transition text-sm"
          >
            <XCircle size={18} aria-hidden="true" />
            {t('appeals.nav.whyDenied')}
          </button>
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, stepTherapy: true})); document.getElementById('step-therapy')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border-2 border-amber-200 text-amber-800 font-semibold hover:bg-amber-100 transition text-sm"
          >
            <AlertTriangle size={18} aria-hidden="true" />
            {t('appeals.nav.stepTherapy')}
          </button>
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, generics: true})); document.getElementById('generics')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-800 font-semibold hover:bg-blue-100 transition text-sm"
          >
            <Pill size={18} aria-hidden="true" />
            {t('appeals.nav.generics')}
          </button>
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, howToAppeal: true})); document.getElementById('how-to-appeal')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100 transition text-sm"
          >
            <CheckCircle size={18} aria-hidden="true" />
            {t('appeals.nav.howToAppeal')}
          </button>
        </div>
      </nav>

      {/* Why Medications Get Denied - RED */}
      <SectionHeader
        id="why-denied"
        title={t('appeals.whyDenied.title')}
        icon={XCircle}
        color="red"
        isExpanded={expandedSections.whyDenied}
        onToggle={() => toggleSection('whyDenied')}
      >
        <p className="text-slate-700 mb-5 text-lg">
          {t('appeals.whyDenied.intro')}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <DenialReasonCard
            icon={Clock}
            title={t('appeals.whyDenied.reasons.priorAuth.title')}
            description={t('appeals.whyDenied.reasons.priorAuth.description')}
            color="red"
          />
          <DenialReasonCard
            icon={ClipboardList}
            title={t('appeals.whyDenied.reasons.notOnList.title')}
            description={t('appeals.whyDenied.reasons.notOnList.description')}
            color="orange"
          />
          <DenialReasonCard
            icon={AlertTriangle}
            title={t('appeals.whyDenied.reasons.stepTherapy.title')}
            description={t('appeals.whyDenied.reasons.stepTherapy.description')}
            color="yellow"
          />
          <DenialReasonCard
            icon={Pill}
            title={t('appeals.whyDenied.reasons.quantityLimits.title')}
            description={t('appeals.whyDenied.reasons.quantityLimits.description')}
            color="purple"
          />
          <DenialReasonCard
            icon={Pill}
            title={t('appeals.whyDenied.reasons.generic.title')}
            description={t('appeals.whyDenied.reasons.generic.description')}
            color="blue"
          />
        </div>
        <div className="mt-5 p-4 bg-white rounded-lg border-2 border-red-200">
          <p className="text-red-800 font-semibold flex items-center gap-2">
            <Lightbulb size={18} className="text-red-600" aria-hidden="true" />
            {t('appeals.whyDenied.remember')}
          </p>
        </div>
      </SectionHeader>

      {/* Step Therapy Section - AMBER */}
      <SectionHeader
        id="step-therapy"
        title={t('appeals.stepTherapy.title')}
        icon={AlertTriangle}
        color="amber"
        isExpanded={expandedSections.stepTherapy}
        onToggle={() => toggleSection('stepTherapy')}
      >
        <p className="text-slate-700 mb-5 text-lg">
          <Trans i18nKey="appeals.stepTherapy.intro" />
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Why it's bad */}
          <div className="bg-white rounded-lg p-5 border-2 border-red-200">
            <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
              <XCircle size={20} className="text-red-600" aria-hidden="true" />
              {t('appeals.stepTherapy.risky.title')}
            </h3>
            <ul className="space-y-2">
              {t('appeals.stepTherapy.risky.items', { returnObjects: true }).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-red-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What you can do */}
          <div className="bg-white rounded-lg p-5 border-2 border-emerald-200">
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" aria-hidden="true" />
              {t('appeals.stepTherapy.canDo.title')}
            </h3>
            <ul className="space-y-2">
              {t('appeals.stepTherapy.canDo.items', { returnObjects: true }).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-emerald-500 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-300">
          <p className="text-amber-900 font-semibold flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-700" aria-hidden="true" />
            {t('appeals.stepTherapy.proTip')}
          </p>
        </div>
      </SectionHeader>

      {/* Generics vs Brand Section - BLUE */}
      <SectionHeader
        id="generics"
        title={t('appeals.generics.title')}
        icon={Pill}
        color="blue"
        isExpanded={expandedSections.generics}
        onToggle={() => toggleSection('generics')}
      >
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* The Basics */}
          <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-3">{t('appeals.generics.basics.title')}</h3>
            <ul className="space-y-2 text-slate-700">
              {t('appeals.generics.basics.items', { returnObjects: true }).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Why Transplant is Different */}
          <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-3">{t('appeals.generics.different.title')}</h3>
            <p className="text-slate-700 mb-3">
              {t('appeals.generics.different.intro')}
            </p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-red-500">↓</span>
                <Trans i18nKey="appeals.generics.different.tooLittle" />
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">↑</span>
                <Trans i18nKey="appeals.generics.different.tooMuch" />
              </li>
            </ul>
          </div>
        </div>

        {/* When You Might Need Brand Name */}
        <div className="bg-blue-100 rounded-lg p-5 border-2 border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-3">{t('appeals.generics.brandNeed.title')}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {t('appeals.generics.brandNeed.items', { returnObjects: true }).map((item, i) => (
              <div key={i} className="bg-white p-3 rounded-lg flex items-center gap-2">
                <CheckCircle size={18} className="text-blue-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionHeader>

      {/* How to Appeal Section - EMERALD */}
      <SectionHeader
        id="how-to-appeal"
        title={t('appeals.howToAppeal.title')}
        icon={CheckCircle}
        color="emerald"
        isExpanded={expandedSections.howToAppeal}
        onToggle={() => toggleSection('howToAppeal')}
      >
        {/* Progress tracker */}
        <div className="mb-6 bg-white rounded-lg p-4 border-2 border-emerald-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-700">{t('appeals.tracker.progressLabel')}</span>
            <span className="text-emerald-600 font-bold">{t('appeals.tracker.progress', { completed: completedCount, total: totalSteps })}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4">
            <div
              className="bg-emerald-500 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 mt-2 italic">
            {t('appeals.tracker.instruction')}
          </p>
        </div>

        <div className="space-y-4">
          {t('appeals.tracker.steps', { returnObjects: true }).map((step, i) => (
            <AppealStep
              key={i + 1}
              number={i + 1}
              title={step.title}
              description={step.description}
              tips={step.tips}
              isCompleted={completedSteps[i + 1]}
              onToggle={() => toggleStep(i + 1)}
            />
          ))}
        </div>

        {completedCount === totalSteps && (
          <div className="mt-6 p-5 bg-emerald-100 rounded-lg border-2 border-emerald-300 text-center">
            <CheckCircle size={40} className="text-emerald-600 mx-auto mb-2" aria-hidden="true" />
            <p className="text-emerald-800 font-bold text-xl">{t('appeals.tracker.congratsTitle')}</p>
            <p className="text-emerald-700 mt-2">{t('appeals.tracker.congratsText')}</p>
          </div>
        )}
      </SectionHeader>

      {/* Patient to Doctor Letter Builder - PURPLE */}
      <section className="mb-8 rounded-xl border-2 border-purple-300 overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="bg-purple-100 px-6 py-4 border-b-2 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 text-white p-3 rounded-lg">
              <MessageSquare size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-900">{t('appeals.letter.title')}</h2>
              <p className="text-purple-700">{t('appeals.letter.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-5 border border-purple-200 mb-6">
            <div className="flex items-start gap-3">
              <Heart size={24} className="text-purple-600 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-700 mb-2">
                  <Trans i18nKey="appeals.letter.why" />
                </p>
                <p className="text-slate-600 text-sm">
                  <Trans i18nKey="appeals.letter.note" components={{ em: <em /> }} />
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="patient-name" className="block text-base font-bold text-slate-800 mb-2">
                  {t('appeals.letter.yourName')}
                </label>
                <input
                  id="patient-name"
                  type="text"
                  placeholder={t('appeals.letter.yourNamePlaceholder')}
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="doctor-name" className="block text-base font-bold text-slate-800 mb-2">
                  {t('appeals.letter.doctorName')}
                </label>
                <input
                  id="doctor-name"
                  type="text"
                  placeholder={t('appeals.letter.doctorNamePlaceholder')}
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="medication-name" className="block text-base font-bold text-slate-800 mb-2">
                  {t('appeals.letter.medicationName')}
                </label>
                <input
                  id="medication-name"
                  type="text"
                  placeholder={t('appeals.letter.medicationNamePlaceholder')}
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="transplant-type" className="block text-base font-bold text-slate-800 mb-2">
                  {t('appeals.letter.transplantType')}
                </label>
                <input
                  id="transplant-type"
                  type="text"
                  placeholder={t('appeals.letter.transplantTypePlaceholder')}
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={transplantType}
                  onChange={(e) => setTransplantType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="transplant-date" className="block text-base font-bold text-slate-800 mb-2">
                  {t('appeals.letter.transplantDate')}<span className="font-normal text-slate-500">{t('appeals.letter.optional')}</span>
                </label>
                <input
                  id="transplant-date"
                  type="text"
                  placeholder={t('appeals.letter.transplantDatePlaceholder')}
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={transplantDate}
                  onChange={(e) => setTransplantDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="denial-reason" className="block text-base font-bold text-slate-800 mb-2">
                  {t('appeals.letter.denialReason')}<span className="font-normal text-slate-500">{t('appeals.letter.ifKnown')}</span>
                </label>
                <input
                  id="denial-reason"
                  type="text"
                  placeholder={t('appeals.letter.denialReasonPlaceholder')}
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="additional-info" className="block text-base font-bold text-slate-800 mb-2">
                {t('appeals.letter.additionalInfo')}<span className="font-normal text-slate-500">{t('appeals.letter.optional')}</span>
              </label>
              <textarea
                id="additional-info"
                rows={3}
                placeholder={t('appeals.letter.additionalInfoPlaceholder')}
                className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>

            <button
              onClick={generateLetter}
              className="bg-purple-600 hover:bg-purple-700 text-white text-base font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FileText size={20} aria-hidden="true" />
              {t('appeals.letter.generate')}
            </button>

            {generatedLetter && (
              <div className="mt-6 bg-white p-6 rounded-xl border-2 border-purple-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                    <Send size={20} aria-hidden="true" />
                    {t('appeals.letter.previewTitle')}{doctorName || t('appeals.letter.doctorFallback')}
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-base font-bold transition"
                  >
                    {copied ? <Check size={18} className="text-green-600" aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                    {copied ? t('appeals.letter.copied') : t('appeals.letter.copyText')}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-serif text-base text-slate-800 leading-relaxed bg-purple-50 p-5 rounded-lg border-l-4 border-purple-400">
                  {generatedLetter}
                </pre>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm flex items-center gap-2">
                    <Lightbulb size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span><Trans i18nKey="appeals.letter.nextStep" /></span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="mb-8 rounded-xl border-2 border-emerald-200 overflow-hidden">
        <div className="bg-emerald-100 px-6 py-4 border-b-2 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-3 rounded-lg">
              <Download size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-900">{t('appeals.resources.title')}</h2>
              <p className="text-emerald-700">{t('appeals.resources.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Appeal Guide */}
            <div className="bg-white rounded-lg p-5 border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={24} className="text-emerald-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-800">{t('appeals.resources.appealGuide.title')}</h3>
              </div>
              <p className="text-slate-600 mb-4 text-sm">
                {t('appeals.resources.appealGuide.description')}
              </p>
              <ul className="text-sm text-slate-600 mb-4 space-y-1">
                {t('appeals.resources.appealGuide.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="/appeal-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg w-full justify-center"
              >
                <Download size={18} aria-hidden="true" />
                {t('appeals.resources.appealGuide.download')}
              </a>
            </div>

            {/* Doctor's Letter Template */}
            <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <ClipboardList size={24} className="text-purple-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-800">{t('appeals.resources.doctorTemplate.title')}</h3>
              </div>
              <p className="text-slate-600 mb-4 text-sm">
                {t('appeals.resources.doctorTemplate.description')}
              </p>
              <ul className="text-sm text-slate-600 mb-4 space-y-1">
                {t('appeals.resources.doctorTemplate.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-purple-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="/medical-necessity-letter-template.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg w-full justify-center"
              >
                <Download size={18} aria-hidden="true" />
                {t('appeals.resources.doctorTemplate.download')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Pharmacy Guide */}
      <section className="mb-8 rounded-xl border-2 border-indigo-200 overflow-hidden">
        <div className="bg-indigo-100 px-6 py-4 border-b-2 border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-3 rounded-lg">
              <Stethoscope size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-900">{t('appeals.spGuide.title')}</h2>
              <p className="text-indigo-700">{t('appeals.spGuide.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
          <section className="bg-white p-6 rounded-xl border border-indigo-100 mb-8" aria-labelledby="sp-appeal-builder">
            <div className="flex items-center gap-2 mb-4"><FileText className="text-indigo-600" size={24} aria-hidden="true" /><h3 id="sp-appeal-builder" className="text-xl font-bold text-indigo-900">{t('appeals.spGuide.builder.title')}</h3></div>
            <p className="text-sm text-indigo-800 mb-6">{t('appeals.spGuide.builder.intro')}</p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="sp-appeal-name" className="block text-sm font-medium text-indigo-900 mb-1">{t('appeals.spGuide.builder.yourName')}</label>
                <input id="sp-appeal-name" type="text" placeholder={t('appeals.spGuide.builder.yourNamePlaceholder')} autoComplete="name" className="w-full p-3 rounded border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={spAppealName} onChange={(e) => setSpAppealName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="sp-appeal-drug" className="block text-sm font-medium text-indigo-900 mb-1">{t('appeals.spGuide.builder.medicationName')}</label>
                <input id="sp-appeal-drug" type="text" placeholder={t('appeals.spGuide.builder.medicationNamePlaceholder')} className="w-full p-3 rounded border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={spAppealDrug} onChange={(e) => setSpAppealDrug(e.target.value)} />
              </div>
              <div>
                <label htmlFor="sp-appeal-reason" className="block text-sm font-medium text-indigo-900 mb-1">{t('appeals.spGuide.builder.reason')}</label>
                <select id="sp-appeal-reason" className="w-full p-3 rounded border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={spAppealReason} onChange={(e) => setSpAppealReason(e.target.value)}>
                <option value="Financial Hardship">{t('appeals.spGuide.builder.reasonFinancial')}</option>
                <option value="Access Issues">{t('appeals.spGuide.builder.reasonAccess')}</option>
                <option value="Clinical Stability">{t('appeals.spGuide.builder.reasonClinical')}</option>
              </select>
              </div>
            </div>
            <button onClick={generateSpAppealLetter} disabled={!spAppealName || !spAppealDrug} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('appeals.spGuide.builder.generateAria')}>{t('appeals.spGuide.builder.generate')}</button>
            {spGeneratedLetter && (
              <div className="mt-6 bg-white p-4 rounded border border-indigo-200 relative fade-in">
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">{t('appeals.spGuide.builder.preview')}</h4>
                <pre className="whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed border-l-4 border-slate-200 pl-4">{spGeneratedLetter}</pre>
                <button onClick={copySpToClipboard} className="absolute top-4 right-4 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-bold transition" aria-label={t('appeals.spGuide.builder.copyAria')}>{spCopied ? <Check size={14} className="text-green-600" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{spCopied ? t('appeals.letter.copied') : t('appeals.letter.copyText')}</button>
              </div>
            )}
          </section>

          <div className="space-y-8">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">{t('appeals.spGuide.howTo.title')}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <section className="border border-slate-200 rounded-xl p-5 bg-white" aria-labelledby="sp-medicare-appeals"><h4 id="sp-medicare-appeals" className="font-bold text-slate-800 mb-3">{t('appeals.spGuide.howTo.medicare.title')}</h4><p className="text-xs text-slate-600 mb-3">{t('appeals.spGuide.howTo.medicare.note')}</p><ol className="list-decimal pl-4 space-y-2 text-sm text-slate-700"><li><Trans i18nKey="appeals.spGuide.howTo.medicare.step1" /></li><li><Trans i18nKey="appeals.spGuide.howTo.medicare.step2" /></li><li><Trans i18nKey="appeals.spGuide.howTo.medicare.step3" /></li></ol><a href="https://www.medicare.gov/claims-appeals/how-do-i-file-an-appeal" target="_blank" rel="noreferrer" className="block mt-4 text-xs text-blue-600 font-bold uppercase tracking-wide hover:underline" aria-label={t('appeals.spGuide.howTo.medicare.linkAria')}>{t('appeals.spGuide.howTo.medicare.link')}</a></section>
              <section className="border border-slate-200 rounded-xl p-5 bg-white" aria-labelledby="sp-medicaid-appeals"><h4 id="sp-medicaid-appeals" className="font-bold text-slate-800 mb-3">{t('appeals.spGuide.howTo.medicaid.title')}</h4><p className="text-sm text-slate-700 mb-3">{t('appeals.spGuide.howTo.medicaid.text')}</p></section>
              <section className="border border-slate-200 rounded-xl p-5 bg-white" aria-labelledby="sp-private-insurance"><h4 id="sp-private-insurance" className="font-bold text-slate-800 mb-3">{t('appeals.spGuide.howTo.private.title')}</h4><p className="text-sm text-slate-700 mb-3">{t('appeals.spGuide.howTo.private.text')}</p></section>
            </div>
          </div>
        </div>
      </section>

      {/* Encouragement Footer */}
      <footer className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 text-center">
        <Heart size={32} className="text-purple-600 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('appeals.footer.title')}</h2>
        <p className="text-slate-700 max-w-2xl mx-auto">
          {t('appeals.footer.text')}
        </p>
      </footer>
    </article>
  );
}
