/**
 * Animated Button Component
 * Enhanced button with smooth press animations using Reanimated 3
 */

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { styles } from './styles';

interface AnimatedButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  mode = 'contained',
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  // Map Paper mode to our variant system
  const effectiveVariant =
    mode === 'contained' ? variant : mode === 'outlined' ? 'outline' : variant;

  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[size],
    styles[effectiveVariant],
    ...(disabled || loading ? [styles.disabled] : []),
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    styles[`${effectiveVariant}Text` as keyof typeof styles] as TextStyle,
    ...(disabled || loading ? [styles.disabledText] : []),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scale.value, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
      opacity: withTiming(pressed.value ? 0.8 : 1, {
        duration: 100,
      }),
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = 0.95;
      pressed.value = true;
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = 1;
      pressed.value = false;
    }
  };

  return (
    <AnimatedPressable
      style={[buttonStyle, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={effectiveVariant === 'primary' ? '#ffffff' : '#007AFF'}
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};

export default AnimatedButton;
