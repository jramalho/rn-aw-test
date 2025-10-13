/**
 * OfflineIndicator Component
 * Displays a banner when the device is offline
 */

import React from 'react';
import { StyleSheet, Text, Animated } from 'react-native';
import { useNetwork } from '../hooks/useNetwork';

export interface OfflineIndicatorProps {
  /**
   * Whether to show the indicator at the top (true) or bottom (false)
   * @default true
   */
  position?: 'top' | 'bottom';

  /**
   * Background color of the indicator
   * @default '#f44336'
   */
  backgroundColor?: string;

  /**
   * Text color
   * @default '#ffffff'
   */
  textColor?: string;

  /**
   * Custom message to display
   * @default 'No internet connection'
   */
  message?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  backgroundColor = '#f44336',
  textColor = '#ffffff',
  message = 'No internet connection',
}) => {
  const { isOffline } = useNetwork();
  const [slideAnim] = React.useState(new Animated.Value(isOffline ? 0 : -50));

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
        { backgroundColor },
        {
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OfflineIndicator;
