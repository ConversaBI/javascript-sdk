import { useState } from 'react';
import './App.css';

// Simple demo without SDK dependencies for Vercel deployment
function App() {
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: `I understand you're asking about "${input}". This is a demo of the ConversaBI SDK. In a real implementation, this would connect to your business data sources and provide intelligent insights.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__logo">🤖</span>
            ConversaBI SDK Demo
          </h1>
          <p className="app__subtitle">
            AI-native business intelligence with natural language queries
          </p>
        </div>
      </header>

      <main className="app__main">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">💬</div>
                <h3>Start a conversation with your data</h3>
                <p>Ask questions like:</p>
                <div className="example-queries">
                  <button 
                    className="example-query"
                    onClick={() => setInput("What are my top selling products?")}
                  >
                    What are my top selling products?
                  </button>
                  <button 
                    className="example-query"
                    onClick={() => setInput("Show me revenue trends for this month")}
                  >
                    Show me revenue trends for this month
                  </button>
                  <button 
                    className="example-query"
                    onClick={() => setInput("Which customers are most valuable?")}
                  >
                    Which customers are most valuable?
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message__content">
                    {message.content}
                  </div>
                  <div className="message__timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="message assistant">
                <div className="message__content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask questions about your business data..."
              rows={1}
              className="input-field"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>

        <div className="app__features">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Universal Data Connectivity</h3>
              <p>
                100+ pre-built connectors for Shopify, Stripe, Salesforce, Google Analytics,
                and every major business platform.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>AI-Powered Insights</h3>
              <p>
                Natural language understanding with business context awareness.
                Get intelligent insights, not just raw data.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>
                Sub-500ms query responses with intelligent caching and
                parallel data source processing.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>
                SOC2 Type II certified with end-to-end encryption,
                zero-knowledge architecture, and GDPR compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="app__integration">
          <h2>Three-Line Integration</h2>
          <div className="code-example">
            <pre><code>{`import { ConversaBI } from '@conversabi/sdk';

const conversa = new ConversaBI({
  apiKey: 'your-api-key',
  dataSources: [/* your data sources */]
});

await conversa.init();
const response = await conversa.query('What are my top products?');`}</code></pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;