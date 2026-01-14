/**
 * Demo Banner Component
 *
 * Shows a sticky banner at the top of the page when in demo mode.
 * Provides visual indication and quick exit option.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, X, Clock, Sparkles } from 'lucide-react';
import { useDemoMode } from '../context/DemoModeContext';

const DemoBanner = () => {
  const { isDemoMode, demoType, exitDemoMode, getDemoTimeRemaining } = useDemoMode();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  // Update time remaining every minute
  useEffect(() => {
    if (!isDemoMode) return;

    const updateTime = () => {
      const ms = getDemoTimeRemaining();
      const hours = Math.floor(ms / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [isDemoMode, getDemoTimeRemaining]);

  if (!isDemoMode) return null;

  // Minimized view - just a small indicator
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-4 right-4 z-[9998] flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Expand demo banner"
      >
        <Monitor size={16} />
        <span>Demo Mode</span>
      </button>
    );
  }

  const getDemoLabel = () => {
    switch (demoType) {
      case 'enterprise':
        return 'Enterprise Demo';
      case 'partner':
        return 'Partner Demo';
      default:
        return 'Demo Mode';
    }
  };

  return (
    <div className="sticky top-0 z-[9998] bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Monitor size={18} />
            <span className="font-semibold">{getDemoLabel()}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-purple-100">
            <Sparkles size={14} />
            <span className="text-sm">All Pro features unlocked</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-purple-200 text-sm">
            <Clock size={14} />
            <span>{timeRemaining} remaining</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="hidden sm:inline-flex items-center px-3 py-1 bg-white/20 hover:bg-white/30 text-sm font-medium rounded-lg transition"
          >
            View Pricing
          </Link>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
            aria-label="Minimize banner"
          >
            <span className="text-xs">Minimize</span>
          </button>

          <button
            onClick={exitDemoMode}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
            aria-label="Exit demo mode"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
