/**
 * Error Screen Component
 * 
 * User-friendly error screen with recovery actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDebugInfo?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  onGoHome,
  showDebugInfo = __DEV__,
}) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {showDebugInfo && error && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugLabel}>Error Message:</Text>
          <Text style={styles.debugText}>{error.message}</Text>
          {error.stack && (
            <>
              <Text style={[styles.debugLabel, styles.debugLabelSpacing]}>
                Stack Trace:
              </Text>
              <Text style={styles.debugText}>{error.stack}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.actionsContainer}>
        {onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleGoHome}
          accessibilityRole="button"
          accessibilityLabel="Go to home screen"
        >
          <Text style={[styles.secondaryButtonText, isDark && styles.darkText]}>
            Go Home
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    iconContainer: {
      marginBottom: 24,
    },
    icon: {
      fontSize: 72,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#212529',
      marginBottom: 16,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: isDark ? '#b0b0b0' : '#6c757d',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
      maxWidth: 400,
    },
    debugContainer: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff3cd',
      borderRadius: 12,
      padding: 16,
      marginBottom: 32,
      width: '100%',
      maxWidth: 500,
    },
    debugTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffc107' : '#856404',
      marginBottom: 12,
    },
    debugLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffc107' : '#856404',
      marginBottom: 4,
    },
    debugLabelSpacing: {
      marginTop: 12,
    },
    debugText: {
      fontSize: 12,
      color: isDark ? '#d4a574' : '#856404',
      fontFamily: 'monospace',
      lineHeight: 18,
    },
    actionsContainer: {
      width: '100%',
      maxWidth: 400,
      gap: 12,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    primaryButton: {
      backgroundColor: '#007AFF',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: isDark ? 'transparent' : '#ffffff',
      borderWidth: 2,
      borderColor: isDark ? '#3a3a3a' : '#e1e5e9',
    },
    secondaryButtonText: {
      color: '#007AFF',
      fontSize: 16,
      fontWeight: '600',
    },
    darkText: {
      color: '#0A84FF',
    },
  });
