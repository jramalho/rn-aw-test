/**
 * Enhanced Screen Transitions
 * Custom transition animations for React Navigation using Reanimated 3
 */

import { TransitionPresets } from '@react-navigation/stack';
import type { StackCardInterpolationProps } from '@react-navigation/stack';
import { Platform } from 'react-native';

/**
 * Smooth slide transition from right with enhanced timing
 */
export const SlideFromRightTransition = {
  ...TransitionPresets.SlideFromRightIOS,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
};

/**
 * Fade transition for modal-style screens
 */
export const FadeTransition = {
  gestureDirection: 'vertical' as const,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
  },
  cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

/**
 * Scale transition with fade for modal screens
 */
export const ScaleFadeTransition = {
  gestureDirection: 'vertical' as const,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height * 0.1, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

/**
 * Bottom sheet style transition
 */
export const BottomSheetTransition = {
  gestureDirection: 'vertical' as const,
  gestureEnabled: true,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 400,
        damping: 40,
        mass: 1,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 400,
        damping: 40,
        mass: 1,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

/**
 * Horizontal flip transition
 */
export const FlipTransition = {
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 200,
        damping: 25,
        mass: 1,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 200,
        damping: 25,
        mass: 1,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        backfaceVisibility: 'hidden',
        transform: [
          {
            perspective: 1000,
          },
          {
            rotateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['-90deg', '0deg'],
            }),
          },
        ],
      },
    };
  },
};

/**
 * Get default transition based on platform and screen type
 */
export const getDefaultTransition = (screenType: 'stack' | 'modal' | 'bottomSheet' = 'stack') => {
  if (screenType === 'modal') {
    return Platform.OS === 'ios' 
      ? TransitionPresets.ModalPresentationIOS 
      : ScaleFadeTransition;
  }
  
  if (screenType === 'bottomSheet') {
    return BottomSheetTransition;
  }
  
  return Platform.OS === 'ios'
    ? SlideFromRightTransition
    : TransitionPresets.FadeFromBottomAndroid;
};

/**
 * Navigation screen options with enhanced transitions
 */
export const enhancedScreenOptions = {
  stack: {
    ...SlideFromRightTransition,
    headerShown: true,
    headerStyle: {
      backgroundColor: '#007AFF',
    },
    headerTintColor: '#ffffff',
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
    gestureEnabled: true,
    gestureResponseDistance: 50,
  },
  modal: {
    ...ScaleFadeTransition,
    headerShown: false,
    presentation: 'transparentModal' as const,
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
  bottomSheet: {
    ...BottomSheetTransition,
    headerShown: false,
    presentation: 'transparentModal' as const,
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
};
