/**
 * Animation Hooks
 * Reusable animation utilities using Reanimated 3
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

/**
 * Fade in animation hook
 * @param duration - Animation duration in ms (default: 300)
 * @param delay - Delay before animation starts in ms (default: 0)
 */
export const useFadeIn = (duration = 300, delay = 0) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.ease),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

/**
 * Scale in animation hook
 * @param duration - Animation duration in ms (default: 300)
 * @param delay - Delay before animation starts in ms (default: 0)
 */
export const useScaleIn = (duration = 300, delay = 0) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 150,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

/**
 * Slide in from bottom animation hook
 * @param duration - Animation duration in ms (default: 400)
 * @param delay - Delay before animation starts in ms (default: 0)
 */
export const useSlideInBottom = (duration = 400, delay = 0) => {
  const translateY = useSharedValue(100);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

/**
 * Slide in from right animation hook
 * @param duration - Animation duration in ms (default: 400)
 * @param delay - Delay before animation starts in ms (default: 0)
 */
export const useSlideInRight = (duration = 400, delay = 0) => {
  const translateX = useSharedValue(100);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return animatedStyle;
};

/**
 * Bounce animation hook - creates a subtle bounce effect
 * @param trigger - Changes to this value will trigger the bounce
 */
export const useBounce = (trigger?: any) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withSpring(1, {
        damping: 10,
        stiffness: 200,
      })
    );
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

/**
 * Shake animation hook - useful for error states
 * @param trigger - Changes to this value will trigger the shake
 */
export const useShake = (trigger?: any) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return animatedStyle;
};

/**
 * Combined fade and slide in animation
 * @param duration - Animation duration in ms (default: 400)
 * @param delay - Delay before animation starts in ms (default: 0)
 */
export const useFadeSlideIn = (duration = 400, delay = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.ease),
      })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

/**
 * Staggered list item animation
 * @param index - Item index in the list
 * @param baseDelay - Base delay in ms (default: 0)
 * @param staggerDelay - Delay between items in ms (default: 50)
 */
export const useStaggeredAnimation = (
  index: number,
  baseDelay = 0,
  staggerDelay = 50
) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const delay = baseDelay + index * staggerDelay;

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 15,
        stiffness: 100,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

/**
 * Pulse animation hook - continuous pulsing effect
 * @param duration - Duration of one pulse cycle in ms (default: 1000)
 */
export const usePulse = (duration = 1000) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Create an infinite loop of scaling
    const animate = () => {
      scale.value = withSequence(
        withTiming(1.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      );
    };

    // Start the animation
    animate();

    // Repeat every duration milliseconds
    const interval = setInterval(animate, duration);

    return () => clearInterval(interval);
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};
