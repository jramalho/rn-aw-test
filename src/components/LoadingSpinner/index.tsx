/**
 * LoadingSpinner Component
 * Enhanced loading animations using Reanimated 3
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  type?: 'circular' | 'pulse' | 'bounce' | 'dots';
  style?: ViewStyle;
}

/**
 * Circular spinning loader
 */
const CircularSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.circular, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.circularInner, { borderColor: color, borderTopColor: 'transparent' }]} />
    </Animated.View>
  );
};

/**
 * Pulsing loader
 */
const PulseSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600, easing: Easing.ease }),
        withTiming(1, { duration: 600, easing: Easing.ease }),
      ),
      -1,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 600, easing: Easing.ease }),
        withTiming(1, { duration: 600, easing: Easing.ease }),
      ),
      -1,
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

/**
 * Bouncing loader
 */
const BounceSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-size * 0.6, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }),
      ),
      -1,
    );

    return () => {
      cancelAnimation(translateY);
    };
  }, [translateY, size]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bounce,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

/**
 * Three dots loader
 */
const DotsSpinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const dot1TranslateY = useSharedValue(0);
  const dot2TranslateY = useSharedValue(0);
  const dot3TranslateY = useSharedValue(0);

  useEffect(() => {
    const animateDot = (sharedValue: Animated.SharedValue<number>, delay: number) => {
      sharedValue.value = withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(-size * 0.5, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 900 - delay - 600 }),
        ),
        -1,
      );
    };

    animateDot(dot1TranslateY, 0);
    animateDot(dot2TranslateY, 150);
    animateDot(dot3TranslateY, 300);

    return () => {
      cancelAnimation(dot1TranslateY);
      cancelAnimation(dot2TranslateY);
      cancelAnimation(dot3TranslateY);
    };
  }, [dot1TranslateY, dot2TranslateY, dot3TranslateY, size]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1TranslateY.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2TranslateY.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3TranslateY.value }],
  }));

  const dotSize = size * 0.3;

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSize * 0.3,
          },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSize * 0.3,
          },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSize * 0.3,
          },
          dot3Style,
        ]}
      />
    </View>
  );
};

/**
 * Main LoadingSpinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#007AFF',
  type = 'circular',
  style,
}) => {
  const renderSpinner = () => {
    switch (type) {
      case 'circular':
        return <CircularSpinner size={size} color={color} />;
      case 'pulse':
        return <PulseSpinner size={size} color={color} />;
      case 'bounce':
        return <BounceSpinner size={size} color={color} />;
      case 'dots':
        return <DotsSpinner size={size} color={color} />;
      default:
        return <CircularSpinner size={size} color={color} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderSpinner()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circular: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 3,
  },
  pulse: {
    // Styles applied inline
  },
  bounce: {
    // Styles applied inline
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    // Styles applied inline
  },
});
