import { StyleSheet } from 'react-native';

export const createStyles = (isDark: boolean) =>
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
