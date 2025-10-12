import { useState, useEffect, useCallback, useRef } from 'react';
import { InteractionManager, PerformanceObserver } from 'react-native';

export interface PerformanceMetrics {
  jsHeapSize: number;
  nativeHeapSize: number;
  fps: number;
  renderTime: number;
  interactionTime: number;
  memoryWarnings: number;
}

export interface PerformanceStats {
  current: PerformanceMetrics;
  average: PerformanceMetrics;
  peak: PerformanceMetrics;
  measurements: number;
}

const SAMPLE_INTERVAL = 1000; // 1 second
const MAX_SAMPLES = 60; // Keep last 60 samples

export const usePerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    current: {
      jsHeapSize: 0,
      nativeHeapSize: 0,
      fps: 60,
      renderTime: 0,
      interactionTime: 0,
      memoryWarnings: 0,
    },
    average: {
      jsHeapSize: 0,
      nativeHeapSize: 0,
      fps: 60,
      renderTime: 0,
      interactionTime: 0,
      memoryWarnings: 0,
    },
    peak: {
      jsHeapSize: 0,
      nativeHeapSize: 0,
      fps: 60,
      renderTime: 0,
      interactionTime: 0,
      memoryWarnings: 0,
    },
    measurements: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const samplesRef = useRef<PerformanceMetrics[]>([]);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const measurePerformance = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastFrameTimeRef.current;
    
    // Calculate FPS
    frameCountRef.current++;
    const fps = deltaTime > 0 ? Math.min(60, 1000 / deltaTime) : 60;
    lastFrameTimeRef.current = now;

    // Measure interaction time
    const interactionStart = Date.now();
    InteractionManager.runAfterInteractions(() => {
      const interactionTime = Date.now() - interactionStart;

      // Create current metrics
      const currentMetrics: PerformanceMetrics = {
        jsHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        nativeHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
        fps,
        renderTime: deltaTime,
        interactionTime,
        memoryWarnings: 0, // Would need native module for actual warnings
      };

      // Add to samples
      samplesRef.current.push(currentMetrics);
      if (samplesRef.current.length > MAX_SAMPLES) {
        samplesRef.current.shift();
      }

      // Calculate averages
      const sampleCount = samplesRef.current.length;
      const average: PerformanceMetrics = samplesRef.current.reduce(
        (acc, sample) => ({
          jsHeapSize: acc.jsHeapSize + sample.jsHeapSize / sampleCount,
          nativeHeapSize: acc.nativeHeapSize + sample.nativeHeapSize / sampleCount,
          fps: acc.fps + sample.fps / sampleCount,
          renderTime: acc.renderTime + sample.renderTime / sampleCount,
          interactionTime: acc.interactionTime + sample.interactionTime / sampleCount,
          memoryWarnings: acc.memoryWarnings + sample.memoryWarnings / sampleCount,
        }),
        {
          jsHeapSize: 0,
          nativeHeapSize: 0,
          fps: 0,
          renderTime: 0,
          interactionTime: 0,
          memoryWarnings: 0,
        }
      );

      // Calculate peaks
      const peak: PerformanceMetrics = samplesRef.current.reduce(
        (acc, sample) => ({
          jsHeapSize: Math.max(acc.jsHeapSize, sample.jsHeapSize),
          nativeHeapSize: Math.max(acc.nativeHeapSize, sample.nativeHeapSize),
          fps: Math.max(acc.fps, sample.fps),
          renderTime: Math.max(acc.renderTime, sample.renderTime),
          interactionTime: Math.max(acc.interactionTime, sample.interactionTime),
          memoryWarnings: Math.max(acc.memoryWarnings, sample.memoryWarnings),
        }),
        {
          jsHeapSize: 0,
          nativeHeapSize: 0,
          fps: 0,
          renderTime: 0,
          interactionTime: 0,
          memoryWarnings: 0,
        }
      );

      setStats({
        current: currentMetrics,
        average,
        peak,
        measurements: sampleCount,
      });
    });
  }, []);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    samplesRef.current = [];
    frameCountRef.current = 0;
    lastFrameTimeRef.current = Date.now();

    intervalRef.current = setInterval(measurePerformance, SAMPLE_INTERVAL);
  }, [isMonitoring, measurePerformance]);

  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isMonitoring]);

  const resetStats = useCallback(() => {
    samplesRef.current = [];
    frameCountRef.current = 0;
    lastFrameTimeRef.current = Date.now();
    setStats({
      current: {
        jsHeapSize: 0,
        nativeHeapSize: 0,
        fps: 60,
        renderTime: 0,
        interactionTime: 0,
        memoryWarnings: 0,
      },
      average: {
        jsHeapSize: 0,
        nativeHeapSize: 0,
        fps: 60,
        renderTime: 0,
        interactionTime: 0,
        memoryWarnings: 0,
      },
      peak: {
        jsHeapSize: 0,
        nativeHeapSize: 0,
        fps: 60,
        renderTime: 0,
        interactionTime: 0,
        memoryWarnings: 0,
      },
      measurements: 0,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetStats,
  };
};
