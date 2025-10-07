import React from 'react';
import { ChatMessage } from '../types';
import { DataVisualization } from './DataVisualization';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Component for displaying individual chat messages
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.metadata?.isError;
  const hasData = message.metadata?.queryResponse?.data;

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(timestamp);
  };

  return (
    <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'} ${isError ? 'message-bubble--error' : ''}`}>
      <div className="message-bubble__content">
        <div className="message-bubble__header">
          <div className="message-bubble__avatar">
            {isUser ? '👤' : '🤖'}
          </div>
          <div className="message-bubble__info">
            <span className="message-bubble__role">
              {isUser ? 'You' : 'Conversa AI'}
            </span>
            <span className="message-bubble__timestamp">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        </div>
        
        <div className="message-bubble__text">
          {message.content}
        </div>

        {hasData && (
          <div className="message-bubble__data">
            <DataVisualization data={message.metadata.queryResponse.data} />
          </div>
        )}

        {message.metadata?.queryResponse?.insights && message.metadata.queryResponse.insights.length > 0 && (
          <div className="message-bubble__insights">
            <h5>💡 Insights</h5>
            {message.metadata.queryResponse.insights.map((insight, index) => (
              <div key={index} className="insight">
                <strong>{insight.title}</strong>
                <p>{insight.description}</p>
                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div className="insight__recommendations">
                    <strong>Recommendations:</strong>
                    <ul>
                      {insight.recommendations.map((rec, recIndex) => (
                        <li key={recIndex}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

