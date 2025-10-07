/**
 * Unit Tests for ConversaSDK
 * Comprehensive test coverage for the main SDK class
 */

import { ConversaBI } from '../ConversaSDK';
import { ConversaBIConfig, DataSource } from '../../types';
import { ErrorFactory } from '../../utils/error-handler';

// Mock dependencies
jest.mock('../DataConnectorManager');
jest.mock('../NLPEngine');
jest.mock('../MCPOrchestrator');
jest.mock('../CacheManager');

describe('ConversaSDK', () => {
  let mockConfig: ConversaBIConfig;
  let conversaSDK: ConversaBI;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      endpoint: 'https://api.conversabi.dev',
      tenant: 'test-tenant',
      dataSources: [
        {
          type: 'shopify',
          credentials: {
            accessToken: 'test-token',
            shopName: 'test-shop'
          }
        }
      ],
      businessContext: {
        industry: 'ecommerce'
      }
    };

    conversaSDK = new ConversaBI(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with valid config', () => {
      expect(conversaSDK).toBeInstanceOf(ConversaBI);
      expect(conversaSDK['config']).toEqual(mockConfig);
      expect(conversaSDK['apiEndpoint']).toBe('https://api.conversabi.dev');
    });

    it('should use default endpoint when not provided', () => {
      const configWithoutEndpoint = { ...mockConfig };
      delete configWithoutEndpoint.endpoint;
      
      const sdk = new ConversaBI(configWithoutEndpoint);
      expect(sdk['apiEndpoint']).toBe('https://api.conversabi.dev');
    });

    it('should initialize with hosted platform mode when no data sources', () => {
      const hostedConfig = {
        ...mockConfig,
        dataSources: undefined
      };
      
      const sdk = new ConversaBI(hostedConfig);
      expect(sdk['config'].dataSources).toBeUndefined();
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with data sources', async () => {
      const initSpy = jest.spyOn(conversaSDK, 'init');
      
      await conversaSDK.init();
      
      expect(initSpy).toHaveBeenCalled();
      expect(conversaSDK['isInitialized']).toBe(true);
    });

    it('should not reinitialize if already initialized', async () => {
      await conversaSDK.init();
      const connectorManagerSpy = jest.spyOn(conversaSDK['connectorManager'], 'addConnector');
      
      await conversaSDK.init();
      
      expect(connectorManagerSpy).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      jest.spyOn(conversaSDK['mcpOrchestrator'], 'initialize').mockRejectedValue(error);
      
      await expect(conversaSDK.init()).rejects.toThrow();
    });

    it('should initialize hosted platform mode', async () => {
      const hostedConfig = {
        ...mockConfig,
        dataSources: undefined
      };
      
      const sdk = new ConversaBI(hostedConfig);
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'initialized' })
      } as any);
      
      await sdk.init();
      
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.conversabi.dev/v1/init',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
    });
  });

  describe('Query Execution', () => {
    beforeEach(async () => {
      await conversaSDK.init();
    });

    it('should execute query successfully', async () => {
      const mockResponse = {
        id: 'test-response-id',
        query: 'What are my top products?',
        response: 'Your top products are...',
        data: [{ product: 'Laptop', sales: 100 }],
        insights: [],
        metadata: {
          processingTime: 150,
          dataSources: ['shopify'],
          cacheHit: false,
          queryComplexity: 'simple' as const
        },
        timestamp: new Date()
      };

      jest.spyOn(conversaSDK['nlpEngine'], 'processQuery').mockResolvedValue({
        intent: { type: 'retrieval', confidence: 0.9 },
        entities: [],
        dataSources: ['shopify']
      });

      jest.spyOn(conversaSDK['connectorManager'], 'executeQuery').mockResolvedValue([
        { product: 'Laptop', sales: 100 }
      ]);

      jest.spyOn(conversaSDK['nlpEngine'], 'generateInsights').mockResolvedValue([]);
      jest.spyOn(conversaSDK['nlpEngine'], 'formatResponse').mockResolvedValue('Your top products are...');
      jest.spyOn(conversaSDK['cacheManager'], 'get').mockResolvedValue(null);
      jest.spyOn(conversaSDK['cacheManager'], 'set').mockResolvedValue();

      const result = await conversaSDK.query('What are my top products?');

      expect(result).toEqual(expect.objectContaining({
        query: 'What are my top products?',
        response: 'Your top products are...',
        data: [{ product: 'Laptop', sales: 100 }]
      }));
    });

    it('should return cached response when available', async () => {
      const cachedResponse = {
        id: 'cached-response',
        query: 'What are my top products?',
        response: 'Cached response',
        data: [],
        insights: [],
        metadata: {
          processingTime: 50,
          dataSources: ['shopify'],
          cacheHit: true,
          queryComplexity: 'simple' as const
        },
        timestamp: new Date()
      };

      jest.spyOn(conversaSDK['cacheManager'], 'get').mockResolvedValue(cachedResponse);

      const result = await conversaSDK.query('What are my top products?');

      expect(result.metadata.cacheHit).toBe(true);
      expect(conversaSDK['nlpEngine'].processQuery).not.toHaveBeenCalled();
    });

    it('should handle query execution errors', async () => {
      const error = new Error('Query execution failed');
      jest.spyOn(conversaSDK['nlpEngine'], 'processQuery').mockRejectedValue(error);

      await expect(conversaSDK.query('test query')).rejects.toThrow();
    });

    it('should use hosted platform for queries when no data sources', async () => {
      const hostedConfig = {
        ...mockConfig,
        dataSources: undefined
      };
      
      const sdk = new ConversaBI(hostedConfig);
      await sdk.init();

      const mockResponse = {
        id: 'hosted-response',
        query: 'test query',
        response: 'hosted response',
        data: [],
        insights: [],
        metadata: { processingTime: 100, dataSources: [], cacheHit: false, queryComplexity: 'simple' as const },
        timestamp: new Date()
      };

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as any);

      const result = await sdk.query('test query');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.conversabi.dev/v1/query',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Chat Sessions', () => {
    beforeEach(async () => {
      await conversaSDK.init();
    });

    it('should create chat session', async () => {
      const session = await conversaSDK.createChatSession({
        userId: 'test-user',
        preferences: { theme: 'dark' }
      });

      expect(session).toEqual(expect.objectContaining({
        id: expect.any(String),
        messages: [],
        context: expect.objectContaining({
          userId: 'test-user'
        }),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }));
    });

    it('should send message in session', async () => {
      const session = await conversaSDK.createChatSession({ userId: 'test-user' });
      
      jest.spyOn(conversaSDK, 'query').mockResolvedValue({
        id: 'test-response',
        query: 'test message',
        response: 'test response',
        data: [],
        insights: [],
        metadata: {
          processingTime: 100,
          dataSources: [],
          cacheHit: false,
          queryComplexity: 'simple' as const
        },
        timestamp: new Date()
      });

      const message = await conversaSDK.sendMessage(session.id, 'test message');

      expect(message).toEqual(expect.objectContaining({
        id: expect.any(String),
        role: 'assistant',
        content: 'test response',
        timestamp: expect.any(Date)
      }));
    });

    it('should handle session not found error', async () => {
      await expect(conversaSDK.sendMessage('non-existent-session', 'test')).rejects.toThrow();
    });
  });

  describe('Event Emission', () => {
    it('should emit initialized event', async () => {
      const eventSpy = jest.fn();
      conversaSDK.on('initialized', eventSpy);

      await conversaSDK.init();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should emit query event', async () => {
      await conversaSDK.init();
      
      const eventSpy = jest.fn();
      conversaSDK.on('query', eventSpy);

      jest.spyOn(conversaSDK['nlpEngine'], 'processQuery').mockResolvedValue({
        intent: { type: 'retrieval', confidence: 0.9 },
        entities: [],
        dataSources: ['shopify']
      });

      jest.spyOn(conversaSDK['connectorManager'], 'executeQuery').mockResolvedValue([]);
      jest.spyOn(conversaSDK['nlpEngine'], 'generateInsights').mockResolvedValue([]);
      jest.spyOn(conversaSDK['nlpEngine'], 'formatResponse').mockResolvedValue('response');
      jest.spyOn(conversaSDK['cacheManager'], 'get').mockResolvedValue(null);
      jest.spyOn(conversaSDK['cacheManager'], 'set').mockResolvedValue();

      await conversaSDK.query('test query');

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        query: 'test query'
      }));
    });

    it('should emit error event', async () => {
      await conversaSDK.init();
      
      const eventSpy = jest.fn();
      conversaSDK.on('error', eventSpy);

      jest.spyOn(conversaSDK['nlpEngine'], 'processQuery').mockRejectedValue(new Error('test error'));

      await expect(conversaSDK.query('test query')).rejects.toThrow();

      expect(eventSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Utility Methods', () => {
    it('should generate unique response IDs', () => {
      const id1 = conversaSDK['generateResponseId']();
      const id2 = conversaSDK['generateResponseId']();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^resp_\d+_\w+$/);
    });

    it('should generate unique message IDs', () => {
      const id1 = conversaSDK['generateMessageId']();
      const id2 = conversaSDK['generateMessageId']();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^msg_\d+_\w+$/);
    });

    it('should generate cache keys consistently', () => {
      const key1 = conversaSDK['generateCacheKey']('test query', { context: 'test' });
      const key2 = conversaSDK['generateCacheKey']('test query', { context: 'test' });

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^query_\w+_\w+$/);
    });

    it('should assess query complexity correctly', () => {
      const simpleQuery = { dataSources: ['shopify'], operations: ['get'] };
      const moderateQuery = { dataSources: ['shopify', 'stripe'], operations: ['get', 'filter', 'sort'] };
      const complexQuery = { dataSources: ['shopify', 'stripe', 'salesforce'], operations: ['get', 'filter', 'sort', 'aggregate', 'join'] };

      expect(conversaSDK['assessQueryComplexity'](simpleQuery)).toBe('simple');
      expect(conversaSDK['assessQueryComplexity'](moderateQuery)).toBe('moderate');
      expect(conversaSDK['assessQueryComplexity'](complexQuery)).toBe('complex');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const hostedConfig = {
        ...mockConfig,
        dataSources: undefined
      };
      
      const sdk = new ConversaBI(hostedConfig);
      await sdk.init();

      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(sdk.query('test query')).rejects.toThrow();
    });

    it('should handle API errors with proper error codes', async () => {
      const hostedConfig = {
        ...mockConfig,
        dataSources: undefined
      };
      
      const sdk = new ConversaBI(hostedConfig);
      await sdk.init();

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as any);

      await expect(sdk.query('test query')).rejects.toThrow();
    });
  });
});