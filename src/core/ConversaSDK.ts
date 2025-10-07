import {
  ConversaBIConfig,
  QueryRequest,
  QueryResponse,
  DataSource,
  ConnectorStatus,
  ConversaError,
  ChatSession,
  ChatMessage,
  MCPServer,
} from '../types';
import { DataConnectorManager } from './DataConnectorManager';
import { NLPEngine } from './NLPEngine';
import { MCPOrchestrator } from './MCPOrchestrator';
import { CacheManager } from './CacheManager';
import { EventEmitter } from 'events';
import { ConversaError, ErrorHandler, ErrorFactory } from '../utils/error-handler';

/**
 * Main ConversaBI SDK class - Open source client for ConversaBI platform
 * 
 * @example
 * ```typescript
 * import { ConversaBI } from '@conversabi/sdk';
 * 
 * const conversa = new ConversaBI({
 *   apiKey: 'your-api-key',
 *   endpoint: 'https://api.conversabi.dev', // Optional, defaults to hosted platform
 *   tenant: 'your-tenant-id', // Optional, for multi-tenant setups
 *   theme: { primaryColor: '#007bff' } // Optional theme configuration
 * });
 * 
 * await conversa.init();
 * const response = await conversa.query('What are my top selling products?');
 * ```
 */
export class ConversaBI extends EventEmitter {
  private config: ConversaBIConfig;
  private connectorManager: DataConnectorManager;
  private nlpEngine: NLPEngine;
  private mcpOrchestrator: MCPOrchestrator;
  private cacheManager: CacheManager;
  private isInitialized = false;
  private apiEndpoint: string;

  constructor(config: ConversaBIConfig) {
    super();
    this.config = config;
    this.apiEndpoint = config.endpoint || 'https://api.conversabi.dev';
    this.connectorManager = new DataConnectorManager();
    this.nlpEngine = new NLPEngine(config.businessContext);
    this.mcpOrchestrator = new MCPOrchestrator();
    this.cacheManager = new CacheManager(config.options?.cacheEnabled ?? true);
  }

  /**
   * Initialize the SDK and establish connections to data sources
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // For hosted platform, initialize via API
      if (this.config.dataSources && this.config.dataSources.length > 0) {
        // Local mode with data sources
        await this.mcpOrchestrator.initialize();
        
        for (const dataSource of this.config.dataSources) {
          await this.connectorManager.addConnector(dataSource);
        }
        
        await this.nlpEngine.initialize();
      } else {
        // Hosted platform mode - initialize via API
        await this.initializeWithHostedPlatform();
      }

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      throw ErrorHandler.handle(error, {
        operation: 'initialize',
        tenant: this.config.tenant
      });
    }
  }

  /**
   * Initialize with hosted platform services
   */
  private async initializeWithHostedPlatform(): Promise<void> {
    const response = await fetch(`${this.apiEndpoint}/v1/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant: this.config.tenant,
        theme: this.config.theme,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize with hosted platform: ${response.statusText}`);
    }

    const data = await response.json();
    // Store platform configuration
    this.emit('platformInitialized', data);
  }

  /**
   * Execute a natural language query against connected data sources
   */
  async query(message: string): Promise<QueryResponse> {
    if (!this.isInitialized) {
      await this.init();
    }

    const startTime = Date.now();

    try {
      // Check if using hosted platform
      if (!this.config.dataSources || this.config.dataSources.length === 0) {
        return await this.queryHostedPlatform(message);
      }

      // Local processing with data sources
      const cacheKey = this.generateCacheKey(message);
      const cachedResponse = await this.cacheManager.get(cacheKey);
      if (cachedResponse) {
        return {
          ...cachedResponse,
          metadata: {
            ...cachedResponse.metadata,
            cacheHit: true,
          },
        };
      }

      // Process natural language query
      const processedQuery = await this.nlpEngine.processQuery(message);

      // Execute query across data sources
      const results = await this.connectorManager.executeQuery(
        processedQuery,
        { tenant: this.config.tenant }
      );

      // Generate business insights
      const insights = await this.nlpEngine.generateInsights(
        results,
        processedQuery
      );

      // Format response
      const response: QueryResponse = {
        id: this.generateResponseId(),
        query: message,
        response: await this.nlpEngine.formatResponse(results, insights),
        data: results,
        insights,
        metadata: {
          processingTime: Date.now() - startTime,
          dataSources: this.config.dataSources.map(ds => ds.type),
          cacheHit: false,
          queryComplexity: this.assessQueryComplexity(processedQuery),
        },
        timestamp: new Date(),
      };

      // Cache the response
      await this.cacheManager.set(cacheKey, response);

      this.emit('query', response);
      return response;
    } catch (error) {
      const conversaError = ErrorHandler.handle(error, {
        operation: 'query',
        tenant: this.config.tenant,
        metadata: { query: message }
      });
      this.emit('error', conversaError);
      throw conversaError;
    }
  }

  /**
   * Query hosted platform services
   */
  private async queryHostedPlatform(message: string): Promise<QueryResponse> {
    const response = await fetch(`${this.apiEndpoint}/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tenant: this.config.tenant,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hosted platform query failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new chat session for conversational interactions
   */
  async createChatSession(context?: any): Promise<ChatSession> {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      messages: [],
      context: context || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.emit('sessionCreated', session);
    return session;
  }

  /**
   * Send a message in a chat session
   */
  async sendMessage(
    sessionId: string,
    message: string,
    context?: any
  ): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Execute query
    const response = await this.query(message);

    const assistantMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: response.response,
      timestamp: new Date(),
      metadata: { queryResponse: response },
    };

    this.emit('message', { sessionId, userMessage, assistantMessage });
    return assistantMessage;
  }

  /**
   * Get status of all data connectors
   */
  async getConnectorStatus(): Promise<Record<string, ConnectorStatus>> {
    return this.connectorManager.getStatus();
  }

  /**
   * Add a new data source
   */
  async addDataSource(dataSource: DataSource): Promise<void> {
    await this.connectorManager.addConnector(dataSource);
    this.config.dataSources.push(dataSource);
    this.emit('dataSourceAdded', dataSource);
  }

  /**
   * Remove a data source
   */
  async removeDataSource(type: string): Promise<void> {
    await this.connectorManager.removeConnector(type);
    this.config.dataSources = this.config.dataSources.filter(
      ds => ds.type !== type
    );
    this.emit('dataSourceRemoved', type);
  }

  /**
   * Get available MCP servers
   */
  async getMCPServers(): Promise<MCPServer[]> {
    return this.mcpOrchestrator.getServers();
  }

  /**
   * Update business context
   */
  updateBusinessContext(context: any): void {
    this.config.businessContext = {
      ...this.config.businessContext,
      ...context,
    };
    this.nlpEngine.updateContext(this.config.businessContext);
    this.emit('contextUpdated', this.config.businessContext);
  }

  /**
   * Get SDK configuration
   */
  getConfig(): ConversaBIConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.connectorManager.destroy();
    await this.mcpOrchestrator.destroy();
    await this.cacheManager.destroy();
    this.isInitialized = false;
    this.emit('destroyed');
  }

  // Private helper methods
  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(query: string, context?: any): string {
    const queryHash = btoa(query).replace(/[^a-zA-Z0-9]/g, '');
    const contextHash = context ? btoa(JSON.stringify(context)).replace(/[^a-zA-Z0-9]/g, '') : '';
    return `query_${queryHash}_${contextHash}`;
  }

  private assessQueryComplexity(query: any): 'simple' | 'moderate' | 'complex' {
    // Simple heuristic based on query structure
    if (query.dataSources.length === 1 && query.operations.length <= 2) {
      return 'simple';
    } else if (query.dataSources.length <= 3 && query.operations.length <= 5) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }
}
