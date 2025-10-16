/**
 * Analytics Dashboard Screen
 * Displays comprehensive performance analytics and metrics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTheme } from '../hooks/useTheme';
import type { AnalyticsReport } from '../services/analytics/performanceAnalytics';

const AnalyticsDashboardScreen: React.FC = () => {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getReport, exportData, clearData, getSessionMetrics } = useAnalytics();
  const { theme } = useTheme();

  const loadReport = async () => {
    try {
      const data = await getReport();
      setReport(data);
    } catch (error) {
      console.error('Failed to load analytics report:', error);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReport();
    setIsRefreshing(false);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      await Share.share({
        message: data,
        title: 'Performance Analytics Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export analytics data');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Analytics Data',
      'Are you sure you want to clear all analytics data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearData();
            await loadReport();
          },
        },
      ],
    );
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const sessionMetrics = getSessionMetrics();

  if (!report) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  const { summary } = report;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }>
      {/* Session Info */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Session Information
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Session ID:
          </Text>
          <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
            {report.sessionId}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Started:
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatDate(report.startTime)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Duration:
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatDuration(sessionMetrics.sessionDuration)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Platform:
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {report.platform} {report.platformVersion}
          </Text>
        </View>
      </View>

      {/* Summary Metrics */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Summary Metrics
        </Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.primary }]}>
              {summary.totalEvents}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Total Events
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text
              style={[
                styles.metricValue,
                { color: summary.totalErrors > 0 ? '#ef4444' : '#22c55e' },
              ]}>
              {summary.totalErrors}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Total Errors
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.primary }]}>
              {formatDuration(summary.avgScreenLoadTime)}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Avg Screen Load
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.primary }]}>
              {formatDuration(summary.avgApiCallTime)}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Avg API Call
            </Text>
          </View>
        </View>
      </View>

      {/* Slowest Operations */}
      {(summary.slowestScreen || summary.slowestApi) && (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Slowest Operations
          </Text>
          {summary.slowestScreen && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Screen:
              </Text>
              <Text style={[styles.value, { color: '#eab308' }]}>
                {summary.slowestScreen.name} (
                {formatDuration(summary.slowestScreen.duration)})
              </Text>
            </View>
          )}
          {summary.slowestApi && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                API Call:
              </Text>
              <Text style={[styles.value, { color: '#eab308' }]}>
                {summary.slowestApi.name} (
                {formatDuration(summary.slowestApi.duration)})
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Recent Events */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Recent Events ({report.events.slice(-10).length})
        </Text>
        {report.events.slice(-10).reverse().map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventType, { color: theme.primary }]}>
                {event.type.toUpperCase()}
              </Text>
              <Text style={[styles.eventName, { color: theme.text }]}>
                {event.name}
              </Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={[styles.eventTime, { color: theme.textSecondary }]}>
                {formatDate(event.timestamp)}
              </Text>
              {event.duration !== undefined && (
                <Text style={[styles.eventDuration, { color: theme.textSecondary }]}>
                  {formatDuration(event.duration)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Recent Errors */}
      {report.errors.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: '#ef4444' }]}>
            Recent Errors ({report.errors.slice(-5).length})
          </Text>
          {report.errors.slice(-5).reverse().map((error) => (
            <View key={error.id} style={styles.errorItem}>
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {error.error}
              </Text>
              <Text style={[styles.errorTime, { color: theme.textSecondary }]}>
                {formatDate(error.timestamp)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleExport}>
          <Text style={styles.buttonText}>Export Data</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.dangerButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleClear}>
          <Text style={styles.buttonText}>Clear Data</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metricItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  eventItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
    marginTop: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 10,
    fontWeight: '700',
    marginRight: 8,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventTime: {
    fontSize: 12,
  },
  eventDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.2)',
    paddingTop: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorTime: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalyticsDashboardScreen;
