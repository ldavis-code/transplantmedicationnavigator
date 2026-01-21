/**
 * Demo Landing Page
 *
 * Professional landing page for B2B/enterprise demo access.
 * Activates demo mode and guides users through the product.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Play, Monitor, CheckCircle, ArrowRight, Building2, Users,
  TrendingUp, Shield, Sparkles, Clock, Target, Zap, Heart,
  Calculator, Calendar, FileText, MessageCircle
} from 'lucide-react';
import { useDemoMode } from '../context/DemoModeContext';

const Demo = () => {
  const { startDemoMode, isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const { demoType } = useParams(); // Optional: /demo/enterprise, /demo/partner
  const [isStarting, setIsStarting] = useState(false);

  // Activate demo mode when page loads
  useEffect(() => {
    const type = demoType || 'enterprise';
    startDemoMode(type);
  }, [demoType, startDemoMode]);

  const handleStartDemo = (path) => {
    setIsStarting(true);
    // Small delay for visual feedback
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const demoFeatures = [
    {
      icon: Target,
      title: 'My Path Quiz',
      description: 'Personalized medication assistance recommendations based on patient profile',
      path: '/wizard',
      highlight: true,
    },
    {
      icon: Calculator,
      title: 'Savings Calculator',
      description: 'Estimate potential savings across different assistance programs',
      path: '/savings-tracker',
    },
    {
      icon: FileText,
      title: 'At the Pharmacy Counter',
      description: 'Search 100+ transplant medications with assistance program details',
      path: '/pharmacy',
    },
    {
      icon: Calendar,
      title: 'Copay Reminders',
      description: 'Never miss copay card renewals or PAP reapplication deadlines',
      path: '/copay-reminders',
    },
    {
      icon: Heart,
      title: 'My Medications',
      description: 'Track personal medication lists with cost information',
      path: '/my-medications',
    },
    {
      icon: MessageCircle,
      title: 'AI Assistant',
      description: 'Get instant answers about medication assistance programs',
      path: '/wizard',
      note: 'Available in bottom-right corner',
    },
  ];

  const enterpriseValue = [
    {
      icon: TrendingUp,
      title: 'Reduce Non-Adherence',
      stat: '25-30%',
      description: 'of transplant patients are non-adherent due to cost barriers',
    },
    {
      icon: Shield,
      title: 'Protect Organ Investment',
      stat: '$500K+',
      description: 'average cost of a transplant that medication non-adherence risks',
    },
    {
      icon: Users,
      title: 'Support Patients',
      stat: '100+',
      description: 'medications with assistance program pathways mapped',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Monitor size={18} />
              <span className="text-sm font-medium">Enterprise Demo</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transplant Medication Navigator
            </h1>

            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
              Help your transplant patients find affordable medications and reduce
              the #1 cause of preventable graft loss: medication non-adherence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleStartDemo('/wizard')}
                disabled={isStarting}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isStarting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-purple-700/30 border-t-purple-700 rounded-full animate-spin" />
                    Starting Demo...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Start Interactive Demo
                  </>
                )}
              </button>

              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
              >
                View Pricing
                <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-purple-200 text-sm mt-4">
              <Clock size={14} className="inline mr-1" />
              Demo access: 4 hours with all Pro features unlocked
            </p>
          </div>
        </div>
      </div>

      {/* Value Props for Enterprise */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
          Why Transplant Programs Choose Us
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {enterpriseValue.map((item, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl mb-4">
                <item.icon size={32} />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{item.stat}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
            Explore the Platform
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Click any feature below to try it out. All Pro features are unlocked during this demo.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={() => handleStartDemo(feature.path)}
                className={`text-left p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 border-2 ${
                  feature.highlight
                    ? 'border-purple-300 ring-2 ring-purple-100'
                    : 'border-transparent hover:border-purple-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    feature.highlight
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <feature.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      {feature.highlight && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Start Here
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
                    {feature.note && (
                      <p className="text-xs text-slate-400 mt-2 italic">{feature.note}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-purple-100">
          <Sparkles className="mx-auto text-purple-600 mb-4" size={32} />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Support Your Transplant Patients?
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Schedule a call to discuss enterprise pricing, white-label options,
            and integration with your transplant program.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/pricing#transplant-programs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow transition"
            >
              <Building2 size={18} />
              Enterprise Solutions
            </Link>

            <a
              href="mailto:info@transplantmedicationnavigator.com?subject=Enterprise Demo Follow-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow border border-slate-200 transition"
            >
              Contact Sales
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-slate-500 pb-8">
        <p>
          This demo uses sample data. Patient information entered during the demo
          is stored locally and not transmitted to any server.
        </p>
      </div>
    </div>
  );
};

export default Demo;
