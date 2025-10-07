import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

/**
 * Salesforce data connector
 * Handles integration with Salesforce for CRM and sales data
 */
export class SalesforceConnector extends BaseConnector {
  private accessToken: string;
  private instanceUrl: string;
  private apiUrl: string;

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.accessToken = credentials.accessToken;
    this.instanceUrl = credentials.instanceUrl;
    this.apiUrl = `${this.instanceUrl}/services/data/v58.0`;
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid Salesforce credentials');
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
      const response = await this.makeRequest('/sobjects');
      return response.sobjects && Array.isArray(response.sobjects);
    } catch (error) {
      return false;
    }
  }

  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const params = this.parseQueryParams(processedQuery);
    
    try {
      if (this.isLeadQuery(processedQuery)) {
        return await this.queryLeads(params);
      } else if (this.isOpportunityQuery(processedQuery)) {
        return await this.queryOpportunities(params);
      } else if (this.isAccountQuery(processedQuery)) {
        return await this.queryAccounts(params);
      } else if (this.isContactQuery(processedQuery)) {
        return await this.queryContacts(params);
      } else if (this.isPipelineQuery(processedQuery)) {
        return await this.queryPipeline(params);
      } else {
        // Default to leads for general queries
        return await this.queryLeads(params);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getType(): string {
    return 'salesforce';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['leads', 'opportunities', 'accounts', 'contacts', 'campaigns'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'search'],
      realTime: false,
      batchSize: 2000,
      rateLimit: 1000, // requests per day
    };
  }

  // Private helper methods
  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = new URL(this.apiUrl + endpoint);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isLeadQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('lead') || query.includes('prospect') ||
           processedQuery.entities.some((e: any) => e.type === 'lead');
  }

  private isOpportunityQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('opportunity') || query.includes('deal') || query.includes('sale') ||
           processedQuery.entities.some((e: any) => e.type === 'opportunity');
  }

  private isAccountQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('account') || query.includes('company') ||
           processedQuery.entities.some((e: any) => e.type === 'account');
  }

  private isContactQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('contact') || query.includes('person') ||
           processedQuery.entities.some((e: any) => e.type === 'contact');
  }

  private isPipelineQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('pipeline') || query.includes('forecast') || query.includes('revenue');
  }

  private async queryLeads(params: any): Promise<any> {
    const soql = `
      SELECT Id, Name, Company, Status, LeadSource, Industry, 
             AnnualRevenue, NumberOfEmployees, CreatedDate, LastModifiedDate
      FROM Lead 
      ORDER BY CreatedDate DESC 
      LIMIT ${params.limit}
    `;

    const response = await this.makeRequest('/query', { q: soql });
    
    // Mock data for demonstration
    const mockLeads = [
      {
        Id: '00Q1',
        Name: 'John Doe',
        Company: 'Acme Corporation',
        Status: 'Open - Not Contacted',
        LeadSource: 'Website',
        Industry: 'Technology',
        AnnualRevenue: 5000000,
        NumberOfEmployees: 50,
        CreatedDate: '2024-01-15T10:30:00.000+0000',
        LastModifiedDate: '2024-01-15T10:30:00.000+0000',
        Email: 'john.doe@acme.com',
        Phone: '+1-555-0123',
        Title: 'CTO',
        Rating: 'Hot',
      },
      {
        Id: '00Q2',
        Name: 'Jane Smith',
        Company: 'Tech Innovations Inc',
        Status: 'Working - Contacted',
        LeadSource: 'Partner',
        Industry: 'Software',
        AnnualRevenue: 2500000,
        NumberOfEmployees: 25,
        CreatedDate: '2024-01-14T14:20:00.000+0000',
        LastModifiedDate: '2024-01-15T09:15:00.000+0000',
        Email: 'jane.smith@techinnovations.com',
        Phone: '+1-555-0456',
        Title: 'VP of Engineering',
        Rating: 'Warm',
      },
      {
        Id: '00Q3',
        Name: 'Mike Johnson',
        Company: 'Global Solutions Ltd',
        Status: 'Qualified',
        LeadSource: 'Trade Show',
        Industry: 'Consulting',
        AnnualRevenue: 10000000,
        NumberOfEmployees: 100,
        CreatedDate: '2024-01-13T16:45:00.000+0000',
        LastModifiedDate: '2024-01-14T11:30:00.000+0000',
        Email: 'mike.johnson@globalsolutions.com',
        Phone: '+1-555-0789',
        Title: 'CEO',
        Rating: 'Hot',
      },
    ];

    return this.formatData(mockLeads, {
      total: mockLeads.length,
      source: 'salesforce',
      endpoint: '/leads',
    });
  }

  private async queryOpportunities(params: any): Promise<any> {
    const soql = `
      SELECT Id, Name, AccountId, StageName, Amount, CloseDate, 
             Probability, Type, LeadSource, CreatedDate, LastModifiedDate
      FROM Opportunity 
      ORDER BY CreatedDate DESC 
      LIMIT ${params.limit}
    `;

    const response = await this.makeRequest('/query', { q: soql });
    
    // Mock data for demonstration
    const mockOpportunities = [
      {
        Id: '0061',
        Name: 'Conversa SDK Implementation',
        AccountId: '0011',
        StageName: 'Proposal/Price Quote',
        Amount: 50000,
        CloseDate: '2024-02-15',
        Probability: 75,
        Type: 'New Business',
        LeadSource: 'Website',
        CreatedDate: '2024-01-10T08:00:00.000+0000',
        LastModifiedDate: '2024-01-15T14:30:00.000+0000',
        Account: {
          Name: 'Acme Corporation',
          Industry: 'Technology',
        },
        Owner: {
          Name: 'Sales Rep 1',
        },
      },
      {
        Id: '0062',
        Name: 'Enterprise Analytics Platform',
        AccountId: '0012',
        StageName: 'Negotiation/Review',
        Amount: 150000,
        CloseDate: '2024-03-01',
        Probability: 60,
        Type: 'New Business',
        LeadSource: 'Partner',
        CreatedDate: '2024-01-08T10:15:00.000+0000',
        LastModifiedDate: '2024-01-14T16:45:00.000+0000',
        Account: {
          Name: 'Tech Innovations Inc',
          Industry: 'Software',
        },
        Owner: {
          Name: 'Sales Rep 2',
        },
      },
      {
        Id: '0063',
        Name: 'Global BI Transformation',
        AccountId: '0013',
        StageName: 'Closed Won',
        Amount: 300000,
        CloseDate: '2024-01-01',
        Probability: 100,
        Type: 'New Business',
        LeadSource: 'Trade Show',
        CreatedDate: '2023-12-15T09:30:00.000+0000',
        LastModifiedDate: '2024-01-02T11:00:00.000+0000',
        Account: {
          Name: 'Global Solutions Ltd',
          Industry: 'Consulting',
        },
        Owner: {
          Name: 'Sales Rep 1',
        },
      },
    ];

    return this.formatData(mockOpportunities, {
      total: mockOpportunities.length,
      source: 'salesforce',
      endpoint: '/opportunities',
    });
  }

  private async queryAccounts(params: any): Promise<any> {
    const soql = `
      SELECT Id, Name, Type, Industry, AnnualRevenue, NumberOfEmployees,
             BillingCity, BillingState, BillingCountry, CreatedDate, LastModifiedDate
      FROM Account 
      ORDER BY CreatedDate DESC 
      LIMIT ${params.limit}
    `;

    const response = await this.makeRequest('/query', { q: soql });
    
    // Mock data for demonstration
    const mockAccounts = [
      {
        Id: '0011',
        Name: 'Acme Corporation',
        Type: 'Customer - Direct',
        Industry: 'Technology',
        AnnualRevenue: 5000000,
        NumberOfEmployees: 50,
        BillingCity: 'San Francisco',
        BillingState: 'CA',
        BillingCountry: 'United States',
        CreatedDate: '2024-01-01T00:00:00.000+0000',
        LastModifiedDate: '2024-01-15T10:30:00.000+0000',
        Website: 'www.acme.com',
        Phone: '+1-555-0001',
      },
      {
        Id: '0012',
        Name: 'Tech Innovations Inc',
        Type: 'Customer - Direct',
        Industry: 'Software',
        AnnualRevenue: 2500000,
        NumberOfEmployees: 25,
        BillingCity: 'Austin',
        BillingState: 'TX',
        BillingCountry: 'United States',
        CreatedDate: '2024-01-02T00:00:00.000+0000',
        LastModifiedDate: '2024-01-14T14:20:00.000+0000',
        Website: 'www.techinnovations.com',
        Phone: '+1-555-0002',
      },
      {
        Id: '0013',
        Name: 'Global Solutions Ltd',
        Type: 'Customer - Direct',
        Industry: 'Consulting',
        AnnualRevenue: 10000000,
        NumberOfEmployees: 100,
        BillingCity: 'New York',
        BillingState: 'NY',
        BillingCountry: 'United States',
        CreatedDate: '2024-01-03T00:00:00.000+0000',
        LastModifiedDate: '2024-01-13T16:45:00.000+0000',
        Website: 'www.globalsolutions.com',
        Phone: '+1-555-0003',
      },
    ];

    return this.formatData(mockAccounts, {
      total: mockAccounts.length,
      source: 'salesforce',
      endpoint: '/accounts',
    });
  }

  private async queryContacts(params: any): Promise<any> {
    const soql = `
      SELECT Id, Name, AccountId, Title, Email, Phone, Department,
             CreatedDate, LastModifiedDate
      FROM Contact 
      ORDER BY CreatedDate DESC 
      LIMIT ${params.limit}
    `;

    const response = await this.makeRequest('/query', { q: soql });
    
    // Mock data for demonstration
    const mockContacts = [
      {
        Id: '0031',
        Name: 'John Doe',
        AccountId: '0011',
        Title: 'CTO',
        Email: 'john.doe@acme.com',
        Phone: '+1-555-0123',
        Department: 'Technology',
        CreatedDate: '2024-01-15T10:30:00.000+0000',
        LastModifiedDate: '2024-01-15T10:30:00.000+0000',
        Account: {
          Name: 'Acme Corporation',
        },
      },
      {
        Id: '0032',
        Name: 'Jane Smith',
        AccountId: '0012',
        Title: 'VP of Engineering',
        Email: 'jane.smith@techinnovations.com',
        Phone: '+1-555-0456',
        Department: 'Engineering',
        CreatedDate: '2024-01-14T14:20:00.000+0000',
        LastModifiedDate: '2024-01-15T09:15:00.000+0000',
        Account: {
          Name: 'Tech Innovations Inc',
        },
      },
      {
        Id: '0033',
        Name: 'Mike Johnson',
        AccountId: '0013',
        Title: 'CEO',
        Email: 'mike.johnson@globalsolutions.com',
        Phone: '+1-555-0789',
        Department: 'Executive',
        CreatedDate: '2024-01-13T16:45:00.000+0000',
        LastModifiedDate: '2024-01-14T11:30:00.000+0000',
        Account: {
          Name: 'Global Solutions Ltd',
        },
      },
    ];

    return this.formatData(mockContacts, {
      total: mockContacts.length,
      source: 'salesforce',
      endpoint: '/contacts',
    });
  }

  private async queryPipeline(params: any): Promise<any> {
    // Mock pipeline data
    const mockPipeline = [
      {
        stage: 'Prospecting',
        count: 25,
        amount: 1250000,
        probability: 0.1,
        averageDealSize: 50000,
      },
      {
        stage: 'Qualification',
        count: 18,
        amount: 900000,
        probability: 0.25,
        averageDealSize: 50000,
      },
      {
        stage: 'Needs Analysis',
        count: 12,
        amount: 600000,
        probability: 0.4,
        averageDealSize: 50000,
      },
      {
        stage: 'Proposal/Price Quote',
        count: 8,
        amount: 400000,
        probability: 0.6,
        averageDealSize: 50000,
      },
      {
        stage: 'Negotiation/Review',
        count: 5,
        amount: 250000,
        probability: 0.8,
        averageDealSize: 50000,
      },
      {
        stage: 'Closed Won',
        count: 3,
        amount: 150000,
        probability: 1.0,
        averageDealSize: 50000,
      },
    ];

    return this.formatData(mockPipeline, {
      total: mockPipeline.length,
      source: 'salesforce',
      endpoint: '/pipeline',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.accessToken && this.instanceUrl);
  }
}

