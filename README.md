# ConversaBI SDK

> Open source SDK for ConversaBI - AI-native business intelligence platform

[![npm version](https://badge.fury.io/js/%40conversabi%2Fsdk.svg)](https://badge.fury.io/js/%40conversabi%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ConversaBI SDK is the open source client library for the ConversaBI platform - the first developer platform specifically designed to add conversational business intelligence to any application. Built on the emerging Model Context Protocol (MCP) standard, ConversaBI enables developers to transform complex business data into ChatGPT-like conversations with just three lines of code.

## 🏗️ Architecture

ConversaBI follows a "Stripe Model" architecture:
- **Open Source SDK**: This repository contains the client libraries and tools
- **Hosted Platform**: AI processing, multi-tenant infrastructure, and enterprise features
- **Community**: MCP server templates and connector contributions

## 🚀 Quick Start

### Installation

```bash
npm install @conversabi/sdk
```

### Basic Usage (Hosted Platform)

```typescript
import { ConversaBI } from '@conversabi/sdk';

const conversa = new ConversaBI({
  apiKey: 'your-api-key',
  endpoint: 'https://api.conversabi.dev', // Optional, defaults to hosted platform
  tenant: 'your-tenant-id', // Optional, for multi-tenant setups
  theme: { primaryColor: '#007bff' } // Optional theme configuration
});

await conversa.init();
const response = await conversa.query('What are my top selling products?');
console.log(response.response);
```

### Local Development Mode

```typescript
import { ConversaBI } from '@conversabi/sdk';

const conversa = new ConversaBI({
  apiKey: 'your-api-key',
  dataSources: [
    {
      type: 'shopify',
      credentials: { accessToken: 'token', shopName: 'shop' }
    }
  ],
  businessContext: { industry: 'ecommerce' }
});

await conversa.init();
const response = await conversa.query('What are my top selling products?');
console.log(response.response);
```

### React Integration

```tsx
import { ConversaChat } from '@conversabi/sdk';

function App() {
  const config = {
    apiKey: 'your-api-key',
    endpoint: 'https://api.conversabi.dev',
    tenant: 'your-tenant-id',
    theme: { primaryColor: '#007bff' }
  };

  return (
    <ConversaChat
      config={config}
      onMessage={(message) => console.log(message)}
      onResponse={(response) => console.log(response)}
    />
  );
}
```

### Python Integration

```python
import asyncio
from conversabi import ConversaBI

async def main():
    # Hosted platform mode
    conversa = ConversaBI(
        api_key="your-api-key",
        endpoint="https://api.conversabi.dev",
        tenant="your-tenant-id"
    )
    
    await conversa.init()
    response = await conversa.query("What are my top selling products?")
    print(response.response)

# Flask integration
from conversabi import ConversaBI
from conversabi.integrations.flask import init_app

app = Flask(__name__)
conversa = ConversaBI("your-api-key")
init_app(app, conversa)

# Django integration
from conversabi.integrations.django import get_urlpatterns

urlpatterns = [
    path('conversabi/', include(get_urlpatterns())),
]

# FastAPI integration
from conversabi.integrations.fastapi import create_router

app = FastAPI()
router = create_router(conversa)
app.include_router(router)
```

## 🏗️ Platform Architecture

ConversaBI follows a "Stripe Model" architecture with open source tools driving hosted platform adoption:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ConversaBI Ecosystem                        │
├─────────────────────┬───────────────────────┬───────────────────┤
│   Open Source       │    Hosted Platform    │   Enterprise      │
│   (Community)       │    (SaaS Revenue)     │   (Premium)       │
├─────────────────────┼───────────────────────┼───────────────────┤
│ • SDK Libraries     │ • AI Query Engine     │ • SSO Integration │
│ • MCP Templates     │ • Multi-Tenant API    │ • Custom Models   │
│ • Documentation     │ • Usage Analytics     │ • SLA Guarantees  │
│ • CLI Tools         │ • Developer Portal    │ • Audit Logs     │
└─────────────────────┴───────────────────────┴───────────────────┘
```

### Technology Stack

**Frontend & Client SDKs:**
- **TypeScript/JavaScript**: Full type safety and excellent DX
- **Python**: Async client with framework integrations (Flask, Django, FastAPI)
- WebSockets: Real-time bidirectional communication
- React/Vue/Angular: Framework integrations
- Vite: Fast development and building

**Backend Platform Services:**
- Node.js with TypeScript: Consistent language across stack
- Fastify: High-performance HTTP framework
- tRPC: End-to-end type safety between client/server
- PostgreSQL: Multi-tenant database architecture
- Redis: Session storage, caching, rate limiting

**AI/ML Processing (Python):**
- OpenAI API: LLM processing with Azure OpenAI fallback
- Transformers/HuggingFace: Custom model fine-tuning
- LangChain: AI workflow orchestration
- Celery with Redis: Background job processing
- Ray: Distributed computing for model training

## 🔌 Data Connectors

### Supported Platforms

- **E-commerce** (15): Shopify, WooCommerce, BigCommerce, Magento, Squarespace, Wix, PrestaShop, OpenCart, Volusion, Ecwid, Shopware, Commercetools, Elastic Path, Spree, Sylius
- **Payments** (12): Stripe, PayPal, Square, Braintree, Razorpay, Adyen, Worldpay, Authorize.Net, Mollie, Klarna, Afterpay, Sezzle
- **CRM** (10): Salesforce, HubSpot, Pipedrive, Zoho, Monday.com, Freshworks, Insightly, Agile CRM, Nimble, Copper
- **Analytics** (8): Google Analytics, Mixpanel, Amplitude, Adobe Analytics, Heap, Hotjar, FullStory, Segment
- **Marketing** (12): Mailchimp, Klaviyo, SendGrid, Constant Contact, Campaign Monitor, AWeber, GetResponse, ActiveCampaign, Pardot, Marketo, HubSpot Marketing, Intercom
- **Support** (8): Zendesk, Intercom, Freshdesk, Help Scout, Kayako, Desk.com, UserVoice, Zoho Desk
- **Social Media** (10): Facebook Ads, LinkedIn Ads, Twitter Ads, Instagram Ads, TikTok Ads, Snapchat Ads, Pinterest Ads, YouTube Ads, Reddit Ads, Quora Ads
- **Productivity** (8): Slack, Microsoft Teams, Asana, Trello, Notion, Airtable, ClickUp, Monday.com
- **Cloud Storage** (6): Google Drive, Dropbox, OneDrive, Box, AWS S3, Azure Blob Storage
- **Databases** (8): MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, Cassandra, DynamoDB, Firebase
- **And more...**

### Adding Custom Connectors

```typescript
import { BaseConnector } from '@conversa/sdk';

class CustomConnector extends BaseConnector {
  async executeQuery(processedQuery: any): Promise<any> {
    // Your custom logic here
    return { data: [] };
  }
  
  getType(): string {
    return 'custom';
  }
}
```

## 🧠 Natural Language Processing

The SDK includes a sophisticated NLP engine specifically optimized for business intelligence queries:

- **Business Query Understanding**: Trained on millions of business intelligence queries
- **Domain-Specific Terminology**: Understands CAC, LTV, churn, MRR, and more
- **Context-Aware Interpretation**: Maintains conversation context across queries
- **Cross-Platform Correlation**: Connects insights across multiple data sources

## ⚡ Model Context Protocol (MCP)

Conversa SDK is built on the Model Context Protocol, providing:

- **Standardized Security**: Consistent access controls across all connectors
- **Real-time Synchronization**: Live data updates across platforms
- **Vendor-Neutral Architecture**: No vendor lock-in
- **Enterprise-Grade Hosting**: Scalable, reliable infrastructure

## 🎨 React Components

### ConversaChat

The main chat component for conversational BI:

```tsx
<ConversaChat
  config={config}
  onMessage={(message) => handleMessage(message)}
  onResponse={(response) => handleResponse(response)}
  placeholder="Ask questions about your data..."
  disabled={false}
/>
```

### DataVisualization

Automatically renders data in appropriate formats:

```tsx
<DataVisualization data={queryResponse.data} />
```

## 📊 Business Intelligence Features

### Query Types

- **Retrieval**: "What are my top selling products?"
- **Comparison**: "Compare this month's revenue to last month"
- **Trends**: "Show me sales trends over the last quarter"
- **Predictions**: "What will my revenue be next month?"
- **Correlations**: "How does ad spend affect conversion rates?"

### Insights Generation

- **Trend Analysis**: Identify patterns and anomalies
- **Cross-Platform Correlation**: Connect insights across data sources
- **Predictive Analytics**: Forecast future performance
- **Recommendations**: Actionable business insights

## 🛡️ Security & Compliance

- **SOC2 Type II** certification
- **GDPR** compliance with data residency options
- **HIPAA** compliance for healthcare applications
- **End-to-end encryption** for all data transmission
- **Zero-knowledge architecture** - we never store customer data

## 🚀 Performance

- **Sub-500ms** query responses worldwide
- **99.9% uptime** SLA with automated failover
- **Auto-scaling** infrastructure handles millions of queries
- **Intelligent caching** reduces response times

## 📚 Documentation

- [Getting Started Guide](https://docs.conversabi.dev/getting-started)
- [API Reference](https://docs.conversabi.dev/api)
- [React Components](https://docs.conversabi.dev/components)
- [Data Connectors](https://docs.conversabi.dev/connectors)
- [Examples](https://docs.conversabi.dev/examples)

## 🎯 Use Cases

### E-commerce Platforms
- Product performance analysis
- Inventory optimization
- Customer behavior insights
- Marketing campaign effectiveness

### CRM & Sales Applications
- Pipeline analysis
- Lead scoring and prioritization
- Sales performance tracking
- Customer relationship insights

### Financial Technology
- Revenue analysis and forecasting
- Customer financial behavior
- Risk assessment
- Compliance reporting

### Analytics & BI Platforms
- Self-service analytics
- Automated reporting
- Data exploration
- Business intelligence dashboards

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.conversabi.dev](https://docs.conversabi.dev)
- **Community**: [community.conversabi.dev](https://community.conversabi.dev)
- **Email**: developers@conversabi.com
- **GitHub Issues**: [github.com/conversa-sdk/conversa-sdk/issues](https://github.com/conversa-sdk/conversa-sdk/issues)

## 🏢 Enterprise

For enterprise customers, we offer:

- **Custom Connectors**: Build connectors for your specific data sources
- **On-Premise Deployment**: Keep your data behind your firewall
- **Dedicated Support**: 24/7 technical support
- **SLA Guarantees**: 99.9% uptime with financial guarantees

Contact us at [enterprise@conversabi.com](mailto:enterprise@conversabi.com) to learn more.

---

**Built with ❤️ by the Conversa SDK team**

*Making every database conversational*
