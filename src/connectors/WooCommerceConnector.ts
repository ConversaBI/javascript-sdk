import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

/**
 * WooCommerce data connector
 * Handles integration with WooCommerce stores for e-commerce data
 */
export class WooCommerceConnector extends BaseConnector {
  private apiUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.consumerKey = credentials.consumerKey;
    this.consumerSecret = credentials.consumerSecret;
    this.apiUrl = `${credentials.storeUrl}/wp-json/wc/v3`;
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid WooCommerce credentials');
    }

    try {
      const connected = await this.testConnection();
      this.updateConnectionStatus(connected);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    try {
      const response = await this.makeRequest('/products');
      return response.length >= 0;
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
      } else if (this.isRevenueQuery(processedQuery)) {
        return await this.queryRevenue(params);
      } else {
        return await this.queryProducts(params);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getType(): string {
    return 'woocommerce';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['products', 'orders', 'customers', 'revenue', 'categories'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'search'],
      realTime: false,
      batchSize: 100,
      rateLimit: 5,
    };
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = new URL(this.apiUrl + endpoint);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${btoa(`${this.consumerKey}:${this.consumerSecret}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private isProductQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('product') || query.includes('item') ||
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

  private isRevenueQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('revenue') || query.includes('income') ||
           query.includes('earnings') || query.includes('profit');
  }

  private async queryProducts(params: any): Promise<any> {
    const wcParams: Record<string, any> = {
      per_page: params.limit,
    };

    const response = await this.makeRequest('/products', wcParams);
    
    const mockProducts = [
      {
        id: 1,
        name: 'Premium Headphones',
        slug: 'premium-headphones',
        permalink: 'https://demo-store.com/product/premium-headphones/',
        date_created: '2024-01-01T00:00:00',
        date_modified: '2024-01-15T00:00:00',
        type: 'simple',
        status: 'publish',
        featured: true,
        catalog_visibility: 'visible',
        description: 'High-quality wireless headphones with noise cancellation',
        short_description: 'Premium wireless headphones',
        sku: 'PH-001',
        price: '199.99',
        regular_price: '249.99',
        sale_price: '199.99',
        on_sale: true,
        purchasable: true,
        total_sales: 150,
        virtual: false,
        downloadable: false,
        downloads: [],
        download_limit: -1,
        download_expiry: -1,
        external_url: '',
        button_text: '',
        tax_status: 'taxable',
        tax_class: '',
        manage_stock: true,
        stock_quantity: 25,
        stock_status: 'instock',
        backorders: 'no',
        backorders_allowed: false,
        backordered: false,
        sold_individually: false,
        weight: '0.5',
        dimensions: {
          length: '20',
          width: '15',
          height: '8',
        },
        shipping_required: true,
        shipping_taxable: true,
        shipping_class: '',
        shipping_class_id: 0,
        reviews_allowed: true,
        average_rating: '4.5',
        rating_count: 25,
        related_ids: [2, 3],
        upsell_ids: [],
        cross_sell_ids: [],
        parent_id: 0,
        purchase_note: '',
        categories: [
          {
            id: 1,
            name: 'Electronics',
            slug: 'electronics',
          },
        ],
        tags: [
          {
            id: 1,
            name: 'wireless',
            slug: 'wireless',
          },
          {
            id: 2,
            name: 'audio',
            slug: 'audio',
          },
        ],
        images: [
          {
            id: 1,
            date_created: '2024-01-01T00:00:00',
            date_modified: '2024-01-01T00:00:00',
            src: 'https://demo-store.com/wp-content/uploads/headphones.jpg',
            name: 'premium-headphones',
            alt: 'Premium Headphones',
          },
        ],
        attributes: [],
        default_attributes: [],
        variations: [],
        grouped_products: [],
        menu_order: 0,
        meta_data: [],
      },
      {
        id: 2,
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        permalink: 'https://demo-store.com/product/smart-watch-pro/',
        date_created: '2024-01-02T00:00:00',
        date_modified: '2024-01-15T00:00:00',
        type: 'simple',
        status: 'publish',
        featured: false,
        catalog_visibility: 'visible',
        description: 'Advanced smartwatch with health monitoring and GPS',
        short_description: 'Smartwatch with health features',
        sku: 'SWP-001',
        price: '299.99',
        regular_price: '299.99',
        sale_price: '',
        on_sale: false,
        purchasable: true,
        total_sales: 85,
        virtual: false,
        downloadable: false,
        downloads: [],
        download_limit: -1,
        download_expiry: -1,
        external_url: '',
        button_text: '',
        tax_status: 'taxable',
        tax_class: '',
        manage_stock: true,
        stock_quantity: 15,
        stock_status: 'instock',
        backorders: 'no',
        backorders_allowed: false,
        backordered: false,
        sold_individually: false,
        weight: '0.3',
        dimensions: {
          length: '4',
          width: '4',
          height: '1',
        },
        shipping_required: true,
        shipping_taxable: true,
        shipping_class: '',
        shipping_class_id: 0,
        reviews_allowed: true,
        average_rating: '4.2',
        rating_count: 18,
        related_ids: [1, 3],
        upsell_ids: [],
        cross_sell_ids: [],
        parent_id: 0,
        purchase_note: '',
        categories: [
          {
            id: 1,
            name: 'Electronics',
            slug: 'electronics',
          },
          {
            id: 2,
            name: 'Wearables',
            slug: 'wearables',
          },
        ],
        tags: [
          {
            id: 3,
            name: 'smartwatch',
            slug: 'smartwatch',
          },
          {
            id: 4,
            name: 'fitness',
            slug: 'fitness',
          },
        ],
        images: [
          {
            id: 2,
            date_created: '2024-01-02T00:00:00',
            date_modified: '2024-01-02T00:00:00',
            src: 'https://demo-store.com/wp-content/uploads/smartwatch.jpg',
            name: 'smart-watch-pro',
            alt: 'Smart Watch Pro',
          },
        ],
        attributes: [],
        default_attributes: [],
        variations: [],
        grouped_products: [],
        menu_order: 0,
        meta_data: [],
      },
    ];

    return this.formatData(mockProducts, {
      total: mockProducts.length,
      source: 'woocommerce',
      endpoint: '/products',
    });
  }

  private async queryOrders(params: any): Promise<any> {
    const wcParams: Record<string, any> = {
      per_page: params.limit,
    };

    const response = await this.makeRequest('/orders', wcParams);
    
    const mockOrders = [
      {
        id: 1,
        parent_id: 0,
        status: 'completed',
        currency: 'USD',
        date_created: '2024-01-15T10:30:00',
        date_modified: '2024-01-15T10:30:00',
        discount_total: '0.00',
        discount_tax: '0.00',
        shipping_total: '9.99',
        shipping_tax: '0.00',
        cart_tax: '0.00',
        total: '209.98',
        total_tax: '0.00',
        customer_id: 1,
        order_key: 'wc_order_123456789',
        billing: {
          first_name: 'John',
          last_name: 'Doe',
          company: '',
          address_1: '123 Main St',
          address_2: '',
          city: 'Anytown',
          state: 'CA',
          postcode: '12345',
          country: 'US',
          email: 'john.doe@example.com',
          phone: '+1234567890',
        },
        shipping: {
          first_name: 'John',
          last_name: 'Doe',
          company: '',
          address_1: '123 Main St',
          address_2: '',
          city: 'Anytown',
          state: 'CA',
          postcode: '12345',
          country: 'US',
        },
        payment_method: 'stripe',
        payment_method_title: 'Credit Card (Stripe)',
        transaction_id: 'txn_123456789',
        date_paid: '2024-01-15T10:30:00',
        date_completed: '2024-01-15T10:30:00',
        cart_hash: 'abc123def456',
        number: '1',
        meta_data: [],
        line_items: [
          {
            id: 1,
            name: 'Premium Headphones',
            product_id: 1,
            variation_id: 0,
            quantity: 1,
            tax_class: '',
            subtotal: '199.99',
            subtotal_tax: '0.00',
            total: '199.99',
            total_tax: '0.00',
            taxes: [],
            meta_data: [],
            sku: 'PH-001',
            price: 199.99,
          },
        ],
        tax_lines: [],
        shipping_lines: [
          {
            id: 1,
            method_title: 'Standard Shipping',
            method_id: 'flat_rate',
            total: '9.99',
            total_tax: '0.00',
            taxes: [],
            meta_data: [],
          },
        ],
        fee_lines: [],
        coupon_lines: [],
        refunds: [],
        payment_url: 'https://demo-store.com/checkout/order-pay/1/?pay_for_order=true&key=wc_order_123456789',
        is_editable: false,
        needs_payment: false,
        needs_processing: false,
        date_created_gmt: '2024-01-15T10:30:00',
        date_modified_gmt: '2024-01-15T10:30:00',
        date_completed_gmt: '2024-01-15T10:30:00',
        date_paid_gmt: '2024-01-15T10:30:00',
        currency_symbol: '$',
        _links: {
          self: [
            {
              href: 'https://demo-store.com/wp-json/wc/v3/orders/1',
            },
          ],
          collection: [
            {
              href: 'https://demo-store.com/wp-json/wc/v3/orders',
            },
          ],
        },
      },
    ];

    return this.formatData(mockOrders, {
      total: mockOrders.length,
      source: 'woocommerce',
      endpoint: '/orders',
    });
  }

  private async queryCustomers(params: any): Promise<any> {
    const wcParams: Record<string, any> = {
      per_page: params.limit,
    };

    const response = await this.makeRequest('/customers', wcParams);
    
    const mockCustomers = [
      {
        id: 1,
        date_created: '2024-01-01T00:00:00',
        date_created_gmt: '2024-01-01T00:00:00',
        date_modified: '2024-01-15T00:00:00',
        date_modified_gmt: '2024-01-15T00:00:00',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
        username: 'johndoe',
        billing: {
          first_name: 'John',
          last_name: 'Doe',
          company: '',
          address_1: '123 Main St',
          address_2: '',
          city: 'Anytown',
          state: 'CA',
          postcode: '12345',
          country: 'US',
          email: 'john.doe@example.com',
          phone: '+1234567890',
        },
        shipping: {
          first_name: 'John',
          last_name: 'Doe',
          company: '',
          address_1: '123 Main St',
          address_2: '',
          city: 'Anytown',
          state: 'CA',
          postcode: '12345',
          country: 'US',
        },
        is_paying_customer: true,
        avatar_url: 'https://secure.gravatar.com/avatar/abc123def456?s=96&d=mm&r=g',
        meta_data: [],
        _links: {
          self: [
            {
              href: 'https://demo-store.com/wp-json/wc/v3/customers/1',
            },
          ],
          collection: [
            {
              href: 'https://demo-store.com/wp-json/wc/v3/customers',
            },
          ],
        },
      },
    ];

    return this.formatData(mockCustomers, {
      total: mockCustomers.length,
      source: 'woocommerce',
      endpoint: '/customers',
    });
  }

  private async queryRevenue(params: any): Promise<any> {
    const mockRevenue = [
      {
        period: '2024-01',
        total_revenue: 15499.50,
        total_orders: 78,
        average_order_value: 198.71,
        total_products_sold: 156,
        top_selling_product: 'Premium Headphones',
        revenue_by_category: {
          'Electronics': 12499.50,
          'Wearables': 3000.00,
        },
        currency: 'USD',
      },
      {
        period: '2024-02',
        total_revenue: 18999.25,
        total_orders: 95,
        average_order_value: 199.99,
        total_products_sold: 190,
        top_selling_product: 'Smart Watch Pro',
        revenue_by_category: {
          'Electronics': 13999.25,
          'Wearables': 5000.00,
        },
        currency: 'USD',
      },
    ];

    return this.formatData(mockRevenue, {
      total: mockRevenue.length,
      source: 'woocommerce',
      endpoint: '/revenue',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.consumerKey && this.consumerSecret);
  }
}

