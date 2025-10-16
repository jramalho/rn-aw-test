/**
 * Performance Analytics Service
 * Tracks app performance metrics, startup times, screen transitions, and errors
 * Provides comprehensive analytics without external dependencies
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface PerformanceEvent {
  id: string;
  type: 'startup' | 'screen' | 'interaction' | 'error' | 'api' | 'custom';
  name: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ErrorEvent {
  id: string;
  timestamp: number;
  error: string;
  stack?: string;
  componentStack?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsReport {
  sessionId: string;
  startTime: number;
  endTime: number;
  platform: string;
  platformVersion: string;
  appVersion: string;
  events: PerformanceEvent[];
  errors: ErrorEvent[];
  summary: {
    totalEvents: number;
    totalErrors: number;
    avgScreenLoadTime: number;
    avgApiCallTime: number;
    slowestScreen: { name: string; duration: number } | null;
    slowestApi: { name: string; duration: number } | null;
  };
}

// Constants
const STORAGE_KEY = '@performance_analytics';
const MAX_EVENTS = 500;
const MAX_ERRORS = 100;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class PerformanceAnalyticsService {
  private sessionId: string;
  private events: PerformanceEvent[] = [];
  private errors: ErrorEvent[] = [];
  private startupTime: number;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private timers: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startupTime = Date.now();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.initializeSession();
  }

  /**
   * Initialize analytics session
   */
  private async initializeSession(): Promise<void> {
    try {
      // Load previous session if within timeout
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const timeSinceLastActivity = Date.now() - data.lastActivityTime;
        
        if (timeSinceLastActivity < SESSION_TIMEOUT) {
          // Continue previous session
          this.sessionId = data.sessionId;
          this.events = data.events || [];
          this.errors = data.errors || [];
        }
      }

      // Track app startup
      this.trackStartup();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Track app startup time
   */
  private trackStartup(): void {
    const startupDuration = Date.now() - this.startupTime;
    this.trackEvent({
      type: 'startup',
      name: 'app_startup',
      duration: startupDuration,
      metadata: {
        platform: Platform.OS,
        version: Platform.Version,
      },
    });
  }

  /**
   * Track performance event
   */
  public trackEvent(event: Omit<PerformanceEvent, 'id' | 'timestamp'>): void {
    const perfEvent: PerformanceEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...event,
    };

    this.events.push(perfEvent);
    
    // Trim events if exceeding max
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }

    this.lastActivityTime = Date.now();
    this.persistSession();
  }

  /**
   * Track error event
   */
  public trackError(error: Omit<ErrorEvent, 'id' | 'timestamp'>): void {
    const errorEvent: ErrorEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...error,
    };

    this.errors.push(errorEvent);
    
    // Trim errors if exceeding max
    if (this.errors.length > MAX_ERRORS) {
      this.errors = this.errors.slice(-MAX_ERRORS);
    }

    this.lastActivityTime = Date.now();
    this.persistSession();
  }

  /**
   * Start timing an operation
   */
  public startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  /**
   * End timing and track event
   */
  public endTimer(
    name: string,
    type: PerformanceEvent['type'] = 'custom',
    metadata?: Record<string, any>,
  ): number | null {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' not found`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.trackEvent({
      type,
      name,
      duration,
      metadata,
    });

    return duration;
  }

  /**
   * Track screen transition
   */
  public trackScreen(screenName: string, metadata?: Record<string, any>): void {
    // End previous screen timer if exists
    const previousScreen = Array.from(this.timers.keys()).find(key =>
      key.startsWith('screen_'),
    );
    if (previousScreen) {
      this.endTimer(previousScreen, 'screen');
    }

    // Start new screen timer
    const timerName = `screen_${screenName}`;
    this.startTimer(timerName);

    this.trackEvent({
      type: 'screen',
      name: screenName,
      metadata,
    });
  }

  /**
   * Track API call
   */
  public async trackApiCall<T>(
    apiName: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    this.startTimer(apiName);
    
    try {
      const result = await apiCall();
      this.endTimer(apiName, 'api', {
        ...metadata,
        success: true,
      });
      return result;
    } catch (error) {
      this.endTimer(apiName, 'api', {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Track user interaction
   */
  public trackInteraction(
    interactionName: string,
    metadata?: Record<string, any>,
  ): void {
    this.trackEvent({
      type: 'interaction',
      name: interactionName,
      metadata,
    });
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Persist session to storage
   */
  private async persistSession(): Promise<void> {
    try {
      const data = {
        sessionId: this.sessionId,
        events: this.events,
        errors: this.errors,
        lastActivityTime: this.lastActivityTime,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist analytics:', error);
    }
  }

  /**
   * Generate analytics report
   */
  public async generateReport(): Promise<AnalyticsReport> {
    const screenEvents = this.events.filter(e => e.type === 'screen' && e.duration);
    const apiEvents = this.events.filter(e => e.type === 'api' && e.duration);

    const avgScreenLoadTime = screenEvents.length > 0
      ? screenEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / screenEvents.length
      : 0;

    const avgApiCallTime = apiEvents.length > 0
      ? apiEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / apiEvents.length
      : 0;

    const slowestScreen = screenEvents.reduce<{ name: string; duration: number } | null>(
      (slowest, event) => {
        if (!slowest || (event.duration && event.duration > slowest.duration)) {
          return { name: event.name, duration: event.duration || 0 };
        }
        return slowest;
      },
      null,
    );

    const slowestApi = apiEvents.reduce<{ name: string; duration: number } | null>(
      (slowest, event) => {
        if (!slowest || (event.duration && event.duration > slowest.duration)) {
          return { name: event.name, duration: event.duration || 0 };
        }
        return slowest;
      },
      null,
    );

    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      platform: Platform.OS,
      platformVersion: String(Platform.Version),
      appVersion: '0.1.0', // Should be read from app config
      events: this.events,
      errors: this.errors,
      summary: {
        totalEvents: this.events.length,
        totalErrors: this.errors.length,
        avgScreenLoadTime,
        avgApiCallTime,
        slowestScreen,
        slowestApi,
      },
    };
  }

  /**
   * Export analytics data as JSON
   */
  public async exportData(): Promise<string> {
    const report = await this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Clear all analytics data
   */
  public async clearData(): Promise<void> {
    this.events = [];
    this.errors = [];
    this.timers.clear();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get current session metrics
   */
  public getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      eventCount: this.events.length,
      errorCount: this.errors.length,
      sessionDuration: Date.now() - this.sessionStartTime,
      lastActivity: this.lastActivityTime,
    };
  }
}

// Export singleton instance
export const performanceAnalytics = new PerformanceAnalyticsService();
