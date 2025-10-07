import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Component for message input with send functionality
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = 'Ask questions about your data...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <div className="message-input__container">
        <textarea
          ref={textareaRef}
          className="message-input__textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          maxLength={1000}
        />
        <button
          type="submit"
          className={`message-input__send-button ${canSend ? 'message-input__send-button--enabled' : ''}`}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div className="message-input__footer">
        <span className="message-input__hint">
          Press Enter to send, Shift+Enter for new line
        </span>
        <span className="message-input__counter">
          {message.length}/1000
        </span>
      </div>
    </form>
  );
};

