import React, { useState } from 'react';
import { ConversaChat, ConversaBIConfig, QueryResponse, ChatMessage, getAllConnectorTypes, getTotalConnectorCount } from '@conversabi/sdk';
import './App.css';

function App() {
  const [config] = useState<ConversaBIConfig>({
    apiKey: 'demo-api-key',
    endpoint: 'https://api.conversabi.dev',
    tenant: 'demo-tenant',
    theme: {
      primaryColor: '#667eea',
      mode: 'light',
    },
    dataSources: [
      {
        type: 'shopify',
        credentials: {
          accessToken: 'demo-shopify-token',
          shopName: 'demo-shop',
        },
      },
      {
        type: 'stripe',
        credentials: {
          apiKey: 'sk_test_demo_key',
        },
      },
      {
        type: 'google-analytics',
        credentials: {
          accessToken: 'demo-ga-token',
          propertyId: '123456789',
        },
      },
      {
        type: 'salesforce',
        credentials: {
          accessToken: 'demo-sf-token',
          instanceUrl: 'https://demo.salesforce.com',
        },
      },
    ],
    businessContext: {
      industry: 'ecommerce',
      metrics: ['revenue', 'conversion_rate', 'customer_lifetime_value'],
      terminology: {
        'CAC': 'Customer Acquisition Cost',
        'LTV': 'Lifetime Value',
        'MRR': 'Monthly Recurring Revenue',
      },
    },
    options: {
      cacheEnabled: true,
      cacheTimeout: 300000, // 5 minutes
      debug: true,
    },
  });

  const handleMessage = (message: ChatMessage) => {
    console.log('New message:', message);
  };

  const handleResponse = (response: QueryResponse) => {
    console.log('Query response:', response);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__title-icon">🤖</span>
            Conversa SDK Demo
          </h1>
          <p className="app__subtitle">
            The developer platform for AI-native business intelligence
          </p>
        </div>
      </header>

      <main className="app__main">
        <div className="app__demo-section">
          <div className="app__demo-header">
            <h2>Interactive Demo</h2>
            <p>
              Try asking questions about your business data. The demo includes sample data from 
              Shopify, Stripe, Google Analytics, and Salesforce.
            </p>
          </div>

          <div className="app__chat-container">
            <ConversaChat
              config={config}
              onMessage={handleMessage}
              onResponse={handleResponse}
              placeholder="Ask questions about your data... (e.g., 'What are my top selling products?')"
            />
          </div>
        </div>

        <div className="app__features">
          <h2>Key Features</h2>
          <div className="app__features-grid">
            <div className="app__feature">
              <div className="app__feature-icon">🔗</div>
              <h3>Universal Data Connectivity</h3>
              <p>
                {getTotalConnectorCount()}+ pre-built connectors for Shopify, Stripe, Salesforce, Google Analytics, 
                and every major business platform including WooCommerce, BigCommerce, PayPal, Square, HubSpot, and more.
              </p>
            </div>
            <div className="app__feature">
              <div className="app__feature-icon">🧠</div>
              <h3>Business Intelligence Engine</h3>
              <p>
                AI that comprehends business terminology and context, with cross-platform 
                correlation and predictive analytics.
              </p>
            </div>
            <div className="app__feature">
              <div className="app__feature-icon">⚡</div>
              <h3>Three-Line Integration</h3>
              <p>
                Add conversational BI to any application in minutes with our developer-first 
                SDK and React components.
              </p>
            </div>
            <div className="app__feature">
              <div className="app__feature-icon">🏢</div>
              <h3>Enterprise Infrastructure</h3>
              <p>
                Global scale with 99.9% uptime SLA, multi-tenant security, and compliance 
                with GDPR, HIPAA, and SOC2.
              </p>
            </div>
          </div>
        </div>

        <div className="app__examples">
          <h2>Example Queries</h2>
          <div className="app__examples-grid">
            <div className="app__example">
              <h4>E-commerce Analytics</h4>
              <ul>
                <li>"What are my top selling products this month?"</li>
                <li>"Which products are trending but low on inventory?"</li>
                <li>"Show me customer lifetime value by acquisition channel"</li>
              </ul>
            </div>
            <div className="app__example">
              <h4>Sales & Revenue</h4>
              <ul>
                <li>"What's my revenue trend over the last quarter?"</li>
                <li>"Which deals are most likely to close this month?"</li>
                <li>"Show me conversion rates by lead source"</li>
              </ul>
            </div>
            <div className="app__example">
              <h4>Marketing Performance</h4>
              <ul>
                <li>"How is my Facebook ad spend affecting sales?"</li>
                <li>"Which marketing channels drive the highest LTV customers?"</li>
                <li>"Show me website traffic and conversion trends"</li>
              </ul>
            </div>
            <div className="app__example">
              <h4>Customer Insights</h4>
              <ul>
                <li>"What customers are most likely to churn this month?"</li>
                <li>"Show me customer segments by purchase behavior"</li>
                <li>"Which customers haven't been contacted in 30 days?"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="app__integration">
          <h2>Quick Integration</h2>
          <div className="app__code-example">
            <pre>
              <code>
{`import { ConversaSDK } from '@conversa/sdk';

const conversa = new ConversaSDK({
  apiKey: 'your-api-key',
  dataSources: [
    {
      type: 'shopify',
      credentials: { accessToken: 'token', shopName: 'shop' }
    }
  ],
  businessContext: { industry: 'ecommerce' }
});

const response = await conversa.query('What are my top selling products?');`}
              </code>
            </pre>
          </div>
        </div>
      </main>

      <footer className="app__footer">
        <div className="app__footer-content">
          <p>
            Built with <span className="app__footer-heart">❤️</span> by the Conversa SDK team
          </p>
          <div className="app__footer-links">
            <a href="https://www.conversabi.dev" target="_blank" rel="noopener noreferrer">
              Website
            </a>
            <a href="https://docs.conversabi.dev" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
            <a href="https://github.com/conversa-sdk" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
