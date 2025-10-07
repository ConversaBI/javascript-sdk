import React from 'react';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

/**
 * Component for displaying error messages with retry functionality
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="error-display">
      <div className="error-display__icon">⚠️</div>
      <div className="error-display__content">
        <h4 className="error-display__title">Something went wrong</h4>
        <p className="error-display__message">{error}</p>
        {onRetry && (
          <button
            className="error-display__retry-button"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

