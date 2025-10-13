/**
 * OfflineIndicator Component
 * Displays a banner when the device is offline
 */

import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useNetwork } from '../../hooks/useNetwork';
import { styles } from './styles';

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

export default OfflineIndicator;
