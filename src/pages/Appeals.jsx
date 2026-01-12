import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Download, ArrowLeft } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';

export default function Appeals() {
  useMetaTags({
    title: 'Got Denied? Appeal Help for Transplant Patients | TransplantMedicationNavigator',
    description: 'Learn how to appeal insurance denials for transplant medications. Includes step therapy exceptions, generic vs brand guidance, and medical necessity letter templates.',
    keywords: 'insurance appeal, step therapy, prior authorization, transplant medication denial, medical necessity letter'
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link to="/education" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Resources & Education
      </Link>

      {/* Page Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg" aria-hidden="true">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Got Denied? Don't Give Up.</h1>
        </div>
        <p className="text-lg text-slate-600">
          Insurance says "no" to almost everyone at some point. The good news? You can fight back. Many people win when they appeal. This guide shows you how.
        </p>
      </header>

      {/* Quick Links */}
      <nav className="bg-slate-50 rounded-lg p-4 mb-8" aria-label="Page sections">
        <p className="font-semibold text-slate-700 mb-2">On This Page:</p>
        <ul className="space-y-1 text-slate-600">
          <li><a href="#why-denied" className="hover:text-emerald-600">Why Insurance Says No</a></li>
          <li><a href="#step-therapy" className="hover:text-emerald-600">Step Therapy: "Try This First"</a></li>
          <li><a href="#generics" className="hover:text-emerald-600">Generic vs. Brand Name Drugs</a></li>
          <li><a href="#how-to-appeal" className="hover:text-emerald-600">How to Appeal: Step by Step</a></li>
          <li><a href="#letter-template" className="hover:text-emerald-600">Letter Template for Your Doctor</a></li>
        </ul>
      </nav>

      {/* Why Medications Get Denied */}
      <section id="why-denied" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Why Insurance Says No</h2>
        <p className="text-slate-600 mb-4">
          Your denial letter tells you why they said no. Here are the most common reasons:
        </p>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Prior Auth Needed:</span>
            <span className="text-slate-600">Your doctor needs to ask permission first</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Not on the List:</span>
            <span className="text-slate-600">Your drug isn't on their approved list</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Try Something Else First:</span>
            <span className="text-slate-600">They want you to try a cheaper drug first</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Too Much:</span>
            <span className="text-slate-600">They say you're getting too much of this drug</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Use the Generic:</span>
            <span className="text-slate-600">They want you to use a cheaper version</span>
          </li>
        </ul>
      </section>

      {/* Step Therapy Section */}
      <section id="step-therapy" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Step Therapy: "Try This First"</h2>
        <p className="text-slate-600 mb-4">
          <strong>Step therapy</strong> means your insurance wants you to try a cheaper drug before they'll pay for the one your doctor picked. Some people call this "fail first."
        </p>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Why This Can Be Bad for Transplant Patients</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Anti-rejection drugs need to stay at the right level in your blood. Small changes matter a lot.</li>
          <li>Trying the wrong drug could hurt your transplant.</li>
          <li>Your transplant team picked your drug for good reasons.</li>
          <li>Switching drugs means more blood tests and doctor visits.</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">What You Can Do</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>You can ask them to skip step therapy.</li>
          <li>Transplant drugs often get approved when your doctor says you need them.</li>
          <li>A letter from your transplant doctor helps a lot.</li>
          <li>Many states have laws that protect patients from step therapy.</li>
        </ul>
      </section>

      {/* Generics vs Brand Section */}
      <section id="generics" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Generic vs. Brand Name Drugs</h2>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">The Basics</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Generic drugs have the same main ingredient as brand-name drugs.</li>
          <li>The FDA says they work the same way.</li>
          <li>For most drugs, generics are fine.</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Why Transplant Drugs Are Different</h3>
        <p className="text-slate-600 mb-3">
          Anti-rejection drugs are special. Even tiny changes in how much gets into your blood can cause problems:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Too little drug = your body might reject the transplant</li>
          <li>Too much drug = side effects and toxicity</li>
          <li>Switching brands can change how your body absorbs the drug</li>
          <li>Many transplant centers don't allow switches for tacrolimus</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">When You Might Need Brand Name</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Your drug levels have been steady on this brand</li>
          <li>You had problems when you switched before</li>
          <li>Your transplant center requires brand-name</li>
          <li>Your body has trouble absorbing the drug</li>
        </ul>
      </section>

      {/* How to Appeal Section */}
      <section id="how-to-appeal" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Appeal: Step by Step</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 1: Get It in Writing</h3>
            <p className="text-slate-600">Ask for a letter that says exactly why they said no. You need this to know what to say in your appeal.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 2: Watch the Clock</h3>
            <p className="text-slate-600">You usually have 30 to 60 days to appeal. Mark the date on your calendar. Don't miss it.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 3: Get Your Papers Together</h3>
            <p className="text-slate-600 mb-2">Ask your transplant team for:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4">
              <li>A letter from your doctor saying why you need this drug</li>
              <li>Your transplant records</li>
              <li>Recent lab results</li>
              <li>Any records of past rejection or problems</li>
              <li>Notes about why other drugs won't work for you</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 4: Send Your Appeal</h3>
            <p className="text-slate-600">Send everything together. Keep copies of everything you send.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 5: Ask for a Fast Review If You Need It</h3>
            <p className="text-slate-600">If you're going to run out of your medicine soon, ask for a fast review. For transplant drugs, this almost always counts as urgent.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 6: Know What Comes Next</h3>
            <p className="text-slate-600">If they say no again, you can ask someone outside the company to review it. Your state insurance office can also help.</p>
          </div>
        </div>
      </section>

      {/* Letter Template Section */}
      <section id="letter-template" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Letter Template for Your Doctor</h2>
        <p className="text-slate-600 mb-4">
          Give this template to your transplant doctor. They can fill it out and send it with your appeal.
        </p>

        <a
          href="/medical-necessity-letter-template.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
        >
          <Download size={20} aria-hidden="true" />
          Open Letter Template (Print to PDF)
        </a>
      </section>

    </article>
  );
}
