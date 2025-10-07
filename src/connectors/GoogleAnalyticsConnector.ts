import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

/**
 * Google Analytics data connector
 * Handles integration with Google Analytics for web analytics data
 */
export class GoogleAnalyticsConnector extends BaseConnector {
  private accessToken: string;
  private propertyId: string;
  private apiUrl = 'https://analyticsdata.googleapis.com/v1beta';

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.accessToken = credentials.accessToken;
    this.propertyId = credentials.propertyId;
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid Google Analytics credentials');
    }

    try {
      const connected = await this.testConnection();
      this.updateConnectionStatus(connected);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/properties/${this.propertyId}/metadata`);
      return response.dimensions && response.metrics;
    } catch (error) {
      return false;
    }
  }

  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const params = this.parseQueryParams(processedQuery);
    
    try {
      if (this.isTrafficQuery(processedQuery)) {
        return await this.queryTraffic(params);
      } else if (this.isConversionQuery(processedQuery)) {
        return await this.queryConversions(params);
      } else if (this.isAudienceQuery(processedQuery)) {
        return await this.queryAudience(params);
      } else if (this.isContentQuery(processedQuery)) {
        return await this.queryContent(params);
      } else {
        // Default to traffic for general queries
        return await this.queryTraffic(params);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getType(): string {
    return 'google-analytics';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['traffic', 'conversions', 'audience', 'content', 'acquisition'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'compare'],
      realTime: true,
      batchSize: 10000,
      rateLimit: 100, // requests per second
    };
  }

  // Private helper methods
  private async makeRequest(endpoint: string, body?: any): Promise<any> {
    const url = this.apiUrl + endpoint;
    
    const options: RequestInit = {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.method = 'POST';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Google Analytics API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isTrafficQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('traffic') || query.includes('visitor') || query.includes('session') ||
           processedQuery.entities.some((e: any) => e.type === 'traffic');
  }

  private isConversionQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('conversion') || query.includes('goal') || query.includes('purchase') ||
           processedQuery.entities.some((e: any) => e.type === 'conversion');
  }

  private isAudienceQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('audience') || query.includes('demographic') || query.includes('user') ||
           processedQuery.entities.some((e: any) => e.type === 'audience');
  }

  private isContentQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('page') || query.includes('content') || query.includes('article') ||
           processedQuery.entities.some((e: any) => e.type === 'content');
  }

  private async queryTraffic(params: any): Promise<any> {
    const requestBody = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'users' },
        { name: 'pageviews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensions: [
        { name: 'date' },
      ],
      limit: params.limit,
    };

    const response = await this.makeRequest(`/properties/${this.propertyId}:runReport`, requestBody);
    
    // Mock data for demonstration
    const mockTraffic = [
      {
        date: '2024-01-15',
        sessions: 1250,
        users: 980,
        pageviews: 3420,
        bounceRate: 0.35,
        averageSessionDuration: 180.5,
        newUsers: 420,
        returningUsers: 560,
      },
      {
        date: '2024-01-14',
        sessions: 1180,
        users: 920,
        pageviews: 3150,
        bounceRate: 0.38,
        averageSessionDuration: 165.2,
        newUsers: 380,
        returningUsers: 540,
      },
      {
        date: '2024-01-13',
        sessions: 1320,
        users: 1050,
        pageviews: 3680,
        bounceRate: 0.32,
        averageSessionDuration: 195.8,
        newUsers: 450,
        returningUsers: 600,
      },
    ];

    return this.formatData(mockTraffic, {
      total: mockTraffic.length,
      source: 'google-analytics',
      endpoint: '/traffic',
    });
  }

  private async queryConversions(params: any): Promise<any> {
    const requestBody = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'conversions' },
        { name: 'conversionRate' },
        { name: 'totalRevenue' },
        { name: 'transactions' },
      ],
      dimensions: [
        { name: 'date' },
        { name: 'sourceMedium' },
      ],
      limit: params.limit,
    };

    const response = await this.makeRequest(`/properties/${this.propertyId}:runReport`, requestBody);
    
    // Mock data for demonstration
    const mockConversions = [
      {
        date: '2024-01-15',
        sourceMedium: 'google / organic',
        conversions: 45,
        conversionRate: 0.036,
        totalRevenue: 2250.00,
        transactions: 45,
        averageOrderValue: 50.00,
      },
      {
        date: '2024-01-15',
        sourceMedium: 'facebook / cpc',
        conversions: 32,
        conversionRate: 0.028,
        totalRevenue: 1600.00,
        transactions: 32,
        averageOrderValue: 50.00,
      },
      {
        date: '2024-01-14',
        sourceMedium: 'google / organic',
        conversions: 38,
        conversionRate: 0.032,
        totalRevenue: 1900.00,
        transactions: 38,
        averageOrderValue: 50.00,
      },
    ];

    return this.formatData(mockConversions, {
      total: mockConversions.length,
      source: 'google-analytics',
      endpoint: '/conversions',
    });
  }

  private async queryAudience(params: any): Promise<any> {
    const requestBody = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'users' },
        { name: 'sessions' },
        { name: 'pageviews' },
      ],
      dimensions: [
        { name: 'country' },
        { name: 'deviceCategory' },
        { name: 'age' },
      ],
      limit: params.limit,
    };

    const response = await this.makeRequest(`/properties/${this.propertyId}:runReport`, requestBody);
    
    // Mock data for demonstration
    const mockAudience = [
      {
        country: 'United States',
        deviceCategory: 'desktop',
        age: '25-34',
        users: 450,
        sessions: 520,
        pageviews: 1450,
        percentage: 0.35,
      },
      {
        country: 'United States',
        deviceCategory: 'mobile',
        age: '25-34',
        users: 380,
        sessions: 420,
        pageviews: 980,
        percentage: 0.29,
      },
      {
        country: 'Canada',
        deviceCategory: 'desktop',
        age: '35-44',
        users: 120,
        sessions: 140,
        pageviews: 380,
        percentage: 0.12,
      },
    ];

    return this.formatData(mockAudience, {
      total: mockAudience.length,
      source: 'google-analytics',
      endpoint: '/audience',
    });
  }

  private async queryContent(params: any): Promise<any> {
    const requestBody = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'pageviews' },
        { name: 'uniquePageviews' },
        { name: 'averageTimeOnPage' },
        { name: 'bounceRate' },
      ],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      limit: params.limit,
    };

    const response = await this.makeRequest(`/properties/${this.propertyId}:runReport`, requestBody);
    
    // Mock data for demonstration
    const mockContent = [
      {
        pagePath: '/',
        pageTitle: 'Homepage - Conversa SDK',
        pageviews: 1250,
        uniquePageviews: 980,
        averageTimeOnPage: 120.5,
        bounceRate: 0.45,
        exitRate: 0.35,
      },
      {
        pagePath: '/products',
        pageTitle: 'Products - Conversa SDK',
        pageviews: 890,
        uniquePageviews: 720,
        averageTimeOnPage: 180.2,
        bounceRate: 0.25,
        exitRate: 0.15,
      },
      {
        pagePath: '/pricing',
        pageTitle: 'Pricing - Conversa SDK',
        pageviews: 650,
        uniquePageviews: 520,
        averageTimeOnPage: 95.8,
        bounceRate: 0.55,
        exitRate: 0.45,
      },
    ];

    return this.formatData(mockContent, {
      total: mockContent.length,
      source: 'google-analytics',
      endpoint: '/content',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.accessToken && this.propertyId);
  }
}

