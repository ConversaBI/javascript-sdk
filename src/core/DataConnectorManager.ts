import {
  DataSource,
  DataSourceType,
  ConnectorStatus,
  QueryRequest,
  QueryResponse,
  ConnectorCapabilities,
} from '../types';
import { BaseConnector } from '../connectors/BaseConnector';
import { ShopifyConnector } from '../connectors/ShopifyConnector';
import { StripeConnector } from '../connectors/StripeConnector';
import { GoogleAnalyticsConnector } from '../connectors/GoogleAnalyticsConnector';
import { SalesforceConnector } from '../connectors/SalesforceConnector';
import { WooCommerceConnector } from '../connectors/WooCommerceConnector';
import { BigCommerceConnector } from '../connectors/BigCommerceConnector';
import { PayPalConnector } from '../connectors/PayPalConnector';
import { SquareConnector } from '../connectors/SquareConnector';

/**
 * Manages all data connectors and orchestrates queries across multiple sources
 */
export class DataConnectorManager {
  private connectors: Map<string, BaseConnector> = new Map();
  private connectorClasses: Map<DataSourceType, typeof BaseConnector> = new Map();

  constructor() {
    this.registerConnectorClasses();
  }

  /**
   * Register all available connector classes
   */
  private registerConnectorClasses(): void {
    // E-commerce connectors
    this.connectorClasses.set('shopify', ShopifyConnector);
    this.connectorClasses.set('woocommerce', WooCommerceConnector);
    this.connectorClasses.set('bigcommerce', BigCommerceConnector);
    
    // Payment connectors
    this.connectorClasses.set('stripe', StripeConnector);
    this.connectorClasses.set('paypal', PayPalConnector);
    this.connectorClasses.set('square', SquareConnector);
    
    // Analytics connectors
    this.connectorClasses.set('google-analytics', GoogleAnalyticsConnector);
    
    // CRM connectors
    this.connectorClasses.set('salesforce', SalesforceConnector);
  }

  /**
   * Add a new data connector
   */
  async addConnector(dataSource: DataSource): Promise<void> {
    const ConnectorClass = this.connectorClasses.get(dataSource.type);
    if (!ConnectorClass) {
      throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }

    // Create connector instance - we know these are concrete classes
    const connector = new (ConnectorClass as any)(dataSource.credentials, dataSource.config);
    await connector.initialize();
    
    this.connectors.set(dataSource.type, connector);
  }

  /**
   * Remove a data connector
   */
  async removeConnector(type: string): Promise<void> {
    const connector = this.connectors.get(type);
    if (connector) {
      await connector.destroy();
      this.connectors.delete(type);
    }
  }

  /**
   * Execute a query across all relevant connectors
   */
  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const results: any[] = [];
    const relevantConnectors = this.getRelevantConnectors(processedQuery);

    // Execute queries in parallel for better performance
    const promises = relevantConnectors.map(async (connector) => {
      try {
        const result = await connector.executeQuery(processedQuery, context);
        return { type: connector.getType(), data: result, success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { 
          type: connector.getType(), 
          error: errorMessage, 
          success: false 
        };
      }
    });

    const responses = await Promise.all(promises);
    
    // Combine successful results
    for (const response of responses) {
      if (response.success) {
        results.push(response.data);
      } else {
        console.warn(`Query failed for ${response.type}: ${response.error}`);
      }
    }

    return this.combineResults(results, processedQuery);
  }

  /**
   * Get status of all connectors
   */
  async getStatus(): Promise<Record<string, ConnectorStatus>> {
    const status: Record<string, ConnectorStatus> = {};

    for (const [type, connector] of this.connectors) {
      try {
        status[type] = await connector.getStatus();
      } catch (error) {
        status[type] = {
          connected: false,
          lastSync: new Date(0),
          errorCount: 1,
          latency: -1,
        };
      }
    }

    return status;
  }

  /**
   * Get capabilities of all connectors
   */
  async getCapabilities(): Promise<Record<string, ConnectorCapabilities>> {
    const capabilities: Record<string, ConnectorCapabilities> = {};

    for (const [type, connector] of this.connectors) {
      capabilities[type] = await connector.getCapabilities();
    }

    return capabilities;
  }

  /**
   * Test connection to a specific connector
   */
  async testConnection(type: string): Promise<boolean> {
    const connector = this.connectors.get(type);
    if (!connector) {
      return false;
    }

    try {
      return await connector.testConnection();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all available connector types
   */
  getAvailableConnectorTypes(): DataSourceType[] {
    return Array.from(this.connectorClasses.keys());
  }

  /**
   * Register a custom connector class
   */
  registerConnector(type: DataSourceType, ConnectorClass: typeof BaseConnector): void {
    this.connectorClasses.set(type, ConnectorClass);
  }

  /**
   * Cleanup all connectors
   */
  async destroy(): Promise<void> {
    const destroyPromises = Array.from(this.connectors.values()).map(
      connector => connector.destroy()
    );
    await Promise.all(destroyPromises);
    this.connectors.clear();
  }

  // Private helper methods
  private getRelevantConnectors(processedQuery: any): BaseConnector[] {
    const relevant: BaseConnector[] = [];
    
    // Determine which connectors are needed based on the query
    for (const [type, connector] of this.connectors) {
      if (this.isConnectorRelevant(connector, processedQuery)) {
        relevant.push(connector);
      }
    }

    return relevant;
  }

  private isConnectorRelevant(connector: BaseConnector, processedQuery: any): boolean {
    // Simple heuristic - in a real implementation, this would be more sophisticated
    const queryText = processedQuery.originalQuery?.toLowerCase() || '';
    const connectorType = connector.getType().toLowerCase();

    // Check if the query mentions the connector type or related terms
    const relevantTerms = this.getRelevantTerms(connectorType);
    return relevantTerms.some(term => queryText.includes(term));
  }

  private getRelevantTerms(connectorType: string): string[] {
    const termMap: Record<string, string[]> = {
      'shopify': ['product', 'order', 'customer', 'inventory', 'sales', 'shopify'],
      'stripe': ['payment', 'subscription', 'revenue', 'transaction', 'stripe'],
      'google-analytics': ['traffic', 'visitor', 'pageview', 'conversion', 'analytics'],
      'salesforce': ['lead', 'opportunity', 'account', 'contact', 'salesforce'],
    };

    return termMap[connectorType] || [connectorType];
  }

  private combineResults(results: any[], processedQuery: any): any {
    if (results.length === 0) {
      return { data: [], summary: { totalRecords: 0 } };
    }

    if (results.length === 1) {
      return results[0];
    }

    // Combine multiple results - this is a simplified version
    // In a real implementation, this would be much more sophisticated
    const combinedData: any[] = [];
    let totalRecords = 0;

    for (const result of results) {
      if (result.data && Array.isArray(result.data)) {
        combinedData.push(...result.data);
        totalRecords += result.data.length;
      }
    }

    return {
      data: combinedData,
      summary: {
        totalRecords,
        sources: results.length,
      },
    };
  }
}
