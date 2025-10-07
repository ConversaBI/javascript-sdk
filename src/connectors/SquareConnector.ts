import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

export class SquareConnector extends BaseConnector {
  private accessToken: string;
  private environment: string;
  private apiUrl: string;

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.accessToken = credentials.accessToken;
    this.environment = credentials.environment || 'sandbox';
    this.apiUrl = this.environment === 'production' 
      ? 'https://connect.squareup.com/v2' 
      : 'https://connect.squareupsandbox.com/v2';
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid Square credentials');
    }
    const connected = await this.testConnection();
    this.updateConnectionStatus(connected);
  }

  async testConnection(): Promise<void> {
    try {
      const response = await this.makeRequest('/locations');
      return response.locations && response.locations.length > 0;
    } catch (error) {
      return false;
    }
  }

  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const params = this.parseQueryParams(processedQuery);
    
    if (this.isPaymentQuery(processedQuery)) {
      return await this.queryPayments(params);
    } else if (this.isOrderQuery(processedQuery)) {
      return await this.queryOrders(params);
    } else if (this.isInventoryQuery(processedQuery)) {
      return await this.queryInventory(params);
    } else {
      return await this.queryPayments(params);
    }
  }

  getType(): string {
    return 'square';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['payments', 'orders', 'inventory', 'customers', 'locations'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'search'],
      realTime: true,
      batchSize: 500,
      rateLimit: 100,
    };
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = new URL(`${this.apiUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
    });

    if (!response.ok) {
      throw new Error(`Square API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isPaymentQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('payment') || query.includes('transaction') ||
           processedQuery.entities.some((e: any) => e.type === 'payment');
  }

  private isOrderQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('order') || query.includes('sale') ||
           processedQuery.entities.some((e: any) => e.type === 'order');
  }

  private isInventoryQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('inventory') || query.includes('stock') ||
           processedQuery.entities.some((e: any) => e.type === 'inventory');
  }

  private async queryPayments(params: any): Promise<any> {
    const mockPayments = [
      {
        id: 'payment_123456789',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        amount_money: {
          amount: 9999,
          currency: 'USD',
        },
        tip_money: {
          amount: 0,
          currency: 'USD',
        },
        total_money: {
          amount: 9999,
          currency: 'USD',
        },
        app_fee_money: {
          amount: 0,
          currency: 'USD',
        },
        processing_fee: [
          {
            effective_at: '2024-01-15T10:30:00Z',
            type: 'INITIAL',
            amount_money: {
              amount: 300,
              currency: 'USD',
            },
          },
        ],
        refunded_money: {
          amount: 0,
          currency: 'USD',
        },
        status: 'COMPLETED',
        delay_duration: 'PT168H',
        delay_action: 'CANCEL',
        delayed_until: '2024-01-22T10:30:00Z',
        source_type: 'CARD',
        card_details: {
          status: 'CAPTURED',
          card: {
            card_brand: 'VISA',
            last_4: '1234',
            exp_month: 12,
            exp_year: 2025,
            fingerprint: 'fingerprint123',
            card_type: 'CREDIT',
            prepaid_type: 'NOT_PREPAID',
            bin: '411111',
          },
          entry_method: 'KEYED',
          cvv_status: 'CVV_ACCEPTED',
          avs_status: 'AVS_ACCEPTED',
          statement_description: 'SQ *DEMO STORE',
          application_identifier: 'sandbox-sq0idb-123456789',
          application_name: 'Square Point of Sale',
          application_cryptogram: 'cryptogram123',
          verification_method: 'PIN',
          verification_results: 'SUCCESS',
          dpan: 'dpan123',
          emv_details: {
            aid: 'aid123',
            application_cryptogram: 'cryptogram123',
            application_preferred_name: 'VISA',
            application_label: 'VISA',
            application_version: '1.0',
            cardholder_name: 'John Doe',
            terminal_verification_results: 'terminal123',
            transaction_status_information: 'status123',
          },
        },
        location_id: 'location123',
        order_id: 'order123',
        reference_id: 'ref123',
        customer_id: 'customer123',
        employee_id: 'employee123',
        team_member_id: 'team123',
        refund_ids: [],
        risk_evaluation: {
          created_at: '2024-01-15T10:30:00Z',
          risk_level: 'NORMAL',
        },
        buyer_email_address: 'customer@example.com',
        billing_address: {
          address_line_1: '123 Main St',
          address_line_2: '',
          locality: 'San Francisco',
          administrative_district_level_1: 'CA',
          postal_code: '94105',
          country: 'US',
        },
        shipping_address: {
          address_line_1: '123 Main St',
          address_line_2: '',
          locality: 'San Francisco',
          administrative_district_level_1: 'CA',
          postal_code: '94105',
          country: 'US',
        },
        note: 'Payment for premium headphones',
        version_token: 'version123',
      },
    ];

    return this.formatData(mockPayments, {
      total: mockPayments.length,
      source: 'square',
      endpoint: '/payments',
    });
  }

  private async queryOrders(params: any): Promise<any> {
    const mockOrders = [
      {
        id: 'order_123456789',
        location_id: 'location123',
        reference_id: 'ref123',
        source: {
          name: 'Square Point of Sale',
        },
        customer_id: 'customer123',
        line_items: [
          {
            uid: 'line_item_123',
            name: 'Premium Headphones',
            quantity: '1',
            item_type: 'ITEM',
            base_price_money: {
              amount: 9999,
              currency: 'USD',
            },
            variation_total_price_money: {
              amount: 9999,
              currency: 'USD',
            },
            gross_sales_money: {
              amount: 9999,
              currency: 'USD',
            },
            total_tax_money: {
              amount: 0,
              currency: 'USD',
            },
            total_discount_money: {
              amount: 0,
              currency: 'USD',
            },
            total_money: {
              amount: 9999,
              currency: 'USD',
            },
            catalog_object_id: 'catalog_object_123',
            variation_name: 'Premium Headphones',
            item_detail: {
              category_name: 'Electronics',
              sku: 'PH-001',
              item_id: 'item_123',
              item_variation_id: 'variation_123',
            },
            applied_taxes: [],
            applied_discounts: [],
            applied_service_charges: [],
            metadata: {},
          },
        ],
        taxes: [],
        discounts: [],
        service_charges: [],
        fulfillments: [
          {
            uid: 'fulfillment_123',
            type: 'PICKUP',
            state: 'PROPOSED',
            pickup_details: {
              recipient: {
                display_name: 'John Doe',
                phone_number: '+1234567890',
                email_address: 'customer@example.com',
              },
              expires_at: '2024-01-15T11:30:00Z',
              auto_complete_duration: 'PT1H',
              schedule_type: 'SCHEDULED',
              pickup_at: '2024-01-15T11:00:00Z',
              pickup_window_duration: 'PT1H',
              prep_time_duration: 'PT15M',
              note: 'Customer pickup',
              placed_at: '2024-01-15T10:30:00Z',
              accepted_at: '2024-01-15T10:35:00Z',
              rejected_at: null,
              ready_at: null,
              expired_at: null,
              picked_up_at: null,
              canceled_at: null,
              cancel_reason: null,
              canceled_by: null,
            },
          },
        ],
        returns: [],
        return_amounts: {
          total_money: {
            amount: 0,
            currency: 'USD',
          },
          tax_money: {
            amount: 0,
            currency: 'USD',
          },
          discount_money: {
            amount: 0,
            currency: 'USD',
          },
          tip_money: {
            amount: 0,
            currency: 'USD',
          },
          service_charge_money: {
            amount: 0,
            currency: 'USD',
          },
        },
        net_amounts: {
          total_money: {
            amount: 9999,
            currency: 'USD',
          },
          tax_money: {
            amount: 0,
            currency: 'USD',
          },
          discount_money: {
            amount: 0,
            currency: 'USD',
          },
          tip_money: {
            amount: 0,
            currency: 'USD',
          },
          service_charge_money: {
            amount: 0,
            currency: 'USD',
          },
        },
        pricing_options: {
          auto_apply_discounts: true,
          auto_apply_taxes: true,
        },
        rewards: [],
        metadata: {},
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        closed_at: '2024-01-15T10:30:00Z',
        state: 'COMPLETED',
        version: 1,
        total_money: {
          amount: 9999,
          currency: 'USD',
        },
        total_tax_money: {
          amount: 0,
          currency: 'USD',
        },
        total_discount_money: {
          amount: 0,
          currency: 'USD',
        },
        total_tip_money: {
          amount: 0,
          currency: 'USD',
        },
        total_service_charge_money: {
          amount: 0,
          currency: 'USD',
        },
        ticket_name: 'Ticket #1',
        pricing_options: {
          auto_apply_discounts: true,
          auto_apply_taxes: true,
        },
        rewards: [],
        metadata: {},
      },
    ];

    return this.formatData(mockOrders, {
      total: mockOrders.length,
      source: 'square',
      endpoint: '/orders',
    });
  }

  private async queryInventory(params: any): Promise<any> {
    const mockInventory = [
      {
        catalog_object_id: 'catalog_object_123',
        catalog_object_type: 'ITEM_VARIATION',
        state: 'IN_STOCK',
        location_id: 'location123',
        quantity: '25',
        calculated_at: '2024-01-15T10:30:00Z',
      },
      {
        catalog_object_id: 'catalog_object_456',
        catalog_object_type: 'ITEM_VARIATION',
        state: 'IN_STOCK',
        location_id: 'location123',
        quantity: '15',
        calculated_at: '2024-01-15T10:30:00Z',
      },
    ];

    return this.formatData(mockInventory, {
      total: mockInventory.length,
      source: 'square',
      endpoint: '/inventory',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.accessToken);
  }
}

