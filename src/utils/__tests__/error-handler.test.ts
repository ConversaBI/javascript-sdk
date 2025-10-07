/**
 * Unit Tests for Error Handler
 * Comprehensive test coverage for error handling utilities
 */

import { 
  ConversaError, 
  ErrorFactory, 
  ErrorHandler, 
  ErrorContext,
  setupGlobalErrorHandlers 
} from '../error-handler';

describe('ConversaError', () => {
  describe('Constructor', () => {
    it('should create error with all properties', () => {
      const context: ErrorContext = {
        tenantId: 'test-tenant',
        userId: 'test-user',
        operation: 'test-operation'
      };
      
      const originalError = new Error('Original error');
      const error = new ConversaError(
        'Test error message',
        'TEST_ERROR',
        context,
        originalError,
        true
      );

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toEqual(context);
      expect(error.originalError).toBe(originalError);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe('ConversaError');
    });

    it('should create error with minimal parameters', () => {
      const error = new ConversaError('Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toBeUndefined();
      expect(error.originalError).toBeUndefined();
      expect(error.isOperational).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON format', () => {
      const context: ErrorContext = {
        tenantId: 'test-tenant',
        operation: 'test-operation'
      };
      
      const originalError = new Error('Original error');
      const error = new ConversaError(
        'Test error',
        'TEST_ERROR',
        context,
        originalError
      );

      const json = error.toJSON();

      expect(json).toEqual({
        code: 'TEST_ERROR',
        message: 'Test error',
        context,
        originalError: {
          name: 'Error',
          message: 'Original error',
          stack: originalError.stack
        },
        timestamp: error.timestamp,
        stack: error.stack
      });
    });

    it('should handle non-Error original errors', () => {
      const error = new ConversaError(
        'Test error',
        'TEST_ERROR',
        undefined,
        'string error'
      );

      const json = error.toJSON();

      expect(json.originalError).toBe('string error');
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly messages for known error codes', () => {
      const authError = new ConversaError('Auth failed', 'AUTHENTICATION_ERROR');
      const validationError = new ConversaError('Invalid input', 'VALIDATION_ERROR');
      const rateLimitError = new ConversaError('Too many requests', 'RATE_LIMIT_EXCEEDED');

      expect(authError.getUserMessage()).toBe('Authentication failed. Please check your API key.');
      expect(validationError.getUserMessage()).toBe('Invalid request data. Please check your input.');
      expect(rateLimitError.getUserMessage()).toBe('Rate limit exceeded. Please try again later.');
    });

    it('should return generic message for unknown error codes', () => {
      const unknownError = new ConversaError('Unknown error', 'UNKNOWN_ERROR');
      
      expect(unknownError.getUserMessage()).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('isRetryable', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        new ConversaError('Network error', 'NETWORK_ERROR'),
        new ConversaError('Cache error', 'CACHE_ERROR'),
        new ConversaError('Rate limit', 'RATE_LIMIT_EXCEEDED'),
        new ConversaError('Internal error', 'INTERNAL_SERVER_ERROR')
      ];

      retryableErrors.forEach(error => {
        expect(error.isRetryable()).toBe(true);
      });
    });

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        new ConversaError('Auth failed', 'AUTHENTICATION_ERROR'),
        new ConversaError('Invalid input', 'VALIDATION_ERROR'),
        new ConversaError('Not found', 'NOT_FOUND')
      ];

      nonRetryableErrors.forEach(error => {
        expect(error.isRetryable()).toBe(false);
      });
    });
  });

  describe('getRetryDelay', () => {
    it('should return appropriate delay for rate limit errors', () => {
      const rateLimitError = new ConversaError('Rate limit', 'RATE_LIMIT_EXCEEDED');
      
      expect(rateLimitError.getRetryDelay(1)).toBe(60000); // 1 minute
      expect(rateLimitError.getRetryDelay(2)).toBe(60000); // Still 1 minute
    });

    it('should return exponential backoff for other retryable errors', () => {
      const networkError = new ConversaError('Network error', 'NETWORK_ERROR');
      
      const delay1 = networkError.getRetryDelay(1);
      const delay2 = networkError.getRetryDelay(2);
      const delay3 = networkError.getRetryDelay(3);

      expect(delay1).toBeGreaterThan(1000);
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
      expect(delay3).toBeLessThanOrEqual(30000); // Max delay
    });
  });
});

describe('ErrorFactory', () => {
  it('should create authentication errors', () => {
    const error = ErrorFactory.authentication('Custom auth message');
    
    expect(error.code).toBe('AUTHENTICATION_ERROR');
    expect(error.message).toBe('Custom auth message');
  });

  it('should create validation errors with context', () => {
    const context: ErrorContext = { tenantId: 'test-tenant' };
    const error = ErrorFactory.validation('Invalid data', context);
    
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid data');
    expect(error.context).toEqual(context);
  });

  it('should create query execution errors with original error', () => {
    const originalError = new Error('Query failed');
    const error = ErrorFactory.queryExecution('Query execution failed', undefined, originalError);
    
    expect(error.code).toBe('QUERY_EXECUTION_ERROR');
    expect(error.originalError).toBe(originalError);
  });
});

describe('ErrorHandler', () => {
  describe('wrap', () => {
    it('should wrap successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const context: ErrorContext = { operation: 'test' };
      
      const result = await ErrorHandler.wrap(operation, context, 'TEST_ERROR');
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should wrap and handle errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const context: ErrorContext = { operation: 'test' };
      
      await expect(ErrorHandler.wrap(operation, context, 'TEST_ERROR')).rejects.toThrow(ConversaError);
    });

    it('should preserve ConversaError instances', async () => {
      const conversaError = new ConversaError('Test error', 'TEST_ERROR');
      const operation = jest.fn().mockRejectedValue(conversaError);
      
      await expect(ErrorHandler.wrap(operation)).rejects.toBe(conversaError);
    });
  });

  describe('handle', () => {
    it('should handle ConversaError instances', () => {
      const conversaError = new ConversaError('Test error', 'TEST_ERROR');
      const context: ErrorContext = { tenantId: 'test' };
      
      const result = ErrorHandler.handle(conversaError, context);
      
      expect(result).toBe(conversaError);
    });

    it('should handle regular Error instances', () => {
      const error = new Error('Regular error');
      const context: ErrorContext = { tenantId: 'test' };
      
      const result = ErrorHandler.handle(error, context);
      
      expect(result).toBeInstanceOf(ConversaError);
      expect(result.code).toBe('UNEXPECTED_ERROR');
      expect(result.context).toEqual(context);
      expect(result.originalError).toBe(error);
    });

    it('should handle non-Error instances', () => {
      const error = 'String error';
      const context: ErrorContext = { tenantId: 'test' };
      
      const result = ErrorHandler.handle(error, context);
      
      expect(result).toBeInstanceOf(ConversaError);
      expect(result.message).toBe('String error');
      expect(result.code).toBe('UNEXPECTED_ERROR');
    });
  });

  describe('toHttpResponse', () => {
    it('should convert error to HTTP response format', () => {
      const error = new ConversaError('Test error', 'VALIDATION_ERROR', {
        requestId: 'req-123'
      });
      
      const response = ErrorHandler.toHttpResponse(error);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Test error',
        userMessage: 'Invalid request data. Please check your input.',
        timestamp: error.timestamp.toISOString(),
        requestId: 'req-123'
      });
    });

    it('should map error codes to correct HTTP status codes', () => {
      const statusTests = [
        { code: 'AUTHENTICATION_ERROR', expected: 401 },
        { code: 'AUTHORIZATION_ERROR', expected: 403 },
        { code: 'VALIDATION_ERROR', expected: 400 },
        { code: 'RATE_LIMIT_EXCEEDED', expected: 429 },
        { code: 'NOT_FOUND', expected: 404 },
        { code: 'INTERNAL_SERVER_ERROR', expected: 500 }
      ];

      statusTests.forEach(({ code, expected }) => {
        const error = new ConversaError('Test', code);
        const response = ErrorHandler.toHttpResponse(error);
        expect(response.statusCode).toBe(expected);
      });
    });
  });

  describe('retry', () => {
    it('should retry successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await ErrorHandler.retry(operation, 3);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry retryable errors', async () => {
      const networkError = new ConversaError('Network error', 'NETWORK_ERROR');
      const operation = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');
      
      const result = await ErrorHandler.retry(operation, 3);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const authError = new ConversaError('Auth failed', 'AUTHENTICATION_ERROR');
      const operation = jest.fn().mockRejectedValue(authError);
      
      await expect(ErrorHandler.retry(operation, 3)).rejects.toBe(authError);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max attempts', async () => {
      const networkError = new ConversaError('Network error', 'NETWORK_ERROR');
      const operation = jest.fn().mockRejectedValue(networkError);
      
      await expect(ErrorHandler.retry(operation, 2)).rejects.toBe(networkError);
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Global Error Handlers', () => {
  let originalHandlers: {
    uncaughtException: NodeJS.UncaughtExceptionListener[];
    unhandledRejection: NodeJS.UnhandledRejectionListener[];
  };

  beforeEach(() => {
    // Store original handlers
    originalHandlers = {
      uncaughtException: process.listeners('uncaughtException') as NodeJS.UncaughtExceptionListener[],
      unhandledRejection: process.listeners('unhandledRejection') as NodeJS.UnhandledRejectionListener[]
    };
    
    // Remove all listeners
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
  });

  afterEach(() => {
    // Restore original handlers
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
    
    originalHandlers.uncaughtException.forEach(listener => {
      process.on('uncaughtException', listener);
    });
    
    originalHandlers.unhandledRejection.forEach(listener => {
      process.on('unhandledRejection', listener);
    });
  });

  it('should setup global error handlers', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    setupGlobalErrorHandlers();
    
    // Trigger uncaught exception
    process.emit('uncaughtException', new Error('Test error'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Uncaught Exception:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should handle unhandled promise rejections', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    setupGlobalErrorHandlers();
    
    // Trigger unhandled rejection
    process.emit('unhandledRejection', new Error('Test rejection'), Promise.resolve());
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Unhandled Rejection at:',
      expect.any(Promise),
      'reason:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});
