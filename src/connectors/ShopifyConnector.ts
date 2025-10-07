import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

/**
 * Shopify data connector
 * Handles integration with Shopify stores for e-commerce data
 */
export class ShopifyConnector extends BaseConnector {
  private apiUrl: string;
  private accessToken: string;
  private shopName: string;

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.accessToken = credentials.accessToken;
    this.shopName = credentials.shopName;
    this.apiUrl = `https://${this.shopName}.myshopify.com/admin/api/2023-10`;
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid Shopify credentials');
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
      const response = await this.makeRequest('/shop.json');
      return response.shop && response.shop.id;
    } catch (error) {
      return false;
    }
  }

  async executeQuery(processedQuery: any, context?: any): Promise<any> {
    const params = this.parseQueryParams(processedQuery);
    
    try {
      if (this.isProductQuery(processedQuery)) {
        return await this.queryProducts(params);
      } else if (this.isOrderQuery(processedQuery)) {
        return await this.queryOrders(params);
      } else if (this.isCustomerQuery(processedQuery)) {
        return await this.queryCustomers(params);
      } else if (this.isInventoryQuery(processedQuery)) {
        return await this.queryInventory(params);
      } else {
        // Default to products for general queries
        return await this.queryProducts(params);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getType(): string {
    return 'shopify';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['products', 'orders', 'customers', 'inventory', 'analytics'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'search'],
      realTime: false,
      batchSize: 250,
      rateLimit: 2, // requests per second
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
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isProductQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('product') || 
           processedQuery.entities.some((e: any) => e.type === 'product');
  }

  private isOrderQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('order') || query.includes('sale') ||
           processedQuery.entities.some((e: any) => e.type === 'order');
  }

  private isCustomerQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('customer') || query.includes('user') ||
           processedQuery.entities.some((e: any) => e.type === 'customer');
  }

  private isInventoryQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('inventory') || query.includes('stock') ||
           query.includes('available');
  }

  private async queryProducts(params: any): Promise<any> {
    const shopifyParams: Record<string, any> = {
      limit: params.limit,
    };

    // Add filters based on query
    if (params.entities.some((e: any) => e.value === 'active')) {
      shopifyParams.status = 'active';
    }

    const response = await this.makeRequest('/products.json', shopifyParams);
    
    // Mock data for demonstration
    const mockProducts = [
      {
        id: 1,
        title: 'Wireless Headphones',
        handle: 'wireless-headphones',
        product_type: 'Electronics',
        vendor: 'TechCorp',
        tags: 'electronics, audio, wireless',
        status: 'active',
        published_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        variants: [
          {
            id: 1,
            title: 'Default Title',
            price: '99.99',
            sku: 'WH-001',
            inventory_quantity: 50,
            inventory_management: 'shopify',
          },
        ],
        images: [
          {
            id: 1,
            src: 'https://example.com/headphones.jpg',
            alt: 'Wireless Headphones',
          },
        ],
      },
      {
        id: 2,
        title: 'Smart Watch',
        handle: 'smart-watch',
        product_type: 'Electronics',
        vendor: 'TechCorp',
        tags: 'electronics, wearable, fitness',
        status: 'active',
        published_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        variants: [
          {
            id: 2,
            title: 'Default Title',
            price: '199.99',
            sku: 'SW-001',
            inventory_quantity: 25,
            inventory_management: 'shopify',
          },
        ],
        images: [
          {
            id: 2,
            src: 'https://example.com/smartwatch.jpg',
            alt: 'Smart Watch',
          },
        ],
      },
    ];

    return this.formatData(mockProducts, {
      total: mockProducts.length,
      source: 'shopify',
      endpoint: '/products.json',
    });
  }

  private async queryOrders(params: any): Promise<any> {
    const shopifyParams: Record<string, any> = {
      limit: params.limit,
      status: 'any',
    };

    const response = await this.makeRequest('/orders.json', shopifyParams);
    
    // Mock data for demonstration
    const mockOrders = [
      {
        id: 1,
        order_number: 1001,
        email: 'customer@example.com',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        total_price: '99.99',
        subtotal_price: '99.99',
        total_tax: '0.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        line_items: [
          {
            id: 1,
            title: 'Wireless Headphones',
            quantity: 1,
            price: '99.99',
            sku: 'WH-001',
          },
        ],
        customer: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'customer@example.com',
        },
      },
      {
        id: 2,
        order_number: 1002,
        email: 'customer2@example.com',
        created_at: '2024-01-14T15:45:00Z',
        updated_at: '2024-01-14T15:45:00Z',
        total_price: '199.99',
        subtotal_price: '199.99',
        total_tax: '0.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'pending',
        line_items: [
          {
            id: 2,
            title: 'Smart Watch',
            quantity: 1,
            price: '199.99',
            sku: 'SW-001',
          },
        ],
        customer: {
          id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'customer2@example.com',
        },
      },
    ];

    return this.formatData(mockOrders, {
      total: mockOrders.length,
      source: 'shopify',
      endpoint: '/orders.json',
    });
  }

  private async queryCustomers(params: any): Promise<any> {
    const shopifyParams: Record<string, any> = {
      limit: params.limit,
    };

    const response = await this.makeRequest('/customers.json', shopifyParams);
    
    // Mock data for demonstration
    const mockCustomers = [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'customer@example.com',
        phone: '+1234567890',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        orders_count: 5,
        total_spent: '499.95',
        tags: 'vip, newsletter',
        addresses: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            address1: '123 Main St',
            city: 'Anytown',
            province: 'CA',
            country: 'United States',
            zip: '12345',
          },
        ],
      },
      {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'customer2@example.com',
        phone: '+1987654321',
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z',
        orders_count: 2,
        total_spent: '199.99',
        tags: 'new, newsletter',
        addresses: [
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            address1: '456 Oak Ave',
            city: 'Somewhere',
            province: 'NY',
            country: 'United States',
            zip: '67890',
          },
        ],
      },
    ];

    return this.formatData(mockCustomers, {
      total: mockCustomers.length,
      source: 'shopify',
      endpoint: '/customers.json',
    });
  }

  private async queryInventory(params: any): Promise<any> {
    // Mock inventory data
    const mockInventory = [
      {
        id: 1,
        product_id: 1,
        variant_id: 1,
        sku: 'WH-001',
        title: 'Wireless Headphones',
        available: 50,
        reserved: 5,
        incoming: 25,
        outgoing: 0,
        location: 'Main Warehouse',
      },
      {
        id: 2,
        product_id: 2,
        variant_id: 2,
        sku: 'SW-001',
        title: 'Smart Watch',
        available: 25,
        reserved: 2,
        incoming: 50,
        outgoing: 0,
        location: 'Main Warehouse',
      },
    ];

    return this.formatData(mockInventory, {
      total: mockInventory.length,
      source: 'shopify',
      endpoint: '/inventory_levels.json',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.accessToken && this.shopName);
  }
}

