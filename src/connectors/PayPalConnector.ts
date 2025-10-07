import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

export class PayPalConnector extends BaseConnector {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.apiUrl = credentials.sandbox ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid PayPal credentials');
    }
    const connected = await this.testConnection();
    this.updateConnectionStatus(connected);
  }

  async testConnection(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const params = this.parseQueryParams(processedQuery);
    
    if (this.isTransactionQuery(processedQuery)) {
      return await this.queryTransactions(params);
    } else if (this.isSubscriptionQuery(processedQuery)) {
      return await this.querySubscriptions(params);
    } else {
      return await this.queryTransactions(params);
    }
  }

  getType(): string {
    return 'paypal';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['transactions', 'subscriptions', 'payouts', 'disputes'],
      operations: ['get', 'filter', 'sort', 'aggregate'],
      realTime: true,
      batchSize: 1000,
      rateLimit: 500,
    };
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
    });

    const data = await response.json();
    return data.access_token;
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    const token = await this.getAccessToken();
    const url = new URL(`${this.apiUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PayPal API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isTransactionQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('transaction') || query.includes('payment') ||
           processedQuery.entities.some((e: any) => e.type === 'transaction');
  }

  private isSubscriptionQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('subscription') || query.includes('recurring') ||
           processedQuery.entities.some((e: any) => e.type === 'subscription');
  }

  private async queryTransactions(params: any): Promise<any> {
    const mockTransactions = [
      {
        id: 'TXN123456789',
        amount: {
          currency_code: 'USD',
          value: '99.99',
        },
        payer: {
          payer_id: 'PAYER123',
          email_address: 'customer@example.com',
          name: {
            given_name: 'John',
            surname: 'Doe',
          },
        },
        payee: {
          merchant_id: 'MERCHANT123',
          email_address: 'merchant@example.com',
        },
        status: 'COMPLETED',
        create_time: '2024-01-15T10:30:00Z',
        update_time: '2024-01-15T10:30:00Z',
        intent: 'CAPTURE',
        payment_source: {
          card: {
            brand: 'VISA',
            last_digits: '1234',
            type: 'CREDIT',
          },
        },
        processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL',
        purchase_units: [
          {
            reference_id: 'REF123',
            amount: {
              currency_code: 'USD',
              value: '99.99',
            },
            payee: {
              merchant_id: 'MERCHANT123',
            },
            items: [
              {
                name: 'Premium Headphones',
                unit_amount: {
                  currency_code: 'USD',
                  value: '99.99',
                },
                quantity: '1',
                sku: 'PH-001',
              },
            ],
          },
        ],
      },
    ];

    return this.formatData(mockTransactions, {
      total: mockTransactions.length,
      source: 'paypal',
      endpoint: '/v1/reporting/transactions',
    });
  }

  private async querySubscriptions(params: any): Promise<any> {
    const mockSubscriptions = [
      {
        id: 'SUB123456789',
        status: 'ACTIVE',
        status_update_time: '2024-01-15T10:30:00Z',
        plan_id: 'PLAN123',
        start_time: '2024-01-01T00:00:00Z',
        quantity: '1',
        shipping_amount: {
          currency_code: 'USD',
          value: '0.00',
        },
        subscriber: {
          payer_id: 'PAYER123',
          email_address: 'customer@example.com',
          name: {
            given_name: 'John',
            surname: 'Doe',
          },
        },
        billing_info: {
          outstanding_balance: {
            currency_code: 'USD',
            value: '0.00',
          },
          cycle_executions: [
            {
              tenure_type: 'REGULAR',
              sequence: 1,
              cycles_completed: 1,
              cycles_remaining: 11,
              current_pricing_scheme_version: 1,
            },
          ],
          last_payment: {
            amount: {
              currency_code: 'USD',
              value: '29.99',
            },
            time: '2024-01-01T00:00:00Z',
          },
          next_billing_time: '2024-02-01T00:00:00Z',
          failed_payments_count: 0,
        },
        create_time: '2024-01-01T00:00:00Z',
        update_time: '2024-01-15T10:30:00Z',
        links: [
          {
            href: 'https://api.paypal.com/v1/billing/subscriptions/SUB123456789',
            rel: 'self',
            method: 'GET',
          },
        ],
      },
    ];

    return this.formatData(mockSubscriptions, {
      total: mockSubscriptions.length,
      source: 'paypal',
      endpoint: '/v1/billing/subscriptions',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

