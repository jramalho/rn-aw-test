/**
 * SwipeableListItem Component
 * List item with swipe-to-delete and swipe actions using Reanimated 3
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

export interface SwipeAction {
  text: string;
  color: string;
  icon?: string;
  onPress: () => void;
}

export interface SwipeableListItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeableWillOpen?: (direction: 'left' | 'right') => void;
  onSwipeableWillClose?: () => void;
  enabled?: boolean;
  friction?: number;
  overshootFriction?: number;
  style?: any;
}

type AnimatedGHContext = {
  startX: number;
};

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeableWillOpen,
  onSwipeableWillClose,
  enabled = true,
  friction = 1,
  overshootFriction = 8,
  style,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(100);

  const maxLeftSwipe = leftActions.length * ACTION_WIDTH;
  const maxRightSwipe = -rightActions.length * ACTION_WIDTH;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    itemHeight.value = event.nativeEvent.layout.height;
  }, [itemHeight]);

  const handleSwipeOpen = useCallback((direction: 'left' | 'right') => {
    onSwipeableWillOpen?.(direction);
  }, [onSwipeableWillOpen]);

  const handleSwipeClose = useCallback(() => {
    onSwipeableWillClose?.();
  }, [onSwipeableWillClose]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    AnimatedGHContext
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (!enabled) return;

      const newTranslateX = context.startX + event.translationX;

      // Apply friction when overswiping
      if (newTranslateX > maxLeftSwipe) {
        const overshoot = newTranslateX - maxLeftSwipe;
        translateX.value = maxLeftSwipe + overshoot / overshootFriction;
      } else if (newTranslateX < maxRightSwipe) {
        const overshoot = maxRightSwipe - newTranslateX;
        translateX.value = maxRightSwipe - overshoot / overshootFriction;
      } else {
        translateX.value = newTranslateX / friction;
      }
    },
    onEnd: (event) => {
      if (!enabled) {
        translateX.value = withSpring(0);
        return;
      }

      const velocity = event.velocityX;
      const shouldOpenLeft = 
        translateX.value > SWIPE_THRESHOLD || 
        (velocity > 500 && translateX.value > 20);
      const shouldOpenRight = 
        translateX.value < -SWIPE_THRESHOLD || 
        (velocity < -500 && translateX.value < -20);

      if (shouldOpenLeft && leftActions.length > 0) {
        translateX.value = withSpring(maxLeftSwipe, {
          velocity: velocity / 1000,
        });
        runOnJS(handleSwipeOpen)('left');
      } else if (shouldOpenRight && rightActions.length > 0) {
        translateX.value = withSpring(maxRightSwipe, {
          velocity: velocity / 1000,
        });
        runOnJS(handleSwipeOpen)('right');
      } else {
        translateX.value = withSpring(0);
        runOnJS(handleSwipeClose)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleActionPress = useCallback(
    (action: SwipeAction) => {
      // Close the swipeable before executing action
      translateX.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        action.onPress();
      }, 250);
    },
    [translateX],
  );

  const renderActions = useCallback(
    (actions: SwipeAction[], side: 'left' | 'right') => {
      return actions.map((action, index) => {
        const animatedActionStyle = useAnimatedStyle(() => {
          const isLeft = side === 'left';
          const inputRange = isLeft
            ? [0, maxLeftSwipe]
            : [maxRightSwipe, 0];
          
          const scale = interpolate(
            translateX.value,
            inputRange,
            [0.5, 1],
            Extrapolate.CLAMP,
          );

          const opacity = interpolate(
            translateX.value,
            inputRange,
            [0, 1],
            Extrapolate.CLAMP,
          );

          return {
            transform: [{ scale }],
            opacity,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.actionContainer,
              {
                backgroundColor: action.color,
                width: ACTION_WIDTH,
              },
              animatedActionStyle,
            ]}
          >
            <Pressable
              style={styles.actionButton}
              onPress={() => handleActionPress(action)}
            >
              {action.icon && (
                <Text style={styles.actionIcon}>{action.icon}</Text>
              )}
              <Text style={styles.actionText}>{action.text}</Text>
            </Pressable>
          </Animated.View>
        );
      });
    },
    [translateX, maxLeftSwipe, maxRightSwipe, handleActionPress],
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.leftActions]}>
          {renderActions(leftActions, 'left')}
        </View>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.rightActions]}>
          {renderActions(rightActions, 'right')}
        </View>
      )}

      {/* Swipeable Content */}
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={enabled}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftActions: {
    left: 0,
  },
  rightActions: {
    right: 0,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
  },
});
