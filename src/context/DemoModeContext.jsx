/**
 * Demo Mode Context
 *
 * Provides demo mode functionality for enterprise/B2B demonstrations.
 * When active, users get Pro features without authentication.
 *
 * Activation methods:
 * - URL: /demo or /demo/enterprise
 * - Query param: ?demo=true (on any page)
 * - localStorage: tmn_demo_mode (persists for session)
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const DemoModeContext = createContext(null);

// Storage key for demo mode persistence
const DEMO_MODE_KEY = 'tmn_demo_mode';
const DEMO_EXPIRY_KEY = 'tmn_demo_expiry';

// Demo session duration (4 hours)
const DEMO_DURATION_MS = 4 * 60 * 60 * 1000;

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoType, setDemoType] = useState(null); // 'enterprise', 'partner', 'general'
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Check for demo mode activation on mount and route changes
  useEffect(() => {
    // Check URL path for demo routes
    const isDemoPath = location.pathname.startsWith('/demo');

    // Check query param
    const demoParam = searchParams.get('demo');
    const isDemoParam = demoParam === 'true' || demoParam === 'enterprise' || demoParam === 'partner';

    // Check localStorage for existing demo session
    const storedDemo = localStorage.getItem(DEMO_MODE_KEY);
    const storedExpiry = localStorage.getItem(DEMO_EXPIRY_KEY);
    const isStoredDemoValid = storedDemo && storedExpiry && Date.now() < parseInt(storedExpiry, 10);

    if (isDemoPath || isDemoParam || isStoredDemoValid) {
      // Determine demo type
      let type = 'general';
      if (location.pathname.includes('enterprise') || demoParam === 'enterprise') {
        type = 'enterprise';
      } else if (location.pathname.includes('partner') || demoParam === 'partner') {
        type = 'partner';
      } else if (storedDemo) {
        type = storedDemo;
      }

      setIsDemoMode(true);
      setDemoType(type);

      // Persist demo mode for session
      localStorage.setItem(DEMO_MODE_KEY, type);
      localStorage.setItem(DEMO_EXPIRY_KEY, String(Date.now() + DEMO_DURATION_MS));
    }
  }, [location.pathname, searchParams]);

  // Exit demo mode
  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setDemoType(null);
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_EXPIRY_KEY);
  }, []);

  // Start demo mode programmatically
  const startDemoMode = useCallback((type = 'general') => {
    setIsDemoMode(true);
    setDemoType(type);
    localStorage.setItem(DEMO_MODE_KEY, type);
    localStorage.setItem(DEMO_EXPIRY_KEY, String(Date.now() + DEMO_DURATION_MS));
  }, []);

  // Get time remaining in demo
  const getDemoTimeRemaining = useCallback(() => {
    const expiry = localStorage.getItem(DEMO_EXPIRY_KEY);
    if (!expiry) return 0;
    return Math.max(0, parseInt(expiry, 10) - Date.now());
  }, []);

  const value = useMemo(
    () => ({
      isDemoMode,
      demoType,
      startDemoMode,
      exitDemoMode,
      getDemoTimeRemaining,
    }),
    [isDemoMode, demoType, startDemoMode, exitDemoMode, getDemoTimeRemaining]
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

export default DemoModeContext;
