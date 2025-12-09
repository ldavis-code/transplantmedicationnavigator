/**
 * Medication Assistant Chat Component
 * AI-powered chatbot that guides transplant patients to medication assistance programs
 * Integrates with Claude API and Neon PostgreSQL database
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, X, Send, HeartHandshake, Check, Search,
  ChevronRight, Loader2, Pill, ExternalLink, RefreshCw,
  User, Building2, Stethoscope, Heart, AlertCircle, Printer
} from 'lucide-react';

// Question flow configuration
const QUESTIONS = [
  {
    id: 'role',
    question: "Hi! I'm here to help you find medication assistance. First, who am I helping today?",
    type: 'single',
    options: [
      { value: 'patient', label: 'Patient', icon: User, description: "I'm the transplant patient" },
      { value: 'carepartner', label: 'Carepartner / Family', icon: Heart, description: "I'm helping a loved one" },
      { value: 'social_worker', label: 'Social Worker / Coordinator', icon: Building2, description: "I'm a healthcare professional" },
    ],
  },
  {
    id: 'transplant_stage',
    question: "Where are you in the transplant process?",
    type: 'single',
    options: [
      { value: 'pre', label: 'Pre-transplant', description: 'On the waitlist or in evaluation' },
      { value: 'post_1yr', label: 'Post-transplant (< 1 year)', description: 'Within the first year' },
      { value: 'post_1yr_plus', label: 'Post-transplant (1+ years)', description: 'More than a year post-transplant' },
    ],
  },
  {
    id: 'organ_type',
    question: "What type of transplant?",
    type: 'single',
    options: [
      { value: 'kidney', label: 'Kidney' },
      { value: 'liver', label: 'Liver' },
      { value: 'heart', label: 'Heart' },
      { value: 'lung', label: 'Lung' },
      { value: 'pancreas', label: 'Pancreas' },
      { value: 'multi', label: 'Multi-organ' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'insurance_type',
    question: "What's your primary insurance? This determines which programs you're eligible for.",
    type: 'single',
    options: [
      { value: 'commercial', label: 'Commercial / Employer', description: 'Private insurance through work or marketplace', hint: '✓ Copay cards available!' },
      { value: 'medicare', label: 'Medicare', description: 'Federal program (65+ or disability)', hint: 'Foundations & PAPs available' },
      { value: 'medicaid', label: 'Medicaid', description: 'State program based on income', hint: 'Usually well covered' },
      { value: 'tricare_va', label: 'TRICARE / VA', description: 'Military or veterans benefits' },
      { value: 'ihs', label: 'Indian Health Service', description: 'Tribal health programs' },
      { value: 'uninsured', label: 'Uninsured / Self-pay', description: 'No current insurance', hint: 'PAPs can provide FREE meds' },
    ],
  },
  {
    id: 'medication',
    question: "Which medication do you need help with?",
    type: 'medication_search',
    allowSkip: true,
    skipLabel: "I'm not sure / Show all options",
  },
  {
    id: 'cost_burden',
    question: "How would you describe your current medication costs?",
    type: 'single',
    options: [
      { value: 'manageable', label: 'Manageable', description: "I can afford my medications" },
      { value: 'challenging', label: 'Challenging', description: "It's tight, but I manage" },
      { value: 'unaffordable', label: 'Unaffordable', description: "I struggle to pay for meds" },
      { value: 'crisis', label: 'Crisis', description: "I've skipped or rationed doses", urgent: true },
    ],
  },
];

const MedicationAssistantChat = () => {
  // Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Conversation state
  const [conversationId, setConversationId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  // Medication search state
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationResults, setMedicationResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedications, setSelectedMedications] = useState([]);

  // Free text input
  const [inputValue, setInputValue] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // Initialize the chat session
  const initializeChat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setConversationId(data.conversationId);
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      // Fallback to local welcome message
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Hi! I'm your Medication Navigator. I'll help you find assistance programs for your transplant medications. Let's get started!\n\nFirst, who am I helping today?",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = async (option) => {
    const question = QUESTIONS[currentQuestionIndex];

    // Add user's selection to messages
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: option.label,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Update answers
    const newAnswers = { ...answers, [question.id]: option.value };
    setAnswers(newAnswers);

    // Check if this is the last question
    if (currentQuestionIndex >= QUESTIONS.length - 1) {
      await generateResults(newAnswers);
    } else {
      // Move to next question
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'answer',
            conversationId,
            questionId: question.id,
            answer: option.value,
            answers: newAnswers,
          }),
        });

        const data = await response.json();

        // Add assistant response
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: data.message || QUESTIONS[currentQuestionIndex + 1]?.question || '',
            timestamp: new Date(),
          }]);
          setCurrentQuestionIndex(prev => prev + 1);
          setIsLoading(false);
        }, 300);
      } catch (err) {
        console.error('Failed to process answer:', err);
        // Fallback - just show next question
        setTimeout(() => {
          const nextQ = QUESTIONS[currentQuestionIndex + 1];
          if (nextQ) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              role: 'assistant',
              content: nextQ.question,
              timestamp: new Date(),
            }]);
          }
          setCurrentQuestionIndex(prev => prev + 1);
          setIsLoading(false);
        }, 300);
      }
    }
  };

  // Search medications from database
  const searchMedications = async (query) => {
    if (!query || query.length < 2) {
      setMedicationResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchMedications',
          query,
        }),
      });

      const data = await response.json();
      setMedicationResults(data.medications || []);
    } catch (err) {
      console.error('Medication search failed:', err);
      setMedicationResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced medication search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (medicationSearch) {
        searchMedications(medicationSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [medicationSearch]);

  // Handle medication selection - add to list
  const handleMedicationSelect = (medication) => {
    // Check if already selected
    if (selectedMedications.find(m => m.id === medication.id)) {
      return;
    }
    setSelectedMedications(prev => [...prev, medication]);
    setMedicationSearch('');
    setMedicationResults([]);
  };

  // Remove a medication from selection
  const handleMedicationRemove = (medicationId) => {
    setSelectedMedications(prev => prev.filter(m => m.id !== medicationId));
  };

  // Proceed with selected medications
  const handleMedicationsContinue = () => {
    if (selectedMedications.length === 0) {
      // Skip - show general options
      handleOptionSelect({ value: 'general', label: 'General assistance (no specific medication)' });
    } else {
      // Pass medication IDs as comma-separated string or array
      const medIds = selectedMedications.map(m => m.id);
      const medLabels = selectedMedications.map(m => `${m.brand_name} (${m.generic_name})`).join(', ');
      handleOptionSelect({
        value: medIds.length === 1 ? medIds[0] : medIds,
        label: medLabels,
      });
    }
    setSelectedMedications([]);
    setMedicationSearch('');
    setMedicationResults([]);
  };

  // Generate final results with Claude API
  const generateResults = async (finalAnswers) => {
    setIsLoading(true);
    setIsComplete(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateResults',
          conversationId,
          answers: finalAnswers,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add the AI-generated response with programs grouped by medication
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: data.message,
        programs: data.programs,
        medicationPrograms: data.medicationPrograms, // Programs grouped by medication
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Failed to generate results:', err);
      setError('Sorry, I had trouble finding programs. Please try again.');

      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to our database right now. Please try again in a moment, or visit our Resources page to browse assistance programs manually.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle free text input
  const handleTextSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'freeText',
          conversationId,
          message: inputValue,
          answers,
        }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Failed to process message:', err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that. Please try selecting from the options above, or ask your question again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset chat
  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
    setError(null);
    setMedicationSearch('');
    setMedicationResults([]);
    setSelectedMedications([]);
    setTimeout(initializeChat, 100);
  };

  // Print action plan
  const printActionPlan = () => {
    // Get the last message with programs (the results message)
    const resultsMessage = messages.find(m => m.medicationPrograms || m.programs);
    if (!resultsMessage) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print your action plan');
      return;
    }

    // Generate programs HTML - grouped by medication if available
    let programsHtml = '';

    if (resultsMessage.medicationPrograms && resultsMessage.medicationPrograms.length > 0) {
      // Programs grouped by medication
      programsHtml = resultsMessage.medicationPrograms.map(medGroup => `
        <div style="border: 2px solid #334155; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 12px 16px; border-bottom: 1px solid #cbd5e1;">
            <h3 style="margin: 0; color: #1e293b; font-size: 18px;">💊 ${medGroup.medication_name}</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">${medGroup.generic_name}${medGroup.cost_plus_available ? ' • Available on Cost Plus Drugs' : ''}</p>
          </div>
          <div style="padding: 16px;">
            ${medGroup.programs && medGroup.programs.length > 0 ? medGroup.programs.map(program => `
              <div style="border: 1px solid #10b981; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #ecfdf5;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                  <strong style="color: #065f46;">${program.program_name}</strong>
                  ${program.program_type ? `<span style="background: #a7f3d0; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                    ${program.program_type === 'copay_card' ? 'Copay Card' : ''}
                    ${program.program_type === 'pap' ? 'Free Meds' : ''}
                    ${program.program_type === 'foundation' ? 'Foundation' : ''}
                    ${program.program_type === 'discount_pharmacy' ? 'Discount' : ''}
                    ${program.program_type === 'discount_card' ? 'Discount' : ''}
                  </span>` : ''}
                </div>
                ${program.max_benefit ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Benefit:</strong> ${program.max_benefit}</p>` : ''}
                ${program.eligibility_summary ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Eligibility:</strong> ${program.eligibility_summary}</p>` : ''}
                ${program.income_limit ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Income Limit:</strong> ${program.income_limit}</p>` : ''}
                ${program.application_url ? `<p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Apply Here:</strong> <a href="${program.application_url}" style="color: #059669; word-break: break-all;">${program.application_url}</a></p>` : ''}
              </div>
            `).join('') : '<p style="color: #64748b; font-style: italic;">No specific programs found. Contact your transplant center social worker.</p>'}
          </div>
        </div>
      `).join('');
    } else if (resultsMessage.programs && resultsMessage.programs.length > 0) {
      // Flat programs list (fallback)
      programsHtml = resultsMessage.programs.map(program => `
        <div style="border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #ecfdf5;">
          <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 16px;">${program.program_name}</h3>
          ${program.program_type ? `<span style="background: #a7f3d0; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
            ${program.program_type === 'copay_card' ? 'Copay Card' : ''}
            ${program.program_type === 'pap' ? 'Patient Assistance (Free Meds)' : ''}
            ${program.program_type === 'foundation' ? 'Foundation' : ''}
            ${program.program_type === 'discount_pharmacy' ? 'Discount Pharmacy' : ''}
            ${program.program_type === 'discount_card' ? 'Discount Card' : ''}
          </span>` : ''}
          ${program.max_benefit ? `<p style="margin: 8px 0 4px 0; font-size: 14px;"><strong>Benefit:</strong> ${program.max_benefit}</p>` : ''}
          ${program.eligibility_summary ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Eligibility:</strong> ${program.eligibility_summary}</p>` : ''}
          ${program.income_limit ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Income Limit:</strong> ${program.income_limit}</p>` : ''}
          ${program.application_url ? `<p style="margin: 8px 0 0 0;"><strong>Apply:</strong> <a href="${program.application_url}" style="color: #059669;">${program.application_url}</a></p>` : ''}
        </div>
      `).join('');
    }

    const profileHtml = `
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #334155;">Your Profile</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Insurance:</strong> ${answers.insurance_type || 'Not specified'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Transplant Stage:</strong> ${answers.transplant_stage || 'Not specified'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Organ Type:</strong> ${answers.organ_type || 'Not specified'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Medication(s):</strong> ${
          messages.find(m => m.role === 'user' && messages.indexOf(m) > 3)?.content || 'Not specified'
        }</p>
      </div>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medication Assistance Action Plan - TransplantMedicationNavigator.com</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; }
          h1 { color: #065f46; border-bottom: 2px solid #10b981; padding-bottom: 12px; }
          h2 { color: #334155; margin-top: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .date { color: #64748b; font-size: 14px; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Medication Assistance Action Plan</h1>
          <span class="date">Generated: ${new Date().toLocaleDateString()}</span>
        </div>

        ${profileHtml}

        <h2>Recommended Programs</h2>
        <p style="color: #64748b; margin-bottom: 16px;">Based on your profile, here are the assistance programs you may qualify for. Click the links to apply.</p>

        ${programsHtml}

        <h2>Next Steps</h2>
        <ol style="line-height: 1.8;">
          <li>Start with the programs marked as your best options for your insurance type</li>
          <li>Gather required documents: proof of income, insurance card, prescription</li>
          <li>Apply to multiple programs - you can use more than one!</li>
          <li>Contact your transplant center social worker for additional help</li>
          <li>If in crisis, call programs directly - many have expedited processing</li>
        </ol>

        <div class="footer">
          <p>Generated by TransplantMedicationNavigator.com</p>
          <p>This is not medical advice. Always consult with your healthcare team about your medications.</p>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Render message content with markdown-like formatting
  const renderMessageContent = (content) => {
    if (!content) return null;

    // Split by newlines and process
    const lines = content.split('\n');

    return lines.map((line, i) => {
      // Bold text
      let processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Links
      processedLine = processedLine.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline">$1</a>'
      );

      if (line.startsWith('### ')) {
        return <h3 key={i} className="font-bold text-lg mt-4 mb-2 text-slate-900">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="font-bold text-xl mt-4 mb-2 text-slate-900">{line.slice(3)}</h2>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: processedLine.slice(2) }} />
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="ml-4 mb-1 list-decimal" dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    });
  };

  // Render current question options
  const renderQuestionOptions = () => {
    if (isComplete || isLoading) return null;

    const question = QUESTIONS[currentQuestionIndex];
    if (!question) return null;

    // Medication search
    if (question.type === 'medication_search') {
      return (
        <div className="p-3 bg-slate-50 rounded-xl space-y-3">
          {/* Selected medications */}
          {selectedMedications.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Selected Medications:</div>
              <div className="flex flex-wrap gap-2">
                {selectedMedications.map((med) => (
                  <span
                    key={med.id}
                    className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                  >
                    {med.brand_name}
                    <button
                      onClick={() => handleMedicationRemove(med.id)}
                      className="hover:bg-emerald-200 rounded-full p-0.5"
                      aria-label={`Remove ${med.brand_name}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={medicationSearch}
              onChange={(e) => setMedicationSearch(e.target.value)}
              placeholder={selectedMedications.length > 0 ? "Add another medication..." : "Type medication name (e.g., Tacrolimus, Prograf)..."}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={18} />
            )}
          </div>

          {/* Show database results if any */}
          {medicationResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
              {medicationResults.map((med) => {
                const isSelected = selectedMedications.find(m => m.id === med.id);
                return (
                  <button
                    key={med.id}
                    onClick={() => handleMedicationSelect(med)}
                    disabled={isSelected}
                    className={`w-full text-left p-3 border-b border-slate-100 last:border-b-0 transition ${
                      isSelected ? 'bg-emerald-50 opacity-50' : 'hover:bg-emerald-50'
                    }`}
                  >
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      {med.brand_name}
                      {isSelected && <Check size={16} className="text-emerald-600" />}
                    </div>
                    <div className="text-sm text-slate-500">{med.generic_name} • {med.category}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Use typed medication name if no DB results */}
          {medicationSearch && medicationSearch.length >= 2 && medicationResults.length === 0 && !isSearching && (
            <button
              onClick={() => {
                handleMedicationSelect({ id: medicationSearch, brand_name: medicationSearch, generic_name: 'Custom entry' });
              }}
              className="w-full text-left p-3 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition"
            >
              <div className="font-medium text-emerald-700">Add "{medicationSearch}"</div>
              <div className="text-sm text-slate-500">Add this medication to your list</div>
            </button>
          )}

          {/* Continue button when medications selected */}
          {selectedMedications.length > 0 && (
            <button
              onClick={handleMedicationsContinue}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              Continue with {selectedMedications.length} medication{selectedMedications.length > 1 ? 's' : ''}
              <ChevronRight size={18} />
            </button>
          )}

          {/* Skip option */}
          {question.allowSkip && selectedMedications.length === 0 && (
            <button
              onClick={() => handleOptionSelect({ value: 'general', label: 'General assistance (no specific medication)' })}
              className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="font-medium text-slate-700">{question.skipLabel || 'Skip this step'}</div>
              <div className="text-sm text-slate-500">Show general assistance programs</div>
            </button>
          )}
        </div>
      );
    }

    // Single select options
    return (
      <div className="p-3 bg-slate-50 rounded-xl space-y-2">
        {question.options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                option.urgent
                  ? 'border-red-200 hover:border-red-400 hover:bg-red-50'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {Icon && (
                  <div className={`p-2 rounded-lg ${option.urgent ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    <Icon size={18} className={option.urgent ? 'text-red-600' : 'text-emerald-600'} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    {option.label}
                    {option.hint && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {option.hint}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <div className="text-sm text-slate-500 mt-0.5">{option.description}</div>
                  )}
                </div>
                <ChevronRight size={18} className="text-slate-400 mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center gap-2 group hover:scale-105"
          aria-label="Open medication assistance chat"
        >
          <MessageCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
            Need help with medication costs?
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-[420px] h-[85vh] sm:h-[650px] max-h-[700px] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-5"
          role="dialog"
          aria-modal="true"
          aria-label="Medication assistance chat"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Medication Navigator</h2>
                <p className="text-xs text-emerald-100">Find assistance programs</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(messages.length > 1 || isComplete) && (
                <button
                  onClick={resetChat}
                  className="hover:bg-white/20 p-2 rounded-lg transition"
                  aria-label="Start over"
                  title="Start over"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {renderMessageContent(message.content)}
                  </div>

                  {/* Render programs grouped by medication */}
                  {message.medicationPrograms && message.medicationPrograms.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {message.medicationPrograms.map((medGroup, medIdx) => (
                        <div key={medIdx} className="border border-slate-300 rounded-xl overflow-hidden">
                          {/* Medication Header */}
                          <div className="bg-slate-100 px-3 py-2 border-b border-slate-300">
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <Pill size={16} className="text-emerald-600" />
                              {medGroup.medication_name}
                              {medGroup.cost_plus_available && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  Cost Plus Available
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{medGroup.generic_name}</div>
                          </div>

                          {/* Programs for this medication */}
                          <div className="p-2 space-y-2">
                            {medGroup.programs && medGroup.programs.length > 0 ? (
                              medGroup.programs.map((program, idx) => (
                                <div
                                  key={idx}
                                  className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-emerald-800 text-sm">
                                      {program.program_name}
                                    </div>
                                    {program.program_type && (
                                      <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {program.program_type === 'copay_card' && 'Copay Card'}
                                        {program.program_type === 'pap' && 'Free Meds'}
                                        {program.program_type === 'foundation' && 'Foundation'}
                                        {program.program_type === 'discount_pharmacy' && 'Discount'}
                                        {program.program_type === 'discount_card' && 'Discount'}
                                      </span>
                                    )}
                                  </div>
                                  {program.max_benefit && (
                                    <div className="text-xs text-emerald-700 mt-1">
                                      <strong>Benefit:</strong> {program.max_benefit}
                                    </div>
                                  )}
                                  {program.eligibility_summary && (
                                    <div className="text-xs text-slate-600 mt-1">
                                      <strong>Eligibility:</strong> {program.eligibility_summary}
                                    </div>
                                  )}
                                  {program.income_limit && (
                                    <div className="text-xs text-slate-600 mt-1">
                                      <strong>Income Limit:</strong> {program.income_limit}
                                    </div>
                                  )}
                                  {program.application_url && (
                                    <a
                                      href={program.application_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg mt-2 font-medium transition"
                                    >
                                      {program.program_type === 'discount_pharmacy' ? 'Check Prices' :
                                       program.program_type === 'pap' ? 'Apply for Free Meds' :
                                       program.program_type === 'foundation' ? 'Check Fund Status' :
                                       'Apply Now'} <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-slate-500 p-2">
                                No specific programs found in our database. Contact your transplant center social worker for assistance.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback: Render flat programs list if no medicationPrograms */}
                  {(!message.medicationPrograms || message.medicationPrograms.length === 0) && message.programs && message.programs.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.programs.map((program, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-emerald-800 flex items-center gap-2">
                              <Pill size={16} className="flex-shrink-0" />
                              {program.program_name}
                            </div>
                            {program.program_type && (
                              <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {program.program_type === 'copay_card' && 'Copay Card'}
                                {program.program_type === 'pap' && 'Free Meds'}
                                {program.program_type === 'foundation' && 'Foundation'}
                                {program.program_type === 'discount_pharmacy' && 'Discount'}
                                {program.program_type === 'discount_card' && 'Discount'}
                              </span>
                            )}
                          </div>
                          {program.max_benefit && (
                            <div className="text-sm text-emerald-700 mt-1">
                              <strong>Benefit:</strong> {program.max_benefit}
                            </div>
                          )}
                          {program.application_url && (
                            <a
                              href={program.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg mt-2 font-medium transition"
                            >
                              {program.program_type === 'discount_pharmacy' ? 'Check Prices' :
                               program.program_type === 'pap' ? 'Apply for Free Meds' :
                               program.program_type === 'foundation' ? 'Check Fund Status' :
                               'Apply Now'} <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Finding the best options for you...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Question options */}
            {!isLoading && !isComplete && messages.length > 0 && renderQuestionOptions()}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
            {isComplete ? (
              <div className="space-y-2">
                <button
                  onClick={printActionPlan}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Printer size={18} />
                  Print Action Plan
                </button>
                <button
                  onClick={resetChat}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw size={18} />
                  Start New Search
                </button>
                <a
                  href="/medications"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition block text-center"
                >
                  <Search size={18} />
                  Browse All Medications
                </a>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder="Or type a question..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationAssistantChat;
