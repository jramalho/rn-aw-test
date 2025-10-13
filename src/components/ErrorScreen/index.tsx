/**
 * Error Screen Component
 *
 * User-friendly error screen with recovery actions
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from './styles';

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

export default ErrorScreen;
