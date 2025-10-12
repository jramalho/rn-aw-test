import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { usePerformanceMonitor } from '../hooks';

const PerformanceDashboardScreen: React.FC = () => {
  const { stats, isMonitoring, startMonitoring, stopMonitoring, resetStats } =
    usePerformanceMonitor();

  useEffect(() => {
    // Auto-start monitoring when screen mounts
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatMs = (ms: number): string => {
    return `${Math.round(ms * 100) / 100}ms`;
  };

  const getPerformanceColor = (value: number, threshold: number, inverse = false): string => {
    if (inverse) {
      return value > threshold ? '#22c55e' : value > threshold * 0.7 ? '#eab308' : '#ef4444';
    }
    return value < threshold ? '#22c55e' : value < threshold * 1.5 ? '#eab308' : '#ef4444';
  };

  const MetricCard = ({
    title,
    current,
    average,
    peak,
    unit,
    formatter = (v: any) => v.toString(),
    threshold,
    inverse = false,
  }: {
    title: string;
    current: number;
    average: number;
    peak: number;
    unit?: string;
    formatter?: (v: number) => string;
    threshold?: number;
    inverse?: boolean;
  }) => {
    const color = threshold
      ? getPerformanceColor(current, threshold, inverse)
      : '#3b82f6';

    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={styles.metricValues}>
          <View style={styles.metricValueContainer}>
            <Text style={[styles.metricLabel, { color }]}>Current</Text>
            <Text style={[styles.metricValue, { color }]}>
              {formatter(current)}
              {unit && ` ${unit}`}
            </Text>
          </View>
          <View style={styles.metricValueContainer}>
            <Text style={styles.metricLabel}>Average</Text>
            <Text style={styles.metricValue}>
              {formatter(average)}
              {unit && ` ${unit}`}
            </Text>
          </View>
          <View style={styles.metricValueContainer}>
            <Text style={styles.metricLabel}>Peak</Text>
            <Text style={styles.metricValue}>
              {formatter(peak)}
              {unit && ` ${unit}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          New Architecture Monitoring
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isMonitoring ? '#22c55e' : '#ef4444' },
                ]}
              />
              <Text style={styles.statusText}>
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
              </Text>
            </View>
            <Text style={styles.measurementCount}>
              {stats.measurements} samples
            </Text>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                isMonitoring ? styles.buttonDanger : styles.buttonPrimary,
              ]}
              onPress={isMonitoring ? stopMonitoring : startMonitoring}
            >
              <Text style={styles.buttonText}>
                {isMonitoring ? '⏸ Pause' : '▶️ Start'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={resetStats}
            >
              <Text style={styles.buttonText}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Architecture Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🏗️ New Architecture Benefits</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>
              Fabric Renderer: Synchronous UI updates
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>
              TurboModules: Optimized native calls
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>✓</Text>
            <Text style={styles.infoText}>
              JSI: Direct JavaScript-Native communication
            </Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <Text style={styles.sectionTitle}>Performance Metrics</Text>

        <MetricCard
          title="Frame Rate"
          current={stats.current.fps}
          average={stats.average.fps}
          peak={stats.peak.fps}
          unit="FPS"
          formatter={(v) => Math.round(v).toString()}
          threshold={50}
          inverse={true}
        />

        <MetricCard
          title="Render Time"
          current={stats.current.renderTime}
          average={stats.average.renderTime}
          peak={stats.peak.renderTime}
          formatter={formatMs}
          threshold={16.67} // 60fps = 16.67ms per frame
        />

        <MetricCard
          title="Interaction Time"
          current={stats.current.interactionTime}
          average={stats.average.interactionTime}
          peak={stats.peak.interactionTime}
          formatter={formatMs}
          threshold={100}
        />

        <MetricCard
          title="JS Heap Size"
          current={stats.current.jsHeapSize}
          average={stats.average.jsHeapSize}
          peak={stats.peak.jsHeapSize}
          formatter={formatBytes}
          threshold={50 * 1024 * 1024} // 50MB
        />

        <MetricCard
          title="Native Heap Size"
          current={stats.current.nativeHeapSize}
          average={stats.average.nativeHeapSize}
          peak={stats.peak.nativeHeapSize}
          formatter={formatBytes}
          threshold={100 * 1024 * 1024} // 100MB
        />

        {/* Performance Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Performance Tips</Text>
          <Text style={styles.tipText}>
            • Target 60 FPS for smooth animations
          </Text>
          <Text style={styles.tipText}>
            • Keep render time under 16.67ms per frame
          </Text>
          <Text style={styles.tipText}>
            • Interaction time under 100ms feels instant
          </Text>
          <Text style={styles.tipText}>
            • Monitor memory usage to prevent leaks
          </Text>
          <Text style={styles.tipText}>
            • New Architecture eliminates bridge bottlenecks
          </Text>
        </View>

        {/* Platform Info */}
        <View style={styles.platformCard}>
          <Text style={styles.platformTitle}>Platform Information</Text>
          <View style={styles.platformRow}>
            <Text style={styles.platformLabel}>Platform:</Text>
            <Text style={styles.platformValue}>{Platform.OS}</Text>
          </View>
          <View style={styles.platformRow}>
            <Text style={styles.platformLabel}>Version:</Text>
            <Text style={styles.platformValue}>{Platform.Version}</Text>
          </View>
          <View style={styles.platformRow}>
            <Text style={styles.platformLabel}>Hermes:</Text>
            <Text style={styles.platformValue}>
              {(global as any).HermesInternal ? '✓ Enabled' : '✗ Disabled'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statusSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  measurementCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  infoBullet: {
    fontSize: 14,
    color: '#1e40af',
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  metricValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricValueContainer: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tipsCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    marginVertical: 2,
  },
  platformCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  platformTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  platformLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  platformValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default PerformanceDashboardScreen;
