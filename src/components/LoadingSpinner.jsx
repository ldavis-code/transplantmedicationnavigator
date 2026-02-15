import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner component - displays an animated loading spinner
 * @param {number} size - Size of the spinner (default: 24)
 * @param {string} className - Additional CSS classes
 */
const LoadingSpinner = ({ size = 24, className = '' }) => {
  return (
    <span role="status">
      <Loader2
        size={size}
        className={`animate-spin ${className}`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
    </span>
  );
};

export default LoadingSpinner;
