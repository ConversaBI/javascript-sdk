import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

/**
 * Stripe data connector
 * Handles integration with Stripe for payment and subscription data
 */
export class StripeConnector extends BaseConnector {
  private apiKey: string;
  private apiUrl = 'https://api.stripe.com/v1';

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.apiKey = credentials.apiKey;
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid Stripe credentials');
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
      const response = await this.makeRequest('/account');
      return response.id && response.object === 'account';
    } catch (error) {
      return false;
    }
  }

  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const params = this.parseQueryParams(processedQuery);
    
    try {
      if (this.isPaymentQuery(processedQuery)) {
        return await this.queryPayments(params);
      } else if (this.isSubscriptionQuery(processedQuery)) {
        return await this.querySubscriptions(params);
      } else if (this.isCustomerQuery(processedQuery)) {
        return await this.queryCustomers(params);
      } else if (this.isRevenueQuery(processedQuery)) {
        return await this.queryRevenue(params);
      } else {
        // Default to payments for general queries
        return await this.queryPayments(params);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getType(): string {
    return 'stripe';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['payments', 'subscriptions', 'customers', 'invoices', 'charges'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'search'],
      realTime: true,
      batchSize: 100,
      rateLimit: 100, // requests per second
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
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isPaymentQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('payment') || query.includes('charge') ||
           processedQuery.entities.some((e: any) => e.type === 'payment');
  }

  private isSubscriptionQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('subscription') || query.includes('recurring') ||
           processedQuery.entities.some((e: any) => e.type === 'subscription');
  }

  private isCustomerQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('customer') || query.includes('user') ||
           processedQuery.entities.some((e: any) => e.type === 'customer');
  }

  private isRevenueQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('revenue') || query.includes('income') ||
           query.includes('earnings') || query.includes('profit');
  }

  private async queryPayments(params: any): Promise<any> {
    const stripeParams: Record<string, any> = {
      limit: params.limit,
    };

    // Add filters based on query
    if (params.entities.some((e: any) => e.value === 'succeeded')) {
      stripeParams.status = 'succeeded';
    }

    const response = await this.makeRequest('/charges', stripeParams);
    
    // Mock data for demonstration
    const mockPayments = [
      {
        id: 'ch_1',
        object: 'charge',
        amount: 2999,
        amount_captured: 2999,
        amount_refunded: 0,
        application_fee: null,
        application_fee_amount: null,
        balance_transaction: 'txn_1',
        billing_details: {
          address: {
            city: 'Anytown',
            country: 'US',
            line1: '123 Main St',
            postal_code: '12345',
            state: 'CA',
          },
          email: 'customer@example.com',
          name: 'John Doe',
          phone: null,
        },
        calculated_statement_descriptor: null,
        captured: true,
        created: 1705123456,
        currency: 'usd',
        customer: 'cus_1',
        description: 'Wireless Headphones',
        destination: null,
        dispute: null,
        disputed: false,
        failure_code: null,
        failure_message: null,
        fraud_details: {},
        invoice: null,
        livemode: false,
        metadata: {},
        on_behalf_of: null,
        order: null,
        outcome: {
          network_status: 'approved_by_network',
          reason: null,
          risk_level: 'normal',
          risk_score: 10,
          seller_message: 'Payment complete.',
          type: 'authorized',
        },
        paid: true,
        payment_intent: 'pi_1',
        payment_method: 'pm_1',
        payment_method_details: {
          card: {
            brand: 'visa',
            checks: {
              address_line1_check: 'pass',
              address_postal_code_check: 'pass',
              cvc_check: 'pass',
            },
            country: 'US',
            exp_month: 12,
            exp_year: 2025,
            fingerprint: 'fingerprint_1',
            funding: 'credit',
            installments: null,
            last4: '4242',
            mandate: null,
            network: 'visa',
            three_d_secure: null,
            wallet: null,
          },
          type: 'card',
        },
        receipt_email: 'customer@example.com',
        receipt_number: null,
        receipt_url: 'https://pay.stripe.com/receipts/...',
        refunded: false,
        refunds: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: '/v1/charges/ch_1/refunds',
        },
        review: null,
        shipping: null,
        source: null,
        source_transfer: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: 'succeeded',
        transfer_data: null,
        transfer_group: null,
      },
      {
        id: 'ch_2',
        object: 'charge',
        amount: 4999,
        amount_captured: 4999,
        amount_refunded: 0,
        application_fee: null,
        application_fee_amount: null,
        balance_transaction: 'txn_2',
        billing_details: {
          address: {
            city: 'Somewhere',
            country: 'US',
            line1: '456 Oak Ave',
            postal_code: '67890',
            state: 'NY',
          },
          email: 'customer2@example.com',
          name: 'Jane Smith',
          phone: null,
        },
        calculated_statement_descriptor: null,
        captured: true,
        created: 1705037056,
        currency: 'usd',
        customer: 'cus_2',
        description: 'Smart Watch',
        destination: null,
        dispute: null,
        disputed: false,
        failure_code: null,
        failure_message: null,
        fraud_details: {},
        invoice: null,
        livemode: false,
        metadata: {},
        on_behalf_of: null,
        order: null,
        outcome: {
          network_status: 'approved_by_network',
          reason: null,
          risk_level: 'normal',
          risk_score: 15,
          seller_message: 'Payment complete.',
          type: 'authorized',
        },
        paid: true,
        payment_intent: 'pi_2',
        payment_method: 'pm_2',
        payment_method_details: {
          card: {
            brand: 'mastercard',
            checks: {
              address_line1_check: 'pass',
              address_postal_code_check: 'pass',
              cvc_check: 'pass',
            },
            country: 'US',
            exp_month: 6,
            exp_year: 2026,
            fingerprint: 'fingerprint_2',
            funding: 'credit',
            installments: null,
            last4: '5555',
            mandate: null,
            network: 'mastercard',
            three_d_secure: null,
            wallet: null,
          },
          type: 'card',
        },
        receipt_email: 'customer2@example.com',
        receipt_number: null,
        receipt_url: 'https://pay.stripe.com/receipts/...',
        refunded: false,
        refunds: {
          object: 'list',
          data: [],
          has_more: false,
          total_count: 0,
          url: '/v1/charges/ch_2/refunds',
        },
        review: null,
        shipping: null,
        source: null,
        source_transfer: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: 'succeeded',
        transfer_data: null,
        transfer_group: null,
      },
    ];

    return this.formatData(mockPayments, {
      total: mockPayments.length,
      source: 'stripe',
      endpoint: '/charges',
    });
  }

  private async querySubscriptions(params: any): Promise<any> {
    const stripeParams: Record<string, any> = {
      limit: params.limit,
    };

    const response = await this.makeRequest('/subscriptions', stripeParams);
    
    // Mock data for demonstration
    const mockSubscriptions = [
      {
        id: 'sub_1',
        object: 'subscription',
        application_fee_percent: null,
        automatic_tax: {
          enabled: false,
        },
        billing_cycle_anchor: 1705123456,
        billing_thresholds: null,
        cancel_at: null,
        cancel_at_period_end: false,
        canceled_at: null,
        collection_method: 'charge_automatically',
        created: 1705123456,
        currency: 'usd',
        current_period_end: 1707801856,
        current_period_start: 1705123456,
        customer: 'cus_1',
        days_until_due: null,
        default_payment_method: 'pm_1',
        default_source: null,
        default_tax_rates: [],
        description: 'Monthly Premium Plan',
        discount: null,
        ended_at: null,
        invoice_settings: {
          account_tax_ids: null,
          custom_fields: null,
          default_payment_method: null,
          footer: null,
        },
        items: {
          object: 'list',
          data: [
            {
              id: 'si_1',
              object: 'subscription_item',
              billing_thresholds: null,
              created: 1705123456,
              metadata: {},
              price: {
                id: 'price_1',
                object: 'price',
                active: true,
                billing_scheme: 'per_unit',
                created: 1705123456,
                currency: 'usd',
                custom_unit_amount: null,
                livemode: false,
                lookup_key: null,
                metadata: {},
                nickname: null,
                product: 'prod_1',
                recurring: {
                  aggregate_usage: null,
                  interval: 'month',
                  interval_count: 1,
                  trial_period_days: null,
                  usage_type: 'licensed',
                },
                tax_behavior: null,
                tiers_mode: null,
                transform_quantity: null,
                type: 'recurring',
                unit_amount: 2999,
                unit_amount_decimal: '2999',
              },
              quantity: 1,
              subscription: 'sub_1',
              tax_rates: [],
            },
          ],
          has_more: false,
          total_count: 1,
          url: '/v1/subscription_items?subscription=sub_1',
        },
        latest_invoice: 'in_1',
        livemode: false,
        metadata: {},
        next_pending_invoice_item_invoice: null,
        on_behalf_of: null,
        pause_collection: null,
        payment_settings: {
          payment_method_options: null,
          payment_method_types: null,
        },
        pending_invoice_item_interval: null,
        pending_setup_intent: null,
        pending_update: null,
        schedule: null,
        start_date: 1705123456,
        status: 'active',
        test_clock: null,
        transfer_data: null,
        trial_end: null,
        trial_start: null,
      },
    ];

    return this.formatData(mockSubscriptions, {
      total: mockSubscriptions.length,
      source: 'stripe',
      endpoint: '/subscriptions',
    });
  }

  private async queryCustomers(params: any): Promise<any> {
    const stripeParams: Record<string, any> = {
      limit: params.limit,
    };

    const response = await this.makeRequest('/customers', stripeParams);
    
    // Mock data for demonstration
    const mockCustomers = [
      {
        id: 'cus_1',
        object: 'customer',
        address: {
          city: 'Anytown',
          country: 'US',
          line1: '123 Main St',
          line2: null,
          postal_code: '12345',
          state: 'CA',
        },
        balance: 0,
        created: 1705123456,
        currency: 'usd',
        default_source: null,
        delinquent: false,
        description: 'Customer for John Doe',
        discount: null,
        email: 'customer@example.com',
        invoice_prefix: null,
        invoice_settings: {
          custom_fields: null,
          default_payment_method: null,
          footer: null,
        },
        livemode: false,
        metadata: {},
        name: 'John Doe',
        next_invoice_sequence: 1,
        phone: '+1234567890',
        preferred_locales: ['en'],
        shipping: null,
        tax_exempt: 'none',
        test_clock: null,
      },
      {
        id: 'cus_2',
        object: 'customer',
        address: {
          city: 'Somewhere',
          country: 'US',
          line1: '456 Oak Ave',
          line2: null,
          postal_code: '67890',
          state: 'NY',
        },
        balance: 0,
        created: 1705037056,
        currency: 'usd',
        default_source: null,
        delinquent: false,
        description: 'Customer for Jane Smith',
        discount: null,
        email: 'customer2@example.com',
        invoice_prefix: null,
        invoice_settings: {
          custom_fields: null,
          default_payment_method: null,
          footer: null,
        },
        livemode: false,
        metadata: {},
        name: 'Jane Smith',
        next_invoice_sequence: 1,
        phone: '+1987654321',
        preferred_locales: ['en'],
        shipping: null,
        tax_exempt: 'none',
        test_clock: null,
      },
    ];

    return this.formatData(mockCustomers, {
      total: mockCustomers.length,
      source: 'stripe',
      endpoint: '/customers',
    });
  }

  private async queryRevenue(params: any): Promise<any> {
    // Mock revenue data
    const mockRevenue = [
      {
        period: '2024-01',
        total_revenue: 7998,
        recurring_revenue: 2999,
        one_time_revenue: 4999,
        currency: 'usd',
        customer_count: 2,
        average_order_value: 3999,
        churn_rate: 0.05,
      },
      {
        period: '2024-02',
        total_revenue: 8997,
        recurring_revenue: 5998,
        one_time_revenue: 2999,
        currency: 'usd',
        customer_count: 3,
        average_order_value: 2999,
        churn_rate: 0.03,
      },
    ];

    return this.formatData(mockRevenue, {
      total: mockRevenue.length,
      source: 'stripe',
      endpoint: '/revenue',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.apiKey && this.apiKey.startsWith('sk_'));
  }
}

