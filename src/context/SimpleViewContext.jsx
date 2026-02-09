import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SimpleViewContext = createContext(null);

const STORAGE_KEY = 'tmn_simple_view';

export function SimpleViewProvider({ children }) {
  const [isSimpleView, setIsSimpleView] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isSimpleView));
    } catch {
      // localStorage unavailable
    }

    // Toggle class on documentElement so CSS can target it
    if (isSimpleView) {
      document.documentElement.classList.add('simple-view');
    } else {
      document.documentElement.classList.remove('simple-view');
    }
  }, [isSimpleView]);

  const toggleSimpleView = useCallback(() => {
    setIsSimpleView(prev => !prev);
  }, []);

  return (
    <SimpleViewContext.Provider value={{ isSimpleView, toggleSimpleView }}>
      {children}
    </SimpleViewContext.Provider>
  );
}

export function useSimpleView() {
  const context = useContext(SimpleViewContext);
  if (!context) {
    throw new Error('useSimpleView must be used within a SimpleViewProvider');
  }
  return context;
}
