import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import GLOSSARY from '../data/glossary.json';

/**
 * TermTooltip Component
 *
 * Displays a term with an inline definition tooltip.
 * Supports hover, focus, and click interactions for accessibility.
 *
 * Usage:
 *   <TermTooltip term="deductible">deductible</TermTooltip>
 *   <TermTooltip term="copay" showIcon={false}>copay</TermTooltip>
 */
const TermTooltip = ({
  term,
  children,
  showIcon = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Normalize the term key to match glossary format
  const termKey = term.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  const glossaryEntry = GLOSSARY.terms[termKey];

  // If term not in glossary, just render the children
  if (!glossaryEntry) {
    return <span className={className}>{children}</span>;
  }

  const definition = glossaryEntry.definition;

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <span className={`relative inline ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="inline-flex items-center gap-0.5 text-emerald-700 underline decoration-dotted decoration-emerald-400 underline-offset-2 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded cursor-help"
        aria-describedby={`tooltip-${termKey}`}
        aria-expanded={isOpen}
      >
        {children}
        {showIcon && (
          <HelpCircle
            size={14}
            className="inline-block text-emerald-600 flex-shrink-0"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Tooltip popup */}
      {isOpen && (
        <span
          ref={tooltipRef}
          id={`tooltip-${termKey}`}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 w-64 max-w-[90vw] text-sm text-white bg-slate-800 rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          <span className="block font-semibold text-emerald-300 mb-1">
            {glossaryEntry.term}
          </span>
          <span className="block text-slate-100">
            {definition}
          </span>
          {/* Arrow pointing down */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
};

/**
 * DefineInline Component
 *
 * Shows a term with its definition inline in parentheses.
 * Simpler alternative to tooltip for contexts where hover isn't ideal.
 *
 * Usage:
 *   <DefineInline term="deductible">deductible</DefineInline>
 *   Renders: "deductible (the amount you pay before insurance starts helping)"
 */
export const DefineInline = ({ term, children, className = '' }) => {
  const termKey = term.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  const glossaryEntry = GLOSSARY.terms[termKey];

  if (!glossaryEntry) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={className}>
      <strong className="text-slate-900">{children}</strong>
      {' '}
      <span className="text-slate-600">({glossaryEntry.definition})</span>
    </span>
  );
};

/**
 * Glossary Link Component
 *
 * Shows a "What's this?" style link that reveals the definition.
 * Good for longer explanations or less common terms.
 *
 * Usage:
 *   Most plans have an out-of-pocket maximum. <GlossaryLink term="out-of-pocket-maximum" />
 */
export const GlossaryLink = ({ term, linkText = "What's this?", className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const termKey = term.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  const glossaryEntry = GLOSSARY.terms[termKey];

  if (!glossaryEntry) {
    return null;
  }

  return (
    <span className={`inline ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-emerald-700 hover:text-emerald-800 underline text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded"
        aria-expanded={isOpen}
      >
        [{linkText}]
      </button>
      {isOpen && (
        <span className="block mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-slate-700">
          <strong className="text-emerald-800">{glossaryEntry.term}:</strong>{' '}
          {glossaryEntry.definition}
        </span>
      )}
    </span>
  );
};

export default TermTooltip;
