/**
 * Global Error Handler
 *
 * Captures uncaught errors and provides user-friendly error screens
 * Integrates with error tracking services
 */

import { ErrorUtils } from 'react-native';

export interface ErrorHandler {
  onError?: (error: Error, isFatal: boolean) => void;
  onLog?: (message: string, level: 'error' | 'warn' | 'info') => void;
}

class GlobalErrorHandler {
  private handlers: ErrorHandler[] = [];
  private originalErrorHandler:
    | ((error: Error, isFatal?: boolean) => void)
    | null = null;

  /**
   * Initialize global error handler
   */
  initialize(): void {
    // Store original error handler
    this.originalErrorHandler = ErrorUtils.getGlobalHandler();

    // Set custom error handler
    ErrorUtils.setGlobalHandler(this.handleError);

    // Handle unhandled promise rejections
    if (global.Promise) {
      const originalRejectionHandler = global.Promise.prototype.catch;
      global.Promise.prototype.catch = function (onRejected?: any) {
        // Log unhandled rejections
        if (onRejected === undefined) {
          console.warn('Unhandled Promise rejection detected');
        }
        return originalRejectionHandler.call(this, onRejected);
      };
    }

    if (__DEV__) {
      console.log('Global error handler initialized');
    }
  }

  /**
   * Register error handler
   */
  registerHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Unregister error handler
   */
  unregisterHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * Handle global errors
   */
  private handleError = (error: Error, isFatal: boolean = false): void => {
    // Log to console in development
    if (__DEV__) {
      console.error('Global error caught:', {
        message: error.message,
        stack: error.stack,
        isFatal,
      });
    }

    // Notify all registered handlers
    this.handlers.forEach(handler => {
      if (handler.onError) {
        try {
          handler.onError(error, isFatal);
        } catch {
          console.error('Error in error handler:', handlerError);
        }
      }
    });

    // Call original error handler
    if (this.originalErrorHandler) {
      this.originalErrorHandler(error, isFatal);
    }
  };

  /**
   * Log message through registered handlers
   */
  log(message: string, level: 'error' | 'warn' | 'info' = 'info'): void {
    this.handlers.forEach(handler => {
      if (handler.onLog) {
        try {
          handler.onLog(message, level);
        } catch {
          console.error('Error in log handler:', error);
        }
      }
    });
  }
}

export const globalErrorHandler = new GlobalErrorHandler();
