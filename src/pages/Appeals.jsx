import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  XCircle
} from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';

export default function Appeals() {
  useMetaTags({
    title: 'Got Denied? Appeal Help for Transplant Patients | TransplantMedicationNavigator',
    description: 'Learn how to appeal insurance denials for transplant medications. Includes step therapy exceptions, generic vs brand guidance, and medical necessity letter templates.',
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
                <span className={`font-semibold text-sm ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>Tip:</span>
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
        Back to Resources & Education
      </Link>

      {/* Page Header - Color coded hero */}
      <header className="mb-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-emerald-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg" aria-hidden="true">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Got Denied? Don't Give Up.</h1>
            <p className="text-emerald-700 font-semibold text-lg mt-1">You can fight back — and WIN!</p>
          </div>
        </div>
        <p className="text-lg text-slate-700 leading-relaxed">
          Insurance says "no" to almost everyone at some point. The good news? <strong>Many people win when they appeal.</strong> This interactive guide shows you how, step by step.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">50%+</div>
            <div className="text-sm text-slate-600">Appeals are won</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">30-60</div>
            <div className="text-sm text-slate-600">Days to appeal</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">Free</div>
            <div className="text-sm text-slate-600">To file an appeal</div>
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
                <p className="font-bold text-slate-800">Free Appeal Guide</p>
                <p className="text-sm text-slate-600">Print-ready guide with checklists & sample letters</p>
              </div>
            </div>
            <a
              href="/appeal-guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Download size={18} aria-hidden="true" />
              Download Free Guide
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Navigation */}
      <nav className="bg-white rounded-xl p-5 mb-8 border-2 border-slate-200 shadow-sm" aria-label="Page sections">
        <p className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <ClipboardList size={20} className="text-slate-600" aria-hidden="true" />
          Click any section to explore:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, whyDenied: true})); document.getElementById('why-denied')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-800 font-semibold hover:bg-red-100 transition text-sm"
          >
            <XCircle size={18} aria-hidden="true" />
            Why Denied?
          </button>
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, stepTherapy: true})); document.getElementById('step-therapy')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border-2 border-amber-200 text-amber-800 font-semibold hover:bg-amber-100 transition text-sm"
          >
            <AlertTriangle size={18} aria-hidden="true" />
            Step Therapy
          </button>
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, generics: true})); document.getElementById('generics')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border-2 border-blue-200 text-blue-800 font-semibold hover:bg-blue-100 transition text-sm"
          >
            <Pill size={18} aria-hidden="true" />
            Generic vs Brand
          </button>
          <button
            onClick={() => { setExpandedSections(prev => ({...prev, howToAppeal: true})); document.getElementById('how-to-appeal')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100 transition text-sm"
          >
            <CheckCircle size={18} aria-hidden="true" />
            How to Appeal
          </button>
        </div>
      </nav>

      {/* Why Medications Get Denied - RED */}
      <SectionHeader
        id="why-denied"
        title="Why Insurance Says No"
        icon={XCircle}
        color="red"
        isExpanded={expandedSections.whyDenied}
        onToggle={() => toggleSection('whyDenied')}
      >
        <p className="text-slate-700 mb-5 text-lg">
          Your denial letter tells you why they said no. Here are the most common reasons:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <DenialReasonCard
            icon={Clock}
            title="Prior Auth Needed"
            description="Your doctor needs to ask permission first before the insurance will cover it."
            color="red"
          />
          <DenialReasonCard
            icon={ClipboardList}
            title="Not on the List"
            description="Your drug isn't on their approved list (called a formulary)."
            color="orange"
          />
          <DenialReasonCard
            icon={AlertTriangle}
            title="Try Something Else First"
            description="They want you to try a cheaper drug first (step therapy)."
            color="yellow"
          />
          <DenialReasonCard
            icon={Pill}
            title="Quantity Limits"
            description="They say you're getting too much of this drug."
            color="purple"
          />
          <DenialReasonCard
            icon={Pill}
            title="Use the Generic"
            description="They want you to use a cheaper generic version."
            color="blue"
          />
        </div>
        <div className="mt-5 p-4 bg-white rounded-lg border-2 border-red-200">
          <p className="text-red-800 font-semibold flex items-center gap-2">
            <Lightbulb size={18} className="text-red-600" aria-hidden="true" />
            Remember: A denial is NOT the final answer. It's just the first "no" — and you can fight it!
          </p>
        </div>
      </SectionHeader>

      {/* Step Therapy Section - AMBER */}
      <SectionHeader
        id="step-therapy"
        title='Step Therapy: "Try This First"'
        icon={AlertTriangle}
        color="amber"
        isExpanded={expandedSections.stepTherapy}
        onToggle={() => toggleSection('stepTherapy')}
      >
        <p className="text-slate-700 mb-5 text-lg">
          <strong>Step therapy</strong> means your insurance wants you to try a cheaper drug before they'll pay for the one your doctor picked. Some people call this "fail first."
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Why it's bad */}
          <div className="bg-white rounded-lg p-5 border-2 border-red-200">
            <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
              <XCircle size={20} className="text-red-600" aria-hidden="true" />
              Why This Can Be Risky
            </h3>
            <ul className="space-y-2">
              {[
                "Anti-rejection drugs need exact blood levels. Small changes matter a lot.",
                "Trying the wrong drug could hurt your transplant.",
                "Your transplant team picked your drug for good reasons.",
                "Switching means more blood tests and doctor visits."
              ].map((item, i) => (
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
              What You Can Do
            </h3>
            <ul className="space-y-2">
              {[
                "You can ask them to skip step therapy.",
                "Transplant drugs often get approved when your doctor explains why.",
                "A letter from your transplant doctor helps a lot.",
                "Many states have laws that protect patients."
              ].map((item, i) => (
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
            Pro Tip: Ask your doctor about "step therapy exception" — they can request this on your behalf!
          </p>
        </div>
      </SectionHeader>

      {/* Generics vs Brand Section - BLUE */}
      <SectionHeader
        id="generics"
        title="Generic vs. Brand Name Drugs"
        icon={Pill}
        color="blue"
        isExpanded={expandedSections.generics}
        onToggle={() => toggleSection('generics')}
      >
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* The Basics */}
          <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-3">The Basics</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Generic drugs have the same main ingredient as brand-name drugs.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                The FDA says they work the same way.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                For most drugs, generics are fine.
              </li>
            </ul>
          </div>

          {/* Why Transplant is Different */}
          <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-3">Why Transplant Drugs Are Different</h3>
            <p className="text-slate-700 mb-3">
              Anti-rejection drugs are special. Even tiny changes can cause problems:
            </p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-red-500">↓</span>
                <strong>Too little:</strong> Your body might reject the transplant
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">↑</span>
                <strong>Too much:</strong> Side effects and toxicity
              </li>
            </ul>
          </div>
        </div>

        {/* When You Might Need Brand Name */}
        <div className="bg-blue-100 rounded-lg p-5 border-2 border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-3">When You Might Need Brand Name</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Your drug levels have been steady on this brand",
              "You had problems when you switched before",
              "Your transplant center requires brand-name",
              "Your body has trouble absorbing the drug"
            ].map((item, i) => (
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
        title="How to Appeal: Step by Step"
        icon={CheckCircle}
        color="emerald"
        isExpanded={expandedSections.howToAppeal}
        onToggle={() => toggleSection('howToAppeal')}
      >
        {/* Progress tracker */}
        <div className="mb-6 bg-white rounded-lg p-4 border-2 border-emerald-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-700">Your Progress</span>
            <span className="text-emerald-600 font-bold">{completedCount} of {totalSteps} steps</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4">
            <div
              className="bg-emerald-500 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 mt-2 italic">
            Click each step when you've completed it to track your progress!
          </p>
        </div>

        <div className="space-y-4">
          <AppealStep
            number={1}
            title="Get It in Writing"
            description="Ask for a letter that says exactly why they said no. You need this to know what to say in your appeal."
            tips="Call the number on your insurance card and ask for a 'written denial letter' or 'explanation of benefits.'"
            isCompleted={completedSteps[1]}
            onToggle={() => toggleStep(1)}
          />
          <AppealStep
            number={2}
            title="Watch the Clock"
            description="You usually have 30 to 60 days to appeal. Mark the date on your calendar. Don't miss it."
            tips="Set a phone reminder 2 weeks before your deadline!"
            isCompleted={completedSteps[2]}
            onToggle={() => toggleStep(2)}
          />
          <AppealStep
            number={3}
            title="Get Your Papers Together"
            description="Ask your transplant team for: a letter from your doctor, your transplant records, recent lab results, and notes about why other drugs won't work."
            tips="Use the letter builder below to help your doctor write a support letter!"
            isCompleted={completedSteps[3]}
            onToggle={() => toggleStep(3)}
          />
          <AppealStep
            number={4}
            title="Send Your Appeal"
            description="Send everything together. Keep copies of everything you send."
            tips="Send by fax or certified mail so you have proof it was received."
            isCompleted={completedSteps[4]}
            onToggle={() => toggleStep(4)}
          />
          <AppealStep
            number={5}
            title="Ask for a Fast Review If You Need It"
            description="If you're going to run out of your medicine soon, ask for an expedited (fast) review. For transplant drugs, this almost always counts as urgent."
            tips="Say 'I need an expedited appeal because running out of my transplant medication is life-threatening.'"
            isCompleted={completedSteps[5]}
            onToggle={() => toggleStep(5)}
          />
          <AppealStep
            number={6}
            title="Know What Comes Next"
            description="If they say no again, you can ask for an external review by someone outside the company. Your state insurance office can also help."
            tips="Don't give up after the first appeal denial — external reviews often overturn decisions!"
            isCompleted={completedSteps[6]}
            onToggle={() => toggleStep(6)}
          />
        </div>

        {completedCount === totalSteps && (
          <div className="mt-6 p-5 bg-emerald-100 rounded-lg border-2 border-emerald-300 text-center">
            <CheckCircle size={40} className="text-emerald-600 mx-auto mb-2" aria-hidden="true" />
            <p className="text-emerald-800 font-bold text-xl">Congratulations! You've completed all the steps!</p>
            <p className="text-emerald-700 mt-2">You're well on your way to winning your appeal. Stay strong!</p>
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
              <h2 className="text-xl font-bold text-purple-900">Write a Letter to Your Doctor</h2>
              <p className="text-purple-700">Ask your doctor to help with your appeal</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-5 border border-purple-200 mb-6">
            <div className="flex items-start gap-3">
              <Heart size={24} className="text-purple-600 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-700 mb-2">
                  <strong>Why write to your doctor?</strong> Your doctor has the medical knowledge to explain why you need your specific medication. A letter of medical necessity from your doctor is often the key to winning an appeal.
                </p>
                <p className="text-slate-600 text-sm">
                  <strong>Note:</strong> Your doctor already has access to a detailed medical necessity letter template. This letter is for <em>you</em> to request their help and provide them with the information they need.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="patient-name" className="block text-base font-bold text-slate-800 mb-2">
                  Your Name
                </label>
                <input
                  id="patient-name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="doctor-name" className="block text-base font-bold text-slate-800 mb-2">
                  Doctor's Name
                </label>
                <input
                  id="doctor-name"
                  type="text"
                  placeholder="e.g., Smith"
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="medication-name" className="block text-base font-bold text-slate-800 mb-2">
                  Medication Name
                </label>
                <input
                  id="medication-name"
                  type="text"
                  placeholder="e.g., Tacrolimus, Prograf"
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="transplant-type" className="block text-base font-bold text-slate-800 mb-2">
                  Transplant Type
                </label>
                <input
                  id="transplant-type"
                  type="text"
                  placeholder="e.g., Kidney, Liver, Heart"
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={transplantType}
                  onChange={(e) => setTransplantType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="transplant-date" className="block text-base font-bold text-slate-800 mb-2">
                  Transplant Date <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="transplant-date"
                  type="text"
                  placeholder="e.g., January 2023"
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={transplantDate}
                  onChange={(e) => setTransplantDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="denial-reason" className="block text-base font-bold text-slate-800 mb-2">
                  Denial Reason <span className="font-normal text-slate-500">(if known)</span>
                </label>
                <input
                  id="denial-reason"
                  type="text"
                  placeholder="e.g., Not on formulary, Step therapy required"
                  className="w-full p-3 text-base rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="additional-info" className="block text-base font-bold text-slate-800 mb-2">
                Additional Information <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="additional-info"
                rows={3}
                placeholder="Any other details that might help your doctor (e.g., previous drug reactions, why you need this specific medication, etc.)"
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
              Generate My Letter
            </button>

            {generatedLetter && (
              <div className="mt-6 bg-white p-6 rounded-xl border-2 border-purple-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                    <Send size={20} aria-hidden="true" />
                    Your Letter to Dr. {doctorName || "[Doctor's Name]"}
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-base font-bold transition"
                  >
                    {copied ? <Check size={18} className="text-green-600" aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-serif text-base text-slate-800 leading-relaxed bg-purple-50 p-5 rounded-lg border-l-4 border-purple-400">
                  {generatedLetter}
                </pre>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm flex items-center gap-2">
                    <Lightbulb size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span><strong>Next step:</strong> Print this letter or email it to your doctor along with a copy of your denial letter.</span>
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
              <h2 className="text-xl font-bold text-emerald-900">Free Downloadable Resources</h2>
              <p className="text-emerald-700">Print these guides to help with your appeal</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Appeal Guide */}
            <div className="bg-white rounded-lg p-5 border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={24} className="text-emerald-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-800">Complete Appeal Guide</h3>
              </div>
              <p className="text-slate-600 mb-4 text-sm">
                Step-by-step instructions, checklists, sample letters, and tips for winning your appeal. Written in plain language.
              </p>
              <ul className="text-sm text-slate-600 mb-4 space-y-1">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" aria-hidden="true" />
                  Printable checklists
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" aria-hidden="true" />
                  Sample appeal letter template
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" aria-hidden="true" />
                  Phone scripts for calling insurance
                </li>
              </ul>
              <a
                href="/appeal-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg w-full justify-center"
              >
                <Download size={18} aria-hidden="true" />
                Download Appeal Guide
              </a>
            </div>

            {/* Doctor's Letter Template */}
            <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <ClipboardList size={24} className="text-purple-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-800">Doctor's Letter Template</h3>
              </div>
              <p className="text-slate-600 mb-4 text-sm">
                Share this with your transplant doctor. A ready-to-use medical necessity letter template they can customize for your appeal.
              </p>
              <ul className="text-sm text-slate-600 mb-4 space-y-1">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-purple-500" aria-hidden="true" />
                  Professional medical format
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-purple-500" aria-hidden="true" />
                  Clinical guideline references
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-purple-500" aria-hidden="true" />
                  Fill-in-the-blank sections
                </li>
              </ul>
              <a
                href="/medical-necessity-letter-template.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg w-full justify-center"
              >
                <Download size={18} aria-hidden="true" />
                Open Doctor's Template
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Encouragement Footer */}
      <footer className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 text-center">
        <Heart size={32} className="text-purple-600 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Remember: You Are Not Alone</h2>
        <p className="text-slate-700 max-w-2xl mx-auto">
          Thousands of transplant patients successfully appeal their denials every year. Your health matters, and you have every right to fight for the medications you need. Stay strong and don't give up!
        </p>
      </footer>
    </article>
  );
}
