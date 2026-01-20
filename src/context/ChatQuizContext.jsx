/**
 * Chat Quiz Context
 * Shared state management for integrated chat and quiz functionality
 * Enables seamless switching between chat and quiz modes with progress persistence
 * Syncs to server for authenticated users, falls back to localStorage for guests
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

const ChatQuizContext = createContext(null);

// Storage key for localStorage persistence
const STORAGE_KEY = 'medication_navigator_progress';
const SUBSCRIBER_TOKEN_KEY = 'tmn_subscriber_token';

// Maximum number of medication searches allowed in free tier
const MAX_FREE_SEARCHES = 4;

// Maximum number of quiz completions allowed in free tier
const MAX_FREE_QUIZZES = 1;

// Maximum number of savings calculator uses allowed in free tier
const MAX_FREE_CALCULATOR_USES = 2;

// Debounce delay for server sync (ms)
const SYNC_DEBOUNCE_MS = 2000;

// Question definitions for the quiz mode
const QUIZ_QUESTIONS = [
  {
    id: 'role',
    question: "Who am I helping today?",
    type: 'single',
    options: [
      { value: 'patient', label: 'Patient', description: "I'm the transplant patient" },
      { value: 'carepartner', label: 'Carepartner / Family', description: "I'm helping a loved one" },
      { value: 'social_worker', label: 'Social Worker / Coordinator', description: "I'm a healthcare professional" },
    ],
    tip: "Social workers and carepartners can complete this quiz on behalf of a patient to find assistance programs.",
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
    tip: "Some programs have different eligibility based on how long since transplant. The first year often has the most options.",
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
    tip: "For multi-organ transplants, you may qualify for assistance from multiple organ-specific foundations.",
  },
  {
    id: 'insurance_type',
    question: "What's your primary insurance?",
    type: 'single',
    options: [
      { value: 'commercial', label: 'Commercial Insurance', description: 'From my job, my spouse\'s job, or I bought it myself' },
      { value: 'medicare', label: 'Medicare', description: 'The program for people 65+ or with disabilities' },
      { value: 'medicaid', label: 'Medicaid', description: 'State program for people with lower income' },
      { value: 'tricare_va', label: 'TRICARE or VA (Veterans)', description: 'Military or Veterans benefits' },
      { value: 'ihs', label: 'Indian Health Service', description: 'Tribal health programs' },
      { value: 'uninsured', label: 'I don\'t have insurance', description: 'No current insurance coverage' },
    ],
    tip: "Copay cards work best with commercial insurance. Medicare and Medicaid patients often have access to Patient Assistance Programs (PAPs) for free medications.",
  },
  {
    id: 'has_multiple_insurance',
    question: "Do you have more than one type of health insurance?",
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes', description: 'I have multiple insurance plans' },
      { value: 'no', label: 'No', description: 'I only have one insurance plan' },
    ],
    tip: "Having multiple insurance plans (like Medicare plus an employer plan) affects which assistance programs you can use. This is called Coordination of Benefits.",
    // Show for all insurance types since COB can apply to various scenarios
  },
  {
    id: 'insurance_combination',
    question: "Which of the following applies to you?",
    type: 'single',
    options: [
      {
        value: 'medicare_employer_active',
        label: 'Medicare + Employer Coverage (Working)',
        description: 'I or my spouse currently work and have employer insurance'
      },
      {
        value: 'medicare_retiree',
        label: 'Medicare + Retiree Benefits',
        description: 'I have retiree health benefits from a former employer'
      },
      {
        value: 'medicare_medicaid',
        label: 'Medicare + Medicaid (Dual Eligible)',
        description: 'I qualify for both Medicare and Medicaid'
      },
      {
        value: 'other_combination',
        label: 'Other Combination',
        description: 'My situation is different from the options above'
      },
    ],
    tip: "Your insurance combination determines which programs you qualify for. Medicare + active employer coverage is special—the employer plan is primary, so copay cards may be available!",
    // Only show if user has multiple insurance and selected Medicare (main COB impact)
    showIf: (answers) => answers.insurance_type === 'medicare' && answers.has_multiple_insurance === 'yes',
  },
  {
    id: 'medication',
    question: "Which medication do you need help with?",
    type: 'medication_search',
    allowSkip: true,
    skipLabel: "I'm not sure / Show all options",
    tip: "Search for your brand name medication (like Prograf or Envarsus) or generic name (like tacrolimus). You can add multiple medications.",
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
    tip: "If you're in crisis, reach out to your transplant center social worker immediately. Never skip doses—there are emergency options available.",
  },
  {
    id: 'transplant_pharmacy',
    question: "Are you filling prescriptions at your transplant center's pharmacy?",
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes', description: "I use my transplant center's pharmacy" },
      { value: 'no', label: 'No', description: "I use a different pharmacy" },
      { value: 'not_sure', label: "I'm not sure", description: "I don't know if my center has one" },
      { value: 'will_check', label: "I'll check!", description: "Good idea—I'll call and ask" },
    ],
    tip: "Some transplant centers offer their own pharmacy with lower pricing that patients don't know about. It's worth one phone call to check—you might save significantly on your medications.",
    // This question only shows when patient is uninsured OR struggling with costs
    showIf: (answers) => {
      const isUninsured = answers.insurance_type === 'uninsured';
      const isStrugglingWithCosts = ['challenging', 'unaffordable', 'crisis'].includes(answers.cost_burden);
      return isUninsured || isStrugglingWithCosts;
    },
  },
];

// Initial state
const initialState = {
  // Current mode: 'chat' or 'quiz'
  mode: 'chat',

  // User profile answers (shared between chat and quiz)
  answers: {},

  // Usage tracking for free tier limits
  usageTracking: {
    searchCount: 0,             // Number of medication searches performed
    quizCompletionsCount: 0,    // Number of completed quizzes
    calculatorUsesCount: 0,     // Number of savings calculator uses
    searchLimitReached: false,  // Whether the user has hit the search limit
    lastResetDate: null,        // For potential monthly reset functionality
  },

  // Quiz-specific state
  quizProgress: {
    currentQuestionIndex: 0,
    isComplete: false,
    startedAt: null,
    completedAt: null,
  },

  // Chat-specific state
  chatState: {
    messages: [],
    conversationId: null,
    currentQuestionIndex: 0,
    isComplete: false,
  },

  // Selected medications (shared)
  selectedMedications: [],

  // Results data (shared)
  results: {
    programs: [],
    medicationPrograms: [],
    costPlusMedications: [],
    guidance: null,
  },

  // UI state
  isOpen: false,
  hasSeenResults: false,
};

/**
 * Load saved progress from localStorage
 */
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate and return saved state
      if (parsed && typeof parsed === 'object') {
        return {
          ...initialState,
          ...parsed,
          // Don't persist UI open state
          isOpen: false,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load saved progress:', e);
  }
  return initialState;
}

/**
 * Save progress to localStorage
 */
function saveToStorage(state) {
  try {
    const toSave = {
      answers: state.answers,
      quizProgress: state.quizProgress,
      selectedMedications: state.selectedMedications,
      results: state.results,
      hasSeenResults: state.hasSeenResults,
      mode: state.mode,
      usageTracking: state.usageTracking,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
function isAuthenticated() {
  return !!localStorage.getItem(SUBSCRIBER_TOKEN_KEY);
}

/**
 * Get auth token
 */
function getAuthToken() {
  return localStorage.getItem(SUBSCRIBER_TOKEN_KEY);
}

export function ChatQuizProvider({ children }) {
  const [state, setState] = useState(() => loadFromStorage());
  const [serverLoaded, setServerLoaded] = useState(false);
  const syncTimeoutRef = useRef(null);
  const lastSyncedRef = useRef(null);

  // Load data from server on mount if authenticated
  useEffect(() => {
    async function loadFromServer() {
      if (!isAuthenticated()) {
        setServerLoaded(true);
        return;
      }

      try {
        const response = await fetch('/.netlify/functions/subscriber-data/quiz', {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            // Merge server data with local state
            setState(prev => {
              const merged = {
                ...prev,
                answers: data.answers || prev.answers,
                selectedMedications: data.selected_medications || prev.selectedMedications,
                results: data.results || prev.results,
                usageTracking: data.usage_tracking || prev.usageTracking,
                quizProgress: data.quiz_progress || prev.quizProgress,
                isOpen: false,
              };
              // Update lastSynced to prevent immediate re-sync
              lastSyncedRef.current = JSON.stringify({
                answers: merged.answers,
                selectedMedications: merged.selectedMedications,
                results: merged.results,
                usageTracking: merged.usageTracking,
                quizProgress: merged.quizProgress,
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load data from server:', err);
      } finally {
        setServerLoaded(true);
      }
    }

    loadFromServer();
  }, []);

  // Sync to server (debounced)
  const syncToServer = useCallback(async (stateToSync) => {
    if (!isAuthenticated()) return;

    const dataToSync = {
      answers: stateToSync.answers,
      selectedMedications: stateToSync.selectedMedications,
      results: stateToSync.results,
      usageTracking: stateToSync.usageTracking,
      quizProgress: stateToSync.quizProgress,
    };

    // Check if data has changed since last sync
    const currentData = JSON.stringify(dataToSync);
    if (currentData === lastSyncedRef.current) return;

    try {
      const response = await fetch('/.netlify/functions/subscriber-data/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(dataToSync),
      });

      if (response.ok) {
        lastSyncedRef.current = currentData;
      }
    } catch (err) {
      console.warn('Failed to sync to server:', err);
    }
  }, []);

  // Save to localStorage and debounce server sync when state changes
  useEffect(() => {
    // Always save to localStorage
    saveToStorage(state);

    // Debounce server sync
    if (serverLoaded && isAuthenticated()) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        syncToServer(state);
      }, SYNC_DEBOUNCE_MS);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [state.answers, state.quizProgress, state.selectedMedications, state.results, state.hasSeenResults, state.mode, state.usageTracking, serverLoaded, syncToServer]);

  // Set mode (chat or quiz)
  const setMode = useCallback((mode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  // Toggle widget open/closed
  const setIsOpen = useCallback((isOpen) => {
    setState(prev => ({ ...prev, isOpen }));
  }, []);

  // Update a single answer
  const setAnswer = useCallback((questionId, value) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  }, []);

  // Update multiple answers at once
  const setAnswers = useCallback((answers) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        ...answers,
      },
    }));
  }, []);

  // Update quiz progress
  const setQuizProgress = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      quizProgress: {
        ...prev.quizProgress,
        ...updates,
      },
    }));
  }, []);

  // Helper to check if a question should be shown based on current answers
  const shouldShowQuestion = useCallback((question, answers) => {
    if (!question.showIf) return true;
    return question.showIf(answers);
  }, []);

  // Advance to next quiz question (skipping conditional questions that don't apply)
  const nextQuizQuestion = useCallback(() => {
    setState(prev => {
      let nextIndex = prev.quizProgress.currentQuestionIndex + 1;

      // Skip questions that shouldn't be shown based on current answers
      while (nextIndex < QUIZ_QUESTIONS.length) {
        const nextQuestion = QUIZ_QUESTIONS[nextIndex];
        if (shouldShowQuestion(nextQuestion, prev.answers)) {
          break;
        }
        nextIndex++;
      }

      const isComplete = nextIndex >= QUIZ_QUESTIONS.length;
      return {
        ...prev,
        quizProgress: {
          ...prev.quizProgress,
          currentQuestionIndex: nextIndex,
          isComplete,
          completedAt: isComplete ? new Date().toISOString() : null,
        },
      };
    });
  }, [shouldShowQuestion]);

  // Go to previous quiz question (skipping conditional questions that don't apply)
  const prevQuizQuestion = useCallback(() => {
    setState(prev => {
      let prevIndex = prev.quizProgress.currentQuestionIndex - 1;

      // Skip questions that shouldn't be shown based on current answers
      while (prevIndex >= 0) {
        const prevQuestion = QUIZ_QUESTIONS[prevIndex];
        if (shouldShowQuestion(prevQuestion, prev.answers)) {
          break;
        }
        prevIndex--;
      }

      return {
        ...prev,
        quizProgress: {
          ...prev.quizProgress,
          currentQuestionIndex: Math.max(0, prevIndex),
          isComplete: false,
        },
      };
    });
  }, [shouldShowQuestion]);

  // Update chat state
  const setChatState = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      chatState: {
        ...prev.chatState,
        ...updates,
      },
    }));
  }, []);

  // Add a chat message
  const addChatMessage = useCallback((message) => {
    setState(prev => ({
      ...prev,
      chatState: {
        ...prev.chatState,
        messages: [...prev.chatState.messages, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...message,
        }],
      },
    }));
  }, []);

  // Update selected medications
  const setSelectedMedications = useCallback((medications) => {
    setState(prev => ({
      ...prev,
      selectedMedications: medications,
    }));
  }, []);

  // Add a medication to selection
  const addMedication = useCallback((medication) => {
    setState(prev => {
      if (prev.selectedMedications.find(m => m.id === medication.id)) {
        return prev;
      }
      return {
        ...prev,
        selectedMedications: [...prev.selectedMedications, medication],
      };
    });
  }, []);

  // Remove a medication from selection
  const removeMedication = useCallback((medicationId) => {
    setState(prev => ({
      ...prev,
      selectedMedications: prev.selectedMedications.filter(m => m.id !== medicationId),
    }));
  }, []);

  // Set results
  const setResults = useCallback((results) => {
    setState(prev => ({
      ...prev,
      results: {
        ...prev.results,
        ...results,
      },
      hasSeenResults: true,
    }));
  }, []);

  // Reset all progress (but preserve usage tracking)
  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...initialState,
      isOpen: true, // Keep widget open after reset
      // Preserve usage tracking across resets
      usageTracking: prev.usageTracking,
    }));
  }, []);

  // Increment search count and check limit
  const incrementSearchCount = useCallback(() => {
    setState(prev => {
      const newSearchCount = prev.usageTracking.searchCount + 1;
      const searchLimitReached = newSearchCount >= MAX_FREE_SEARCHES;
      return {
        ...prev,
        usageTracking: {
          ...prev.usageTracking,
          searchCount: newSearchCount,
          searchLimitReached,
        },
      };
    });
  }, []);

  // Increment quiz completion count
  const incrementQuizCompletions = useCallback(() => {
    setState(prev => ({
      ...prev,
      usageTracking: {
        ...prev.usageTracking,
        quizCompletionsCount: prev.usageTracking.quizCompletionsCount + 1,
      },
    }));
  }, []);

  // Increment calculator uses count
  const incrementCalculatorUses = useCallback(() => {
    setState(prev => ({
      ...prev,
      usageTracking: {
        ...prev.usageTracking,
        calculatorUsesCount: prev.usageTracking.calculatorUsesCount + 1,
      },
    }));
  }, []);

  // Force sync to server (for immediate sync needs)
  const forceSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncToServer(state);
  }, [state, syncToServer]);

  // Check if search limit is reached
  const isSearchLimitReached = useMemo(() => {
    return state.usageTracking.searchCount >= MAX_FREE_SEARCHES;
  }, [state.usageTracking.searchCount]);

  // Get remaining searches
  const remainingSearches = useMemo(() => {
    return Math.max(0, MAX_FREE_SEARCHES - state.usageTracking.searchCount);
  }, [state.usageTracking.searchCount]);

  // Check if quiz limit is reached
  const isQuizLimitReached = useMemo(() => {
    return state.usageTracking.quizCompletionsCount >= MAX_FREE_QUIZZES;
  }, [state.usageTracking.quizCompletionsCount]);

  // Get remaining quizzes
  const remainingQuizzes = useMemo(() => {
    return Math.max(0, MAX_FREE_QUIZZES - state.usageTracking.quizCompletionsCount);
  }, [state.usageTracking.quizCompletionsCount]);

  // Check if calculator limit is reached
  const isCalculatorLimitReached = useMemo(() => {
    return state.usageTracking.calculatorUsesCount >= MAX_FREE_CALCULATOR_USES;
  }, [state.usageTracking.calculatorUsesCount]);

  // Get remaining calculator uses
  const remainingCalculatorUses = useMemo(() => {
    return Math.max(0, MAX_FREE_CALCULATOR_USES - state.usageTracking.calculatorUsesCount);
  }, [state.usageTracking.calculatorUsesCount]);

  // Check if user has any saved progress
  const hasProgress = useMemo(() => {
    return Object.keys(state.answers).length > 0 ||
           state.selectedMedications.length > 0 ||
           state.quizProgress.currentQuestionIndex > 0;
  }, [state.answers, state.selectedMedications, state.quizProgress.currentQuestionIndex]);

  // Get current quiz question
  const currentQuizQuestion = useMemo(() => {
    return QUIZ_QUESTIONS[state.quizProgress.currentQuestionIndex] || null;
  }, [state.quizProgress.currentQuestionIndex]);

  // Get visible questions based on current answers (filters out conditional questions that don't apply)
  const visibleQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter(q => {
      if (!q.showIf) return true;
      return q.showIf(state.answers);
    });
  }, [state.answers]);

  // Get the total count of visible questions for progress display
  const visibleQuestionCount = useMemo(() => {
    return visibleQuestions.length;
  }, [visibleQuestions]);

  // Get the current position within visible questions (for progress bar)
  const currentVisibleQuestionIndex = useMemo(() => {
    const currentQuestion = QUIZ_QUESTIONS[state.quizProgress.currentQuestionIndex];
    if (!currentQuestion) return visibleQuestions.length;
    return visibleQuestions.findIndex(q => q.id === currentQuestion.id);
  }, [state.quizProgress.currentQuestionIndex, visibleQuestions]);

  // Calculate quiz completion percentage based on visible questions
  const quizCompletionPercent = useMemo(() => {
    // Use current visible position for progress
    const progress = Math.max(0, currentVisibleQuestionIndex);
    return Math.round((progress / visibleQuestionCount) * 100);
  }, [currentVisibleQuestionIndex, visibleQuestionCount]);

  // Get profile summary from answers
  const profileSummary = useMemo(() => {
    const { answers, selectedMedications } = state;
    // Count answered visible questions (excluding optional medication question)
    const requiredVisibleQuestions = visibleQuestions.filter(q => !q.allowSkip);
    const answeredCount = requiredVisibleQuestions.filter(q => answers[q.id] !== undefined).length;
    return {
      role: answers.role,
      transplantStage: answers.transplant_stage,
      organType: answers.organ_type,
      insuranceType: answers.insurance_type,
      costBurden: answers.cost_burden,
      medications: selectedMedications,
      isComplete: answeredCount >= requiredVisibleQuestions.length - 1, // -1 for some flexibility
    };
  }, [state.answers, state.selectedMedications, visibleQuestions]);

  const value = useMemo(() => ({
    // State
    mode: state.mode,
    isOpen: state.isOpen,
    answers: state.answers,
    quizProgress: state.quizProgress,
    chatState: state.chatState,
    selectedMedications: state.selectedMedications,
    results: state.results,
    hasSeenResults: state.hasSeenResults,
    usageTracking: state.usageTracking,

    // Computed values
    hasProgress,
    currentQuizQuestion,
    quizCompletionPercent,
    profileSummary,
    questions: QUIZ_QUESTIONS,
    visibleQuestions,
    visibleQuestionCount,
    currentVisibleQuestionIndex,
    isSearchLimitReached,
    remainingSearches,
    maxFreeSearches: MAX_FREE_SEARCHES,
    isQuizLimitReached,
    remainingQuizzes,
    maxFreeQuizzes: MAX_FREE_QUIZZES,
    isCalculatorLimitReached,
    remainingCalculatorUses,
    maxFreeCalculatorUses: MAX_FREE_CALCULATOR_USES,
    isServerSynced: isAuthenticated(),

    // Actions
    setMode,
    setIsOpen,
    setAnswer,
    setAnswers,
    setQuizProgress,
    nextQuizQuestion,
    prevQuizQuestion,
    setChatState,
    addChatMessage,
    setSelectedMedications,
    addMedication,
    removeMedication,
    setResults,
    resetProgress,
    incrementSearchCount,
    incrementQuizCompletions,
    incrementCalculatorUses,
    forceSync,
  }), [
    state,
    hasProgress,
    currentQuizQuestion,
    quizCompletionPercent,
    profileSummary,
    visibleQuestions,
    visibleQuestionCount,
    currentVisibleQuestionIndex,
    isSearchLimitReached,
    remainingSearches,
    isQuizLimitReached,
    remainingQuizzes,
    isCalculatorLimitReached,
    remainingCalculatorUses,
    setMode,
    setIsOpen,
    setAnswer,
    setAnswers,
    setQuizProgress,
    nextQuizQuestion,
    prevQuizQuestion,
    setChatState,
    addChatMessage,
    setSelectedMedications,
    addMedication,
    removeMedication,
    setResults,
    resetProgress,
    incrementSearchCount,
    incrementQuizCompletions,
    incrementCalculatorUses,
    forceSync,
  ]);

  return (
    <ChatQuizContext.Provider value={value}>
      {children}
    </ChatQuizContext.Provider>
  );
}

export function useChatQuiz() {
  const context = useContext(ChatQuizContext);
  if (!context) {
    throw new Error('useChatQuiz must be used within a ChatQuizProvider');
  }
  return context;
}

export { QUIZ_QUESTIONS };
export default ChatQuizContext;
