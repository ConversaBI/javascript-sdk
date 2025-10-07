import React from 'react';
import { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  messages: ChatMessage[];
}

/**
 * Component for displaying a list of chat messages
 */
export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="message-list__empty">
          <div className="message-list__empty-icon">💬</div>
          <h4>Start a conversation</h4>
          <p>Ask questions about your data to get insights and answers.</p>
          <div className="message-list__suggestions">
            <h5>Try asking:</h5>
            <ul>
              <li>"What are my top selling products?"</li>
              <li>"Show me revenue trends this month"</li>
              <li>"Which customers are most valuable?"</li>
              <li>"How is my conversion rate performing?"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};

