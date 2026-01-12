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
          <div className="bg-rose-100 text-rose-600 p-3 rounded-lg" aria-hidden="true">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Got Denied? Don't Give Up.</h1>
        </div>
        <p className="text-lg text-slate-600">
          Insurance denials happen to almost everyone. The good news? Many denials are overturned on appeal. This guide walks you through the process.
        </p>
      </header>

      {/* Quick Links */}
      <nav className="bg-slate-50 rounded-lg p-4 mb-8" aria-label="Page sections">
        <p className="font-semibold text-slate-700 mb-2">On This Page:</p>
        <ul className="space-y-1 text-slate-600">
          <li><a href="#why-denied" className="hover:text-emerald-600">Why Medications Get Denied</a></li>
          <li><a href="#step-therapy" className="hover:text-emerald-600">Step Therapy (Fail First) Explained</a></li>
          <li><a href="#generics" className="hover:text-emerald-600">Generics vs. Brand Name</a></li>
          <li><a href="#how-to-appeal" className="hover:text-emerald-600">How to Appeal: Step by Step</a></li>
          <li><a href="#letter-template" className="hover:text-emerald-600">Medical Necessity Letter Template</a></li>
        </ul>
      </nav>

      {/* Why Medications Get Denied */}
      <section id="why-denied" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Why Medications Get Denied</h2>
        <p className="text-slate-600 mb-4">
          Understanding why you were denied is the first step to fighting back. Check your denial letter for the specific reason. Common ones include:
        </p>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Prior Authorization Required:</span>
            <span className="text-slate-600">Your insurer needs approval from your doctor before covering the medication</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Not on Formulary:</span>
            <span className="text-slate-600">The medication isn't on your plan's approved drug list</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Step Therapy Required:</span>
            <span className="text-slate-600">Your insurer wants you to try a cheaper drug first</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Quantity Limits:</span>
            <span className="text-slate-600">Your insurer limits how much of the medication you can get</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-slate-800 min-w-fit">Generic Required:</span>
            <span className="text-slate-600">Your insurer wants you to take a generic instead of brand-name</span>
          </li>
        </ul>
      </section>

      {/* Step Therapy Section */}
      <section id="step-therapy" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Step Therapy: What It Is and Why It's Dangerous</h2>
        <p className="text-slate-600 mb-4">
          <strong>Step therapy</strong> (also called "fail first") is when your insurance requires you to try a cheaper medication before they'll cover the one your transplant team prescribed.
        </p>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Why This Is Risky for Transplant Patients</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Immunosuppressants have a narrow therapeutic index—small changes in blood levels matter</li>
          <li>"Failing" on the wrong medication could mean rejection</li>
          <li>Your transplant team chose your medication for specific clinical reasons</li>
          <li>Switching medications requires extra blood monitoring and clinic visits</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Your Rights</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>You can request a step therapy exception</li>
          <li>Transplant medications often qualify for medical necessity override</li>
          <li>Your transplant physician's letter carries significant weight</li>
          <li>Many states have step therapy reform laws protecting patients</li>
        </ul>
      </section>

      {/* Generics vs Brand Section */}
      <section id="generics" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Generics vs. Brand Name: The Transplant Exception</h2>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">The Basics</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Generic medications must have the same active ingredient as the brand</li>
          <li>FDA considers them "therapeutically equivalent"</li>
          <li>For most medications, generics work just fine</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">The Transplant Exception</h3>
        <p className="text-slate-600 mb-3">
          Immunosuppressants are different. Many are classified as <strong>narrow therapeutic index (NTI)</strong> drugs, meaning:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Small differences in blood levels can cause rejection or toxicity</li>
          <li>Switching between formulations can affect absorption</li>
          <li>Many transplant centers don't allow generic tacrolimus switches</li>
          <li>Clinical guidelines (KDIGO, ISHLT) support maintaining brand consistency</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">When Brand May Be Medically Necessary</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>Your levels have been stable on a specific formulation</li>
          <li>You've had problems with generic switches before</li>
          <li>Your center's protocol requires brand-name</li>
          <li>You have documented absorption issues</li>
        </ul>
      </section>

      {/* How to Appeal Section */}
      <section id="how-to-appeal" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Appeal: Step by Step</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 1: Get the Denial in Writing</h3>
            <p className="text-slate-600">Request a written explanation that includes the specific reason for denial and the clinical criteria used. You need this to know what to address in your appeal.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 2: Note Your Deadline</h3>
            <p className="text-slate-600">Appeal deadlines are strict—often 30-60 days from the denial date. Mark your calendar and don't miss it.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 3: Gather Documentation</h3>
            <p className="text-slate-600 mb-2">Work with your transplant team to collect:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4">
              <li>Letter of medical necessity from your transplant physician</li>
              <li>Your transplant history and current medication regimen</li>
              <li>Lab results showing blood levels, kidney/liver function</li>
              <li>Any rejection history or adverse events</li>
              <li>Documentation of why alternatives won't work</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 4: File the Appeal</h3>
            <p className="text-slate-600">Submit your appeal with all documentation. Keep copies of everything you send.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 5: Request Expedited Review If Urgent</h3>
            <p className="text-slate-600">If you'll run out of medication before a standard appeal is processed, request expedited/urgent review. For transplant immunosuppressants, this is almost always medically justified.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 6: Know Your Next Steps</h3>
            <p className="text-slate-600">If your internal appeal is denied, you can usually request an external review by an independent third party. Your state insurance commissioner's office can also help.</p>
          </div>
        </div>
      </section>

      {/* Letter Template Section */}
      <section id="letter-template" className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Medical Necessity Letter Template</h2>
        <p className="text-slate-600 mb-4">
          Use this template with your transplant physician. They can customize it for your specific situation and submit it with your appeal.
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
