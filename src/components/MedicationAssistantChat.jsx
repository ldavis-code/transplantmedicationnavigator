/**
 * Medication Assistant Chat Component
 * A conversational AI chatbot that guides transplant patients to medication assistance programs
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageCircle, X, Send, HeartHandshake, Check, Search, ChevronRight,
  ArrowLeft, Loader2, Pill, ExternalLink, RefreshCw, Sparkles, CheckCircle2
} from 'lucide-react';
import Fuse from 'fuse.js';

import MEDICATIONS_DATA from '../data/medications.json';
import {
  getChatQuestions,
  generateGuidanceSummary,
  formatGuidanceAsMessages,
} from '../lib/chatbotGuidance.js';

// Fuse.js configuration for medication search
const fuseOptions = {
  keys: ['brandName', 'genericName'],
  threshold: 0.3,
  includeScore: true,
};

const MedicationAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const questions = useMemo(() => getChatQuestions(), []);

  // Fuse instance for medication search
  const fuse = useMemo(() => new Fuse(MEDICATIONS_DATA, fuseOptions), []);

  // Filtered medications based on search
  const filteredMedications = useMemo(() => {
    if (!medicationSearch.trim()) {
      // Group by category when not searching
      return MEDICATIONS_DATA.slice(0, 20);
    }
    return fuse.search(medicationSearch).map(result => result.item).slice(0, 15);
  }, [medicationSearch, fuse]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          id: 1,
          type: 'assistant',
          text: "Hi! I'm your Medication Navigator assistant. I'll help you find the best assistance programs for your transplant medications.\n\nLet me ask you a few quick questions to personalize your recommendations.",
          timestamp: new Date(),
        }]);
        setIsTyping(false);

        // Show first question after brief delay
        setTimeout(() => {
          addQuestionMessage(0);
        }, 800);
      }, 600);
    }
  }, [isOpen]);

  // Add a question message to the chat
  const addQuestionMessage = (questionIndex) => {
    if (questionIndex >= questions.length) {
      generateResults();
      return;
    }

    const question = questions[questionIndex];
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'question',
        questionIndex,
        question: question.question,
        subtitle: question.subtitle,
        helpText: question.helpText,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
      setCurrentQuestion(questionIndex);
    }, 500);
  };

  // Handle single-select answer
  const handleSingleSelect = (option) => {
    const question = questions[currentQuestion];

    // Add user's selection as a message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: `${option.icon || ''} ${option.label}`,
      timestamp: new Date(),
    }]);

    // Update answers
    const newAnswers = { ...answers, [question.key]: option.value };
    setAnswers(newAnswers);

    // Move to next question
    setTimeout(() => {
      addQuestionMessage(currentQuestion + 1);
    }, 300);
  };

  // Handle multi-select toggle
  const handleMultiSelect = (option) => {
    const question = questions[currentQuestion];
    const currentSelections = answers[question.key] || [];

    let newSelections;
    if (currentSelections.includes(option.value)) {
      newSelections = currentSelections.filter(v => v !== option.value);
    } else {
      newSelections = [...currentSelections, option.value];
    }

    setAnswers({ ...answers, [question.key]: newSelections });
  };

  // Confirm multi-select and move to next question
  const confirmMultiSelect = () => {
    const question = questions[currentQuestion];
    const selections = answers[question.key] || [];

    if (selections.length === 0) return;

    // Add user's selection as a message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: selections.join(', '),
      timestamp: new Date(),
    }]);

    // Move to next question
    setTimeout(() => {
      addQuestionMessage(currentQuestion + 1);
    }, 300);
  };

  // Handle medication selection
  const toggleMedication = (med) => {
    if (selectedMedications.find(m => m.id === med.id)) {
      setSelectedMedications(prev => prev.filter(m => m.id !== med.id));
    } else {
      setSelectedMedications(prev => [...prev, med]);
    }
  };

  // Confirm medication selection
  const confirmMedicationSelect = () => {
    if (selectedMedications.length === 0) {
      // Allow skipping
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        text: 'No specific medications selected',
        timestamp: new Date(),
      }]);
    } else {
      // Add user's selection as a message
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        text: selectedMedications.map(m => m.brandName.split('/')[0]).join(', '),
        timestamp: new Date(),
      }]);
    }

    // Update answers with medication IDs
    setAnswers(prev => ({
      ...prev,
      medications: selectedMedications.map(m => m.id),
    }));

    // Move to next question
    setTimeout(() => {
      addQuestionMessage(currentQuestion + 1);
    }, 300);
  };

  // Generate personalized results
  const generateResults = () => {
    setIsTyping(true);

    setTimeout(() => {
      // Generate guidance summary
      const summary = generateGuidanceSummary(answers, MEDICATIONS_DATA);
      const guidanceMessages = formatGuidanceAsMessages(summary);

      // Add results messages
      const resultMessages = guidanceMessages.map((msg, idx) => ({
        id: Date.now() + idx,
        type: 'assistant',
        text: msg.text,
        timestamp: new Date(),
      }));

      setMessages(prev => [...prev, ...resultMessages]);
      setIsTyping(false);
      setShowResults(true);
    }, 1500);
  };

  // Reset the chat
  const resetChat = () => {
    setMessages([]);
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSelectedMedications([]);
    setMedicationSearch('');

    // Restart with welcome message
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{
        id: 1,
        type: 'assistant',
        text: "Let's start fresh! I'll help you find the best assistance programs for your transplant medications.",
        timestamp: new Date(),
      }]);
      setIsTyping(false);
      setTimeout(() => addQuestionMessage(0), 800);
    }, 500);
  };

  // Handle free-text input
  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;

    // For now, just acknowledge and encourage using the guided flow
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    }]);

    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        text: "Thanks for your question! To give you the most accurate guidance, please complete the questions above. Once I know your insurance type and medications, I can provide specific assistance program recommendations.",
        timestamp: new Date(),
      }]);
    }, 500);
  };

  // Handle Escape key to close chat
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Render option button
  const renderOptionButton = (option, isSelected, onClick, showHint = false) => (
    <button
      key={option.value}
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left w-full
        ${isSelected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700'
        }
      `}
    >
      {option.icon && <span className="text-xl flex-shrink-0">{option.icon}</span>}
      <div className="flex-1 min-w-0">
        <span className="font-medium block">{option.label}</span>
        {showHint && option.hint && (
          <span className="text-xs text-emerald-600 block mt-0.5">{option.hint}</span>
        )}
        {option.description && (
          <span className="text-xs text-slate-500 block mt-0.5">{option.description}</span>
        )}
      </div>
      {isSelected && <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />}
    </button>
  );

  // Render the current question's options
  const renderQuestionOptions = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    // Single select
    if (question.type === 'single') {
      return (
        <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
          {question.options.map(option =>
            renderOptionButton(
              option,
              answers[question.key] === option.value,
              () => handleSingleSelect(option),
              question.key === 'insurance'
            )
          )}
        </div>
      );
    }

    // Multi select
    if (question.type === 'multi') {
      const currentSelections = answers[question.key] || [];
      return (
        <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
          <div className="grid grid-cols-2 gap-2">
            {question.options.map(option =>
              renderOptionButton(
                option,
                currentSelections.includes(option.value),
                () => handleMultiSelect(option)
              )
            )}
          </div>
          {currentSelections.length > 0 && (
            <button
              onClick={confirmMultiSelect}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              Continue with {currentSelections.length} selected
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      );
    }

    // Medication select
    if (question.type === 'medication-select') {
      return (
        <div className="space-y-3 p-3 bg-slate-50 rounded-xl">
          {/* Search input */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={medicationSearch}
              onChange={(e) => setMedicationSearch(e.target.value)}
              placeholder="Search medications..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Selected medications */}
          {selectedMedications.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedMedications.map(med => (
                <span
                  key={med.id}
                  onClick={() => toggleMedication(med)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs cursor-pointer hover:bg-emerald-200"
                >
                  <Pill size={12} />
                  {med.brandName.split('/')[0]}
                  <X size={12} />
                </span>
              ))}
            </div>
          )}

          {/* Medication list */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-white">
            {filteredMedications.map(med => {
              const isSelected = selectedMedications.find(m => m.id === med.id);
              return (
                <button
                  key={med.id}
                  onClick={() => toggleMedication(med)}
                  className={`
                    w-full text-left p-2 rounded-lg text-sm transition flex items-center gap-2
                    ${isSelected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'hover:bg-slate-100 text-slate-700'
                    }
                  `}
                >
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{med.brandName}</span>
                    <span className="text-xs text-slate-500 block truncate">{med.genericName}</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{med.category}</span>
                </button>
              );
            })}
          </div>

          {/* Continue button */}
          <button
            onClick={confirmMedicationSelect}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            {selectedMedications.length > 0
              ? `Continue with ${selectedMedications.length} medication${selectedMedications.length > 1 ? 's' : ''}`
              : 'Skip for now'
            }
            <ChevronRight size={18} />
          </button>
        </div>
      );
    }

    return null;
  };

  // Render a message bubble
  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isQuestion = message.type === 'question';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
      >
        <div
          className={`max-w-[90%] rounded-2xl p-3 ${
            isUser
              ? 'bg-emerald-600 text-white'
              : isQuestion
                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 text-slate-800'
                : 'bg-white border border-slate-200 text-slate-800'
          }`}
        >
          {isQuestion ? (
            <div>
              <p className="font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                {message.question}
              </p>
              {message.subtitle && (
                <p className="text-xs text-indigo-600 mt-1">{message.subtitle}</p>
              )}
              {message.helpText && (
                <p className="text-xs text-slate-500 mt-1 italic">{message.helpText}</p>
              )}
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm prose-emerald max-w-none">
              {formatMessageText(message.text)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Format message text with basic markdown
  const formatMessageText = (text) => {
    // Simple markdown-like formatting
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, i) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Link
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
          >
            {linkMatch[1]}
            <ExternalLink size={12} />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center gap-2 group min-h-[56px] hover:scale-105"
          aria-label="Open medication assistance chat"
        >
          <MessageCircle size={24} aria-hidden="true" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
            Need help finding assistance?
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-[420px] h-[85vh] sm:h-[650px] max-h-[700px] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-widget-title"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl" aria-hidden="true">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h3 id="chat-widget-title" className="font-bold text-lg">Medication Navigator</h3>
                <p className="text-xs text-emerald-100">Your guide to medication assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {showResults && (
                <button
                  onClick={resetChat}
                  className="hover:bg-white/20 p-2 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Start over"
                  title="Start over"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map(message => renderMessage(message))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-600" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            )}

            {/* Current question options */}
            {!isTyping && !showResults && currentQuestion < questions.length && (
              <div className="animate-in slide-in-from-bottom-3">
                {renderQuestionOptions()}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer with input or results actions */}
          <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
            {showResults ? (
              <div className="space-y-2">
                <button
                  onClick={resetChat}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw size={18} />
                  Start New Search
                </button>
                <a
                  href="/medications"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Search size={18} />
                  Browse All Medications
                </a>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder="Or ask a question..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm min-h-[48px]"
                  aria-label="Type your question"
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!inputValue.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center"
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
