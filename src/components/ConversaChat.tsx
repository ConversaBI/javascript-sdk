import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConversaSDK } from '../core/ConversaSDK';
import { ConversaChatProps, ChatMessage, ChatSession } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';
import './ConversaChat.css';

/**
 * Main chat component for Conversa SDK
 * Provides a conversational interface for business intelligence queries
 */
export const ConversaChat: React.FC<ConversaChatProps> = ({
  config,
  onMessage,
  onResponse,
  className = '',
  placeholder = 'Ask questions about your data...',
  disabled = false,
}) => {
  const [sdk, setSdk] = useState<ConversaSDK | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize SDK and create session
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const conversaSDK = new ConversaSDK(config);
        await conversaSDK.initialize();
        setSdk(conversaSDK);

        const chatSession = await conversaSDK.createChatSession();
        setSession(chatSession);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
      }
    };

    initializeSDK();

    return () => {
      if (sdk) {
        sdk.destroy();
      }
    };
  }, [config]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!sdk || !session || isLoading || disabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message to the UI immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    onMessage?.(userMessage);

    try {
      // Send message to SDK
      const assistantMessage = await sdk.sendMessage(session.id, content);
      
      // Add assistant message to the UI
      setMessages(prev => [...prev, assistantMessage]);
      onMessage?.(assistantMessage);

      // Call onResponse callback if provided
      if (assistantMessage.metadata?.queryResponse) {
        onResponse?.(assistantMessage.metadata.queryResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
        metadata: { isError: true },
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, session, isLoading, disabled, onMessage, onResponse]);

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  if (!isInitialized) {
    return (
      <div className={`conversa-chat ${className}`}>
        <div className="conversa-chat__loading">
          <LoadingIndicator />
          <p>Initializing Conversa SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversa-chat ${className}`}>
      <div className="conversa-chat__header">
        <h3>Conversa BI</h3>
        <div className="conversa-chat__actions">
          <button
            onClick={handleClearChat}
            className="conversa-chat__clear-button"
            disabled={messages.length === 0}
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="conversa-chat__messages">
        <MessageList messages={messages} />
        {isLoading && (
          <div className="conversa-chat__loading-message">
            <LoadingIndicator />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="conversa-chat__error">
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      )}

      <div className="conversa-chat__input">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder={placeholder}
          disabled={disabled || isLoading}
        />
      </div>
    </div>
  );
};

