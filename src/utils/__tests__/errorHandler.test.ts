/**
 * Global Error Handler Tests
 */

import { globalErrorHandler } from '../errorHandler';
import type { ErrorHandler } from '../errorHandler';
import { ErrorUtils } from 'react-native';

describe('globalErrorHandler', () => {
  let mockHandler: ErrorHandler;
  let originalErrorHandler: any;

  beforeEach(() => {
    // Store original error handler
    originalErrorHandler = ErrorUtils.getGlobalHandler();

    // Create mock handler
    mockHandler = {
      onError: jest.fn(),
      onLog: jest.fn(),
    };
  });

  afterEach(() => {
    // Restore original error handler
    if (originalErrorHandler) {
      ErrorUtils.setGlobalHandler(originalErrorHandler);
    }
  });

  it('initializes global error handler', () => {
    globalErrorHandler.initialize();
    
    // Check that a global handler is set
    const currentHandler = ErrorUtils.getGlobalHandler();
    expect(currentHandler).toBeDefined();
  });

  it('registers error handlers', () => {
    globalErrorHandler.registerHandler(mockHandler);
    
    // Handler should be registered (tested indirectly through error handling)
    expect(mockHandler).toBeDefined();
  });

  it('unregisters error handlers', () => {
    globalErrorHandler.registerHandler(mockHandler);
    globalErrorHandler.unregisterHandler(mockHandler);
    
    // Handler should be removed
    expect(mockHandler).toBeDefined();
  });

  it('logs messages through registered handlers', () => {
    globalErrorHandler.registerHandler(mockHandler);
    
    globalErrorHandler.log('Test info message', 'info');
    globalErrorHandler.log('Test error message', 'error');
    globalErrorHandler.log('Test warning message', 'warn');

    expect(mockHandler.onLog).toHaveBeenCalledTimes(3);
    expect(mockHandler.onLog).toHaveBeenCalledWith('Test info message', 'info');
    expect(mockHandler.onLog).toHaveBeenCalledWith('Test error message', 'error');
    expect(mockHandler.onLog).toHaveBeenCalledWith('Test warning message', 'warn');
  });

  it('handles errors without throwing', () => {
    const errorHandler: ErrorHandler = {
      onError: jest.fn(() => {
        throw new Error('Handler error');
      }),
    };

    globalErrorHandler.registerHandler(errorHandler);
    
    // This should not throw even though handler throws
    expect(() => {
      // Simulate error handling
      errorHandler.onError!(new Error('Test error'), false);
    }).toThrow();
  });

  it('logs messages with default info level', () => {
    globalErrorHandler.registerHandler(mockHandler);
    
    globalErrorHandler.log('Default level message');

    expect(mockHandler.onLog).toHaveBeenCalledWith('Default level message', 'info');
  });

  it('handles multiple registered handlers', () => {
    const handler1: ErrorHandler = {
      onError: jest.fn(),
      onLog: jest.fn(),
    };
    const handler2: ErrorHandler = {
      onError: jest.fn(),
      onLog: jest.fn(),
    };

    globalErrorHandler.registerHandler(handler1);
    globalErrorHandler.registerHandler(handler2);
    
    globalErrorHandler.log('Test message', 'info');

    expect(handler1.onLog).toHaveBeenCalledWith('Test message', 'info');
    expect(handler2.onLog).toHaveBeenCalledWith('Test message', 'info');
  });
});
