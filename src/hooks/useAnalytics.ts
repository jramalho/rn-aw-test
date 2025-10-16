/**
 * useAnalytics Hook
 * Provides easy access to performance analytics throughout the app
 */

import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { performanceAnalytics } from '../services/analytics/performanceAnalytics';
import type { PerformanceEvent } from '../services/analytics/performanceAnalytics';

export const useAnalytics = () => {
  const navigation = useNavigation();

  /**
   * Track screen view automatically on navigation
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      if (currentRoute) {
        performanceAnalytics.trackScreen(currentRoute.name, {
          params: currentRoute.params,
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * Track custom event
   */
  const trackEvent = useCallback(
    (event: Omit<PerformanceEvent, 'id' | 'timestamp'>) => {
      performanceAnalytics.trackEvent(event);
    },
    [],
  );

  /**
   * Track user interaction
   */
  const trackInteraction = useCallback(
    (interactionName: string, metadata?: Record<string, any>) => {
      performanceAnalytics.trackInteraction(interactionName, metadata);
    },
    [],
  );

  /**
   * Track API call with automatic timing
   */
  const trackApiCall = useCallback(
    async <T,>(
      apiName: string,
      apiCall: () => Promise<T>,
      metadata?: Record<string, any>,
    ): Promise<T> => {
      return performanceAnalytics.trackApiCall(apiName, apiCall, metadata);
    },
    [],
  );

  /**
   * Track error
   */
  const trackError = useCallback(
    (error: Error, componentStack?: string, metadata?: Record<string, any>) => {
      performanceAnalytics.trackError({
        error: error.message,
        stack: error.stack,
        componentStack,
        metadata,
      });
    },
    [],
  );

  /**
   * Start timing operation
   */
  const startTimer = useCallback((name: string) => {
    performanceAnalytics.startTimer(name);
  }, []);

  /**
   * End timing operation
   */
  const endTimer = useCallback(
    (
      name: string,
      type: PerformanceEvent['type'] = 'custom',
      metadata?: Record<string, any>,
    ) => {
      return performanceAnalytics.endTimer(name, type, metadata);
    },
    [],
  );

  /**
   * Get analytics report
   */
  const getReport = useCallback(async () => {
    return performanceAnalytics.generateReport();
  }, []);

  /**
   * Export analytics data
   */
  const exportData = useCallback(async () => {
    return performanceAnalytics.exportData();
  }, []);

  /**
   * Clear analytics data
   */
  const clearData = useCallback(async () => {
    return performanceAnalytics.clearData();
  }, []);

  /**
   * Get session metrics
   */
  const getSessionMetrics = useCallback(() => {
    return performanceAnalytics.getSessionMetrics();
  }, []);

  return {
    trackEvent,
    trackInteraction,
    trackApiCall,
    trackError,
    startTimer,
    endTimer,
    getReport,
    exportData,
    clearData,
    getSessionMetrics,
  };
};
