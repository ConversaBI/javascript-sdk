import React from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
}

/**
 * Component for displaying loading states
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
}) => {
  return (
    <div className={`loading-indicator loading-indicator--${size}`}>
      <div className="loading-indicator__spinner">
        <div className="loading-indicator__dot" />
        <div className="loading-indicator__dot" />
        <div className="loading-indicator__dot" />
      </div>
    </div>
  );
};
