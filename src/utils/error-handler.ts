/**
 * Comprehensive Error Handling System
 * Centralized error handling with proper typing and context
 */

export interface ErrorContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export interface ConversaErrorDetails {
  code: string;
  message: string;
  context?: ErrorContext;
  originalError?: unknown;
  timestamp: Date;
  stack?: string;
}

export class ConversaError extends Error {
  public readonly code: string;
  public readonly context?: ErrorContext;
  public readonly originalError?: unknown;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    context?: ErrorContext,
    originalError?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = 'ConversaError';
    this.code = code;
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConversaError);
    }
  }

  /**
   * Convert error to JSON for logging/API responses
   */
  toJSON(): ConversaErrorDetails {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      originalError: this.originalError instanceof Error ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : this.originalError,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'AUTHENTICATION_ERROR':
        return 'Authentication failed. Please check your API key.';
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action.';
      case 'VALIDATION_ERROR':
        return 'Invalid request data. Please check your input.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Rate limit exceeded. Please try again later.';
      case 'QUERY_EXECUTION_ERROR':
        return 'Query execution failed. Please try rephrasing your question.';
      case 'DATA_SOURCE_ERROR':
        return 'Data source connection failed. Please check your configuration.';
      case 'CACHE_ERROR':
        return 'Temporary service issue. Please try again.';
      case 'NETWORK_ERROR':
        return 'Network connection failed. Please check your internet connection.';
      case 'INTERNAL_SERVER_ERROR':
        return 'An internal error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error should be retried
   */
  isRetryable(): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'CACHE_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'INTERNAL_SERVER_ERROR'
    ];
    
    return retryableCodes.includes(this.code);
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    if (this.code === 'RATE_LIMIT_EXCEEDED') {
      return 60000; // 1 minute for rate limits
    }
    
    // Exponential backoff with jitter
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.1 * delay;
    
    return Math.floor(delay + jitter);
  }
}

/**
 * Error factory functions for common error types
 */
export const ErrorFactory = {
  authentication: (message: string = 'Authentication failed', context?: ErrorContext) =>
    new ConversaError(message, 'AUTHENTICATION_ERROR', context),
    
  authorization: (message: string = 'Access denied', context?: ErrorContext) =>
    new ConversaError(message, 'AUTHORIZATION_ERROR', context),
    
  validation: (message: string = 'Validation failed', context?: ErrorContext) =>
    new ConversaError(message, 'VALIDATION_ERROR', context),
    
  rateLimit: (message: string = 'Rate limit exceeded', context?: ErrorContext) =>
    new ConversaError(message, 'RATE_LIMIT_EXCEEDED', context),
    
  queryExecution: (message: string = 'Query execution failed', context?: ErrorContext, originalError?: unknown) =>
    new ConversaError(message, 'QUERY_EXECUTION_ERROR', context, originalError),
    
  dataSource: (message: string = 'Data source error', context?: ErrorContext, originalError?: unknown) =>
    new ConversaError(message, 'DATA_SOURCE_ERROR', context, originalError),
    
  cache: (message: string = 'Cache operation failed', context?: ErrorContext, originalError?: unknown) =>
    new ConversaError(message, 'CACHE_ERROR', context, originalError),
    
  network: (message: string = 'Network error', context?: ErrorContext, originalError?: unknown) =>
    new ConversaError(message, 'NETWORK_ERROR', context, originalError),
    
  internal: (message: string = 'Internal server error', context?: ErrorContext, originalError?: unknown) =>
    new ConversaError(message, 'INTERNAL_SERVER_ERROR', context, originalError, false),
    
  notFound: (message: string = 'Resource not found', context?: ErrorContext) =>
    new ConversaError(message, 'NOT_FOUND', context),
    
  conflict: (message: string = 'Resource conflict', context?: ErrorContext) =>
    new ConversaError(message, 'CONFLICT', context),
    
  timeout: (message: string = 'Operation timed out', context?: ErrorContext) =>
    new ConversaError(message, 'TIMEOUT', context)
};

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Wrap async function with error handling
   */
  static async wrap<T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    errorCode: string = 'OPERATION_ERROR'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ConversaError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ConversaError(errorMessage, errorCode, context, error);
    }
  }

  /**
   * Handle and log error with context
   */
  static handle(error: unknown, context?: ErrorContext): ConversaError {
    if (error instanceof ConversaError) {
      // Log the error with context
      console.error('ConversaError:', {
        code: error.code,
        message: error.message,
        context: { ...error.context, ...context },
        stack: error.stack
      });
      return error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const conversaError = new ConversaError(
      errorMessage,
      'UNEXPECTED_ERROR',
      context,
      error,
      false
    );
    
    // Log unexpected errors
    console.error('Unexpected Error:', {
      message: errorMessage,
      context,
      originalError: error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return conversaError;
  }

  /**
   * Convert error to HTTP response format
   */
  static toHttpResponse(error: ConversaError): {
    statusCode: number;
    body: {
      error: {
        code: string;
        message: string;
        userMessage: string;
        timestamp: string;
        requestId?: string;
      };
    };
  } {
    const statusCode = this.getHttpStatusCode(error.code);
    
    return {
      statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          userMessage: error.getUserMessage(),
          timestamp: error.timestamp.toISOString(),
          requestId: error.context?.requestId
        }
      }
    };
  }

  /**
   * Map error codes to HTTP status codes
   */
  private static getHttpStatusCode(errorCode: string): number {
    const statusMap: Record<string, number> = {
      'AUTHENTICATION_ERROR': 401,
      'AUTHORIZATION_ERROR': 403,
      'VALIDATION_ERROR': 400,
      'RATE_LIMIT_EXCEEDED': 429,
      'NOT_FOUND': 404,
      'CONFLICT': 409,
      'TIMEOUT': 408,
      'QUERY_EXECUTION_ERROR': 422,
      'DATA_SOURCE_ERROR': 503,
      'CACHE_ERROR': 503,
      'NETWORK_ERROR': 503,
      'INTERNAL_SERVER_ERROR': 500,
      'UNEXPECTED_ERROR': 500
    };
    
    return statusMap[errorCode] || 500;
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    context?: ErrorContext
  ): Promise<T> {
    let lastError: ConversaError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.handle(error, context);
        
        if (!lastError.isRetryable() || attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = lastError.getRetryDelay(attempt - 1);
        console.log(`Retrying operation (attempt ${attempt}/${maxAttempts}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

/**
 * Global error handlers
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    const conversaError = ErrorHandler.handle(error);
    
    // In production, you might want to send this to a monitoring service
    // and gracefully shutdown the process
    if (conversaError.code === 'INTERNAL_SERVER_ERROR') {
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    const conversaError = ErrorHandler.handle(reason);
    
    // In production, you might want to send this to a monitoring service
    if (conversaError.code === 'INTERNAL_SERVER_ERROR') {
      process.exit(1);
    }
  });
}
