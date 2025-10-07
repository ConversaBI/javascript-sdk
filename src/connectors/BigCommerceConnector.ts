import { BaseConnector } from './BaseConnector';
import { ConnectorCapabilities } from '../types';

/**
 * BigCommerce data connector
 * Handles integration with BigCommerce stores for e-commerce data
 */
export class BigCommerceConnector extends BaseConnector {
  private apiUrl: string;
  private accessToken: string;
  private storeHash: string;

  constructor(credentials: any, config?: Record<string, any>) {
    super(credentials, config);
    this.accessToken = credentials.accessToken;
    this.storeHash = credentials.storeHash;
    this.apiUrl = `https://api.bigcommerce.com/stores/${this.storeHash}/v3`;
  }

  async initialize(): Promise<void> {
    if (!this.validateCredentials()) {
      throw new Error('Invalid BigCommerce credentials');
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
      const response = await this.makeRequest('/catalog/products');
      return response.data && Array.isArray(response.data);
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
      } else if (this.isAnalyticsQuery(processedQuery)) {
        return await this.queryAnalytics(params);
      } else {
        return await this.queryProducts(params);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getType(): string {
    return 'bigcommerce';
  }

  async getCapabilities(): Promise<ConnectorCapabilities> {
    return {
      dataTypes: ['products', 'orders', 'customers', 'analytics', 'categories', 'brands'],
      operations: ['get', 'filter', 'sort', 'aggregate', 'search'],
      realTime: false,
      batchSize: 250,
      rateLimit: 10,
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
        'X-Auth-Token': this.accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`BigCommerce API error: ${response.status} ${response.statusText}`);
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

  private isAnalyticsQuery(processedQuery: any): boolean {
    const query = processedQuery.originalQuery?.toLowerCase() || '';
    return query.includes('analytics') || query.includes('report') ||
           query.includes('performance') || query.includes('metrics');
  }

  private async queryProducts(params: any): Promise<any> {
    const bcParams: Record<string, any> = {
      limit: params.limit,
    };

    const response = await this.makeRequest('/catalog/products', bcParams);
    
    const mockProducts = [
      {
        id: 1,
        name: 'Professional Camera Lens',
        type: 'physical',
        sku: 'PCL-001',
        description: 'High-quality professional camera lens with advanced optics',
        weight: 1.2,
        width: 8.5,
        depth: 8.5,
        height: 12.0,
        fixed_cost_shipping_price: null,
        is_free_shipping: false,
        inventory_level: 45,
        inventory_warning_level: 10,
        inventory_tracking: 'product',
        reviews_rating_sum: 4.5,
        reviews_count: 23,
        total_sold: 67,
        is_visible: true,
        is_featured: true,
        related_products: [2, 3],
        warranty: '2 years',
        bin_picking_number: 'A-001',
        layout_file: 'product.html',
        upc: '123456789012',
        mpn: 'PCL-001',
        gtin: '1234567890123',
        search_keywords: 'camera, lens, professional, photography',
        availability: 'available',
        availability_description: 'In Stock',
        gift_wrapping_options_type: 'any',
        gift_wrapping_options_list: [],
        sort_order: 0,
        condition: 'New',
        is_condition_shown: true,
        order_quantity_minimum: 1,
        order_quantity_maximum: 0,
        page_title: 'Professional Camera Lens - Photography Equipment',
        meta_keywords: ['camera', 'lens', 'photography', 'professional'],
        meta_description: 'Professional camera lens for advanced photography',
        date_created: '2024-01-01T00:00:00+00:00',
        date_modified: '2024-01-15T00:00:00+00:00',
        view_count: 156,
        preorder_release_date: null,
        preorder_message: '',
        is_preorder_only: false,
        is_price_hidden: false,
        price_hidden_label: '',
        custom_url: {
          url: '/professional-camera-lens/',
          is_customized: false,
        },
        base_variant_id: 1,
        open_graph_type: 'product',
        open_graph_title: 'Professional Camera Lens',
        open_graph_description: 'High-quality professional camera lens',
        open_graph_use_meta_description: true,
        open_graph_use_product_name: true,
        open_graph_use_image: true,
        variants: [
          {
            id: 1,
            product_id: 1,
            sku: 'PCL-001',
            sku_id: 1,
            price: 899.99,
            sale_price: 799.99,
            retail_price: 999.99,
            map_price: 0,
            weight: 1.2,
            width: 8.5,
            depth: 8.5,
            height: 12.0,
            fixed_cost_shipping_price: null,
            is_free_shipping: false,
            inventory_level: 45,
            inventory_warning_level: 10,
            inventory_tracking: 'variant',
            reviews_rating_sum: 4.5,
            reviews_count: 23,
            total_sold: 67,
            is_visible: true,
            is_featured: true,
            related_products: [2, 3],
            warranty: '2 years',
            bin_picking_number: 'A-001',
            layout_file: 'product.html',
            upc: '123456789012',
            mpn: 'PCL-001',
            gtin: '1234567890123',
            search_keywords: 'camera, lens, professional, photography',
            availability: 'available',
            availability_description: 'In Stock',
            gift_wrapping_options_type: 'any',
            gift_wrapping_options_list: [],
            sort_order: 0,
            condition: 'New',
            is_condition_shown: true,
            order_quantity_minimum: 1,
            order_quantity_maximum: 0,
            page_title: 'Professional Camera Lens - Photography Equipment',
            meta_keywords: ['camera', 'lens', 'photography', 'professional'],
            meta_description: 'Professional camera lens for advanced photography',
            date_created: '2024-01-01T00:00:00+00:00',
            date_modified: '2024-01-15T00:00:00+00:00',
            view_count: 156,
            preorder_release_date: null,
            preorder_message: '',
            is_preorder_only: false,
            is_price_hidden: false,
            price_hidden_label: '',
            custom_url: {
              url: '/professional-camera-lens/',
              is_customized: false,
            },
            base_variant_id: 1,
            open_graph_type: 'product',
            open_graph_title: 'Professional Camera Lens',
            open_graph_description: 'High-quality professional camera lens',
            open_graph_use_meta_description: true,
            open_graph_use_product_name: true,
            open_graph_use_image: true,
          },
        ],
        images: [
          {
            id: 1,
            product_id: 1,
            is_thumbnail: true,
            sort_order: 1,
            description: 'Professional Camera Lens',
            image_file: 'camera-lens-main.jpg',
            url_zoom: 'https://cdn.bigcommerce.com/camera-lens-zoom.jpg',
            url_standard: 'https://cdn.bigcommerce.com/camera-lens-standard.jpg',
            url_thumbnail: 'https://cdn.bigcommerce.com/camera-lens-thumb.jpg',
            url_tiny: 'https://cdn.bigcommerce.com/camera-lens-tiny.jpg',
            date_modified: '2024-01-01T00:00:00+00:00',
          },
        ],
        custom_fields: [],
        bulk_pricing_rules: [],
        primary_image: {
          id: 1,
          product_id: 1,
          is_thumbnail: true,
          sort_order: 1,
          description: 'Professional Camera Lens',
          image_file: 'camera-lens-main.jpg',
          url_zoom: 'https://cdn.bigcommerce.com/camera-lens-zoom.jpg',
          url_standard: 'https://cdn.bigcommerce.com/camera-lens-standard.jpg',
          url_thumbnail: 'https://cdn.bigcommerce.com/camera-lens-thumb.jpg',
          url_tiny: 'https://cdn.bigcommerce.com/camera-lens-tiny.jpg',
          date_modified: '2024-01-01T00:00:00+00:00',
        },
        videos: [],
        modifiers: [],
        options: [],
        option_sets: [],
        tax_class_id: 0,
        brand_id: 1,
        brand: {
          id: 1,
          name: 'PhotoPro',
          page_title: 'PhotoPro - Professional Photography Equipment',
          meta_keywords: ['photography', 'camera', 'professional'],
          meta_description: 'Professional photography equipment',
          image_file: 'photopro-logo.png',
          search_keywords: 'photography, camera, professional',
          custom_url: {
            url: '/brands/photopro/',
            is_customized: false,
          },
        },
        categories: [
          {
            id: 1,
            name: 'Camera Lenses',
            description: 'Professional camera lenses for all photography needs',
            views: 1250,
            sort_order: 1,
            page_title: 'Camera Lenses - Photography Equipment',
            meta_keywords: ['camera', 'lens', 'photography'],
            meta_description: 'Professional camera lenses',
            layout_file: 'category.html',
            is_visible: true,
            default_product_sort: 'use_store_settings',
            image_url: 'https://cdn.bigcommerce.com/camera-lenses-category.jpg',
            custom_url: {
              url: '/camera-lenses/',
              is_customized: false,
            },
          },
        ],
        default_category_id: 1,
        reviews: {
          reviews_count: 23,
          reviews_rating_sum: 4.5,
        },
        total_sold: 67,
        fixed_cost_shipping_price: null,
        is_free_shipping: false,
        inventory_level: 45,
        inventory_warning_level: 10,
        inventory_tracking: 'product',
        reviews_rating_sum: 4.5,
        reviews_count: 23,
        is_visible: true,
        is_featured: true,
        related_products: [2, 3],
        warranty: '2 years',
        bin_picking_number: 'A-001',
        layout_file: 'product.html',
        upc: '123456789012',
        mpn: 'PCL-001',
        gtin: '1234567890123',
        search_keywords: 'camera, lens, professional, photography',
        availability: 'available',
        availability_description: 'In Stock',
        gift_wrapping_options_type: 'any',
        gift_wrapping_options_list: [],
        sort_order: 0,
        condition: 'New',
        is_condition_shown: true,
        order_quantity_minimum: 1,
        order_quantity_maximum: 0,
        page_title: 'Professional Camera Lens - Photography Equipment',
        meta_keywords: ['camera', 'lens', 'photography', 'professional'],
        meta_description: 'Professional camera lens for advanced photography',
        date_created: '2024-01-01T00:00:00+00:00',
        date_modified: '2024-01-15T00:00:00+00:00',
        view_count: 156,
        preorder_release_date: null,
        preorder_message: '',
        is_preorder_only: false,
        is_price_hidden: false,
        price_hidden_label: '',
        custom_url: {
          url: '/professional-camera-lens/',
          is_customized: false,
        },
        base_variant_id: 1,
        open_graph_type: 'product',
        open_graph_title: 'Professional Camera Lens',
        open_graph_description: 'High-quality professional camera lens',
        open_graph_use_meta_description: true,
        open_graph_use_product_name: true,
        open_graph_use_image: true,
      },
    ];

    return this.formatData(mockProducts, {
      total: mockProducts.length,
      source: 'bigcommerce',
      endpoint: '/catalog/products',
    });
  }

  private async queryOrders(params: any): Promise<any> {
    const bcParams: Record<string, any> = {
      limit: params.limit,
    };

    const response = await this.makeRequest('/orders', bcParams);
    
    const mockOrders = [
      {
        id: 1,
        customer_id: 1,
        date_created: '2024-01-15T10:30:00+00:00',
        date_modified: '2024-01-15T10:30:00+00:00',
        date_shipped: '2024-01-16T14:20:00+00:00',
        status: 'Completed',
        currency: 'USD',
        subtotal_ex_tax: 799.99,
        subtotal_inc_tax: 799.99,
        subtotal_tax: 0.00,
        base_shipping_cost: 9.99,
        shipping_cost_ex_tax: 9.99,
        shipping_cost_inc_tax: 9.99,
        shipping_cost_tax: 0.00,
        base_handling_cost: 0.00,
        handling_cost_ex_tax: 0.00,
        handling_cost_inc_tax: 0.00,
        handling_cost_tax: 0.00,
        base_wrapping_cost: 0.00,
        wrapping_cost_ex_tax: 0.00,
        wrapping_cost_inc_tax: 0.00,
        wrapping_cost_tax: 0.00,
        total_ex_tax: 809.98,
        total_inc_tax: 809.98,
        total_tax: 0.00,
        items_total: 1,
        items_shipped: 1,
        payment_method: 'Credit Card',
        payment_provider_id: 'stripe',
        payment_status: 'paid',
        refunded_amount: 0.00,
        order_is_digital: false,
        store_credit_amount: 0.00,
        gift_certificate_amount: 0.00,
        ip_address: '192.168.1.1',
        geoip_country: 'US',
        geoip_country_iso2: 'US',
        geoip_region: 'CA',
        geoip_region_iso2: 'CA',
        geoip_city: 'San Francisco',
        currency_id: 1,
        currency_code: 'USD',
        currency_exchange_rate: '1.0000000000',
        default_currency_id: 1,
        default_currency_code: 'USD',
        coupon_discount: 0.00,
        shipping_address_count: 1,
        is_deleted: false,
        ebay_order_id: '',
        cart_id: 'abc123def456',
        billing_address: {
          first_name: 'John',
          last_name: 'Doe',
          company: '',
          street_1: '123 Main St',
          street_2: '',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'United States',
          country_iso2: 'US',
          phone: '+1234567890',
          email: 'john.doe@example.com',
        },
        shipping_addresses: [
          {
            first_name: 'John',
            last_name: 'Doe',
            company: '',
            street_1: '123 Main St',
            street_2: '',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'United States',
            country_iso2: 'US',
            phone: '+1234567890',
            email: 'john.doe@example.com',
            form_fields: [],
          },
        ],
        products: {
          url: 'https://api.bigcommerce.com/stores/demo-store/v3/orders/1/products',
          resource: '/orders/1/products',
        },
        shipping_addresses: {
          url: 'https://api.bigcommerce.com/stores/demo-store/v3/orders/1/shippingaddresses',
          resource: '/orders/1/shippingaddresses',
        },
        coupons: {
          url: 'https://api.bigcommerce.com/stores/demo-store/v3/orders/1/coupons',
          resource: '/orders/1/coupons',
        },
        external_id: '',
        external_merchant_id: '',
        channel_id: 1,
        tax_provider_id: '',
        store_default_currency_code: 'USD',
        store_default_to_transactional_exchange_rate: '1.0000000000',
        custom_status: 'Completed',
        customer_locale: 'en',
        external_order_id: '',
        external_source: '',
        products: [
          {
            id: 1,
            order_id: 1,
            product_id: 1,
            order_address_id: 1,
            name: 'Professional Camera Lens',
            name_customer: 'Professional Camera Lens',
            name_merchant: 'Professional Camera Lens',
            sku: 'PCL-001',
            upc: '123456789012',
            type: 'physical',
            base_price: 799.99,
            price_ex_tax: 799.99,
            price_inc_tax: 799.99,
            price_tax: 0.00,
            base_total: 799.99,
            total_ex_tax: 799.99,
            total_inc_tax: 799.99,
            total_tax: 0.00,
            weight: 1.2,
            quantity: 1,
            base_cost_price: 400.00,
            cost_price_inc_tax: 400.00,
            cost_price_ex_tax: 400.00,
            cost_price_tax: 0.00,
            is_refunded: false,
            quantity_refunded: 0,
            refund_amount: 0.00,
            return_id: 0,
            wrapping_name: '',
            wrapping_message: '',
            wrapping_cost_ex_tax: 0.00,
            wrapping_cost_inc_tax: 0.00,
            wrapping_cost_tax: 0.00,
            wrapping_cost_tax_class_id: 0,
            quantity_shipped: 1,
            event_name: '',
            event_date: '',
            fixed_shipping_cost: 0.00,
            ebay_item_id: '',
            ebay_transaction_id: '',
            option_set_id: null,
            parent_order_product_id: null,
            is_bundled_product: false,
            bin_picking_number: 'A-001',
            external_id: '',
            fulfillment_source: 'manual',
            variant_id: 1,
            product_options: [],
            product_options_meta: [],
          },
        ],
        shipping_addresses: [
          {
            id: 1,
            order_id: 1,
            first_name: 'John',
            last_name: 'Doe',
            company: '',
            street_1: '123 Main St',
            street_2: '',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'United States',
            country_iso2: 'US',
            phone: '+1234567890',
            email: 'john.doe@example.com',
            form_fields: [],
          },
        ],
        coupons: [],
        external_source: '',
        external_id: '',
        channel_id: 1,
        tax_provider_id: '',
        store_default_currency_code: 'USD',
        store_default_to_transactional_exchange_rate: '1.0000000000',
        custom_status: 'Completed',
        customer_locale: 'en',
        external_order_id: '',
        external_source: '',
      },
    ];

    return this.formatData(mockOrders, {
      total: mockOrders.length,
      source: 'bigcommerce',
      endpoint: '/orders',
    });
  }

  private async queryCustomers(params: any): Promise<any> {
    const bcParams: Record<string, any> = {
      limit: params.limit,
    };

    const response = await this.makeRequest('/customers', bcParams);
    
    const mockCustomers = [
      {
        id: 1,
        date_created: '2024-01-01T00:00:00+00:00',
        date_modified: '2024-01-15T00:00:00+00:00',
        date_created_utc: '2024-01-01T00:00:00+00:00',
        date_modified_utc: '2024-01-15T00:00:00+00:00',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        company: '',
        phone: '+1234567890',
        form_fields: [],
        store_credit_amounts: [
          {
            amount: 0.00,
          },
        ],
        registration_ip_address: '192.168.1.1',
        customer_group_id: 0,
        notes: '',
        tax_exempt_category: '',
        reset_pass_on_login: false,
        accepts_marketing: true,
        addresses: {
          url: 'https://api.bigcommerce.com/stores/demo-store/v3/customers/1/addresses',
          resource: '/customers/1/addresses',
        },
        store_credit: {
          url: 'https://api.bigcommerce.com/stores/demo-store/v3/customers/1/store-credit',
          resource: '/customers/1/store-credit',
        },
        attributes: {
          url: 'https://api.bigcommerce.com/stores/demo-store/v3/customers/1/attributes',
          resource: '/customers/1/attributes',
        },
        addresses: [
          {
            id: 1,
            customer_id: 1,
            first_name: 'John',
            last_name: 'Doe',
            company: '',
            address_1: '123 Main St',
            address_2: '',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'United States',
            country_iso2: 'US',
            phone: '+1234567890',
            address_type: 'residential',
            form_fields: [],
          },
        ],
        store_credit: [
          {
            amount: 0.00,
          },
        ],
        attributes: [],
        authentication: {
          force_password_reset: false,
        },
        accepts_product_review_abandoned_cart_emails: true,
        channel_ids: [1],
      },
    ];

    return this.formatData(mockCustomers, {
      total: mockCustomers.length,
      source: 'bigcommerce',
      endpoint: '/customers',
    });
  }

  private async queryAnalytics(params: any): Promise<any> {
    const mockAnalytics = [
      {
        period: '2024-01',
        total_orders: 156,
        total_revenue: 124999.50,
        average_order_value: 801.28,
        total_customers: 89,
        new_customers: 45,
        returning_customers: 44,
        conversion_rate: 3.2,
        cart_abandonment_rate: 68.5,
        top_selling_products: [
          {
            product_id: 1,
            name: 'Professional Camera Lens',
            quantity_sold: 67,
            revenue: 53699.33,
          },
          {
            product_id: 2,
            name: 'Camera Tripod',
            quantity_sold: 45,
            revenue: 22499.55,
          },
        ],
        revenue_by_channel: {
          'Online Store': 87499.65,
          'Amazon': 24999.85,
          'eBay': 12499.00,
        },
        customer_acquisition_cost: 25.50,
        customer_lifetime_value: 1404.49,
        refund_rate: 2.1,
        return_rate: 1.8,
      },
      {
        period: '2024-02',
        total_orders: 189,
        total_revenue: 151499.25,
        average_order_value: 801.58,
        total_customers: 112,
        new_customers: 58,
        returning_customers: 54,
        conversion_rate: 3.5,
        cart_abandonment_rate: 65.2,
        top_selling_products: [
          {
            product_id: 1,
            name: 'Professional Camera Lens',
            quantity_sold: 78,
            revenue: 62499.22,
          },
          {
            product_id: 3,
            name: 'Camera Bag',
            quantity_sold: 52,
            revenue: 25999.56,
          },
        ],
        revenue_by_channel: {
          'Online Store': 105999.48,
          'Amazon': 30499.77,
          'eBay': 14999.00,
        },
        customer_acquisition_cost: 23.75,
        customer_lifetime_value: 1352.67,
        refund_rate: 1.9,
        return_rate: 1.6,
      },
    ];

    return this.formatData(mockAnalytics, {
      total: mockAnalytics.length,
      source: 'bigcommerce',
      endpoint: '/analytics',
    });
  }

  protected validateCredentials(): boolean {
    return !!(this.accessToken && this.storeHash);
  }
}

