/**
 * Animated Card Component
 * Wrapper for Card component with entrance animations
 */

import React from 'react';
import Animated from 'react-native-reanimated';
import { ViewStyle } from 'react-native';
import Card from '../Card';
import { useFadeSlideIn } from '../../hooks/useAnimations';

interface AnimatedCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  /**
   * Delay before animation starts (ms)
   */
  delay?: number;
  /**
   * Animation duration (ms)
   */
  duration?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  delay = 0,
  duration = 400,
  children,
  style,
}) => {
  const animatedStyle = useFadeSlideIn(duration, delay);

  return (
    <Animated.View style={animatedStyle}>
      <Card style={style}>{children}</Card>
    </Animated.View>
  );
};

export default AnimatedCard;
