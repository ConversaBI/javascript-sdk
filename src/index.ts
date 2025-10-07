// Main entry point for ConversaBI SDK
export { ConversaBI } from './core/ConversaSDK';
export { DataConnectorManager } from './core/DataConnectorManager';
export { NLPEngine } from './core/NLPEngine';
export { MCPOrchestrator } from './core/MCPOrchestrator';
export { CacheManager } from './core/CacheManager';

// Data Connectors
export { BaseConnector } from './connectors/BaseConnector';
export { ShopifyConnector } from './connectors/ShopifyConnector';
export { StripeConnector } from './connectors/StripeConnector';
export { GoogleAnalyticsConnector } from './connectors/GoogleAnalyticsConnector';
export { SalesforceConnector } from './connectors/SalesforceConnector';
export { WooCommerceConnector } from './connectors/WooCommerceConnector';
export { BigCommerceConnector } from './connectors/BigCommerceConnector';
export { PayPalConnector } from './connectors/PayPalConnector';
export { SquareConnector } from './connectors/SquareConnector';

// Connector Registry
export { 
  CONNECTOR_REGISTRY, 
  getAllConnectorTypes, 
  getConnectorInfo, 
  getConnectorsByCategory, 
  getTotalConnectorCount 
} from './connectors/ConnectorRegistry';

// React Components
export { ConversaChat } from './components/ConversaChat';
export { MessageList } from './components/MessageList';
export { MessageBubble } from './components/MessageBubble';
export { MessageInput } from './components/MessageInput';
export { DataVisualization } from './components/DataVisualization';
export { LoadingIndicator } from './components/LoadingIndicator';
export { ErrorDisplay } from './components/ErrorDisplay';

// Types
export * from './types';

// Version
export const VERSION = '1.0.0';
