// Core types for Conversa SDK

export interface ConversaBIConfig {
  apiKey: string;
  endpoint?: string;
  tenant?: string;
  theme?: ThemeConfig;
  dataSources?: DataSource[]; // Optional for hosted platform
  businessContext?: BusinessContext;
  options?: ConversaOptions;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  mode?: 'light' | 'dark' | 'auto';
}

export interface DataSource {
  type: DataSourceType;
  credentials: DataSourceCredentials;
  config?: Record<string, any>;
}

export type DataSourceType = 
  | 'shopify'
  | 'stripe'
  | 'salesforce'
  | 'google-analytics'
  | 'hubspot'
  | 'mailchimp'
  | 'zendesk'
  | 'intercom'
  | 'woocommerce'
  | 'bigcommerce'
  | 'paypal'
  | 'square'
  | 'custom';

export interface DataSourceCredentials {
  [key: string]: string | number | boolean;
}

export interface BusinessContext {
  industry?: string;
  metrics?: string[];
  terminology?: Record<string, string>;
  timezone?: string;
  currency?: string;
}

export interface ConversaOptions {
  cacheEnabled?: boolean;
  cacheTimeout?: number;
  maxRetries?: number;
  timeout?: number;
  debug?: boolean;
}

export interface QueryRequest {
  query: string;
  context?: QueryContext;
  options?: QueryOptions;
}

export interface QueryContext {
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface QueryOptions {
  includeRawData?: boolean;
  format?: ResponseFormat;
  limit?: number;
  timeRange?: TimeRange;
}

export type ResponseFormat = 'text' | 'json' | 'table' | 'chart';

export interface TimeRange {
  start: Date;
  end: Date;
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface QueryResponse {
  id: string;
  query: string;
  response: string;
  data?: QueryData;
  insights?: BusinessInsight[];
  metadata: ResponseMetadata;
  timestamp: Date;
}

export interface QueryData {
  raw?: any[];
  processed?: any[];
  summary?: DataSummary;
}

export interface DataSummary {
  totalRecords: number;
  dateRange: TimeRange;
  keyMetrics: Record<string, number>;
}

export interface BusinessInsight {
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  data?: any;
  recommendations?: string[];
}

export type InsightType = 
  | 'trend'
  | 'anomaly'
  | 'correlation'
  | 'prediction'
  | 'recommendation'
  | 'alert';

export interface ResponseMetadata {
  processingTime: number;
  dataSources: string[];
  cacheHit: boolean;
  queryComplexity: 'simple' | 'moderate' | 'complex';
}

export interface ConnectorCapabilities {
  dataTypes: string[];
  operations: string[];
  realTime: boolean;
  batchSize: number;
  rateLimit: number;
}

export interface ConnectorStatus {
  connected: boolean;
  lastSync: Date;
  errorCount: number;
  latency: number;
}

export interface ConversaError extends Error {
  code: string;
  details?: any;
  retryable?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: QueryContext;
  createdAt: Date;
  updatedAt: Date;
}

// React Component Props
export interface ConversaChatProps {
  config: ConversaBIConfig;
  onMessage?: (message: ChatMessage) => void;
  onResponse?: (response: QueryResponse) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface ConversaDashboardProps {
  config: ConversaBIConfig;
  queries: string[];
  refreshInterval?: number;
  className?: string;
}

// MCP Protocol Types
export interface MCPServer {
  name: string;
  version: string;
  capabilities: string[];
  tools: MCPTool[];
  resources: MCPResource[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}
