import {
  DataSourceCredentials,
  ConnectorStatus,
  ConnectorCapabilities,
  QueryRequest,
} from '../types';

/**
 * Base class for all data connectors
 * Provides common functionality and interface for data source integration
 */
export abstract class BaseConnector {
  protected credentials: DataSourceCredentials;
  protected config: Record<string, any>;
  protected isConnected = false;
  protected lastSync: Date = new Date(0);
  protected errorCount = 0;
  protected latency = 0;

  constructor(credentials: DataSourceCredentials, config?: Record<string, any>) {
    this.credentials = credentials;
    this.config = config || {};
  }

  /**
   * Initialize the connector and establish connection
   */
  abstract initialize(): Promise<void>;

  /**
   * Execute a query against the data source
   */
  abstract executeQuery(processedQuery: any, context?: any): Promise<any>;

  /**
   * Test the connection to the data source
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Get the connector type
   */
  abstract getType(): string;

  /**
   * Get connector capabilities
   */
  abstract getCapabilities(): Promise<ConnectorCapabilities>;

  /**
   * Get connector status
   */
  async getStatus(): Promise<ConnectorStatus> {
    return {
      connected: this.isConnected,
      lastSync: this.lastSync,
      errorCount: this.errorCount,
      latency: this.latency,
    };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    this.isConnected = false;
  }

  /**
   * Validate credentials
   */
  protected validateCredentials(): boolean {
    // Basic validation - should be overridden by specific connectors
    return Object.keys(this.credentials).length > 0;
  }

  /**
   * Handle errors and update error count
   */
  protected handleError(error: Error): void {
    this.errorCount++;
    console.error(`Connector ${this.getType()} error:`, error.message);
  }

  /**
   * Update connection status
   */
  protected updateConnectionStatus(connected: boolean): void {
    this.isConnected = connected;
    if (connected) {
      this.lastSync = new Date();
    }
  }

  /**
   * Measure and update latency
   */
  protected async measureLatency<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await operation();
      this.latency = Date.now() - startTime;
      return result;
    } catch (error) {
      this.latency = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * Parse query parameters from processed query
   */
  protected parseQueryParams(processedQuery: any): QueryParams {
    return {
      operations: processedQuery.operations || [],
      entities: processedQuery.entities || [],
      timeRange: processedQuery.timeRange,
      limit: this.config.limit || 100,
      offset: 0,
    };
  }

  /**
   * Format data according to connector standards
   */
  protected formatData(data: any[], metadata?: any): any {
    return {
      data,
      metadata: {
        source: this.getType(),
        timestamp: new Date(),
        count: data.length,
        ...metadata,
      },
    };
  }
}

// Supporting types
interface QueryParams {
  operations: string[];
  entities: any[];
  timeRange?: any;
  limit: number;
  offset: number;
}

