# Enhanced Animations with Reanimated 3

This document describes the enhanced animation system built with React Native Reanimated 3, showcasing smooth micro-interactions and entrance animations for better user experience.

## Overview

The animation system provides:
- 🎨 **Reusable Animation Hooks** - Pre-built animation patterns
- 🎭 **Animated Components** - Enhanced UI components with built-in animations
- ⚡ **Performance** - 60fps animations using native threads
- 🎯 **Simple API** - Easy to use hooks and components

## Architecture

### Animation Hooks (`src/hooks/useAnimations.ts`)

Reusable animation hooks built on Reanimated 3:

#### Entrance Animations

```typescript
// Fade in animation
const fadeInStyle = useFadeIn(duration, delay);

// Scale in animation
const scaleInStyle = useScaleIn(duration, delay);

// Slide in from bottom
const slideInStyle = useSlideInBottom(duration, delay);

// Slide in from right
const slideInRightStyle = useSlideInRight(duration, delay);

// Combined fade and slide
const fadeSlideStyle = useFadeSlideIn(duration, delay);
```

#### Interactive Animations

```typescript
// Bounce effect (triggered by state changes)
const bounceStyle = useBounce(trigger);

// Shake effect (e.g., for errors)
const shakeStyle = useShake(trigger);

// Continuous pulse
const pulseStyle = usePulse(duration);
```

#### List Animations

```typescript
// Staggered list item animations
const staggeredStyle = useStaggeredAnimation(
  index,       // Item index
  baseDelay,   // Base delay in ms
  staggerDelay // Delay between items in ms
);
```

### Animated Components

#### AnimatedButton

Enhanced button with press animations:

```typescript
import { AnimatedButton } from '@components';

<AnimatedButton
  title="Press Me"
  variant="primary"
  size="medium"
  onPress={handlePress}
/>
```

Features:
- Spring-based scale animation on press
- Smooth opacity transitions
- Compatible with existing Button props
- 60fps performance

#### AnimatedCard

Card component with entrance animations:

```typescript
import { AnimatedCard } from '@components';

<AnimatedCard
  delay={200}      // Delay before animation starts
  duration={400}   // Animation duration
  style={styles.card}
>
  <Card.Content>
    <Text>Animated content</Text>
  </Card.Content>
</AnimatedCard>
```

Features:
- Fade and slide entrance animation
- Configurable delay for staggered effects
- Wraps standard Card component

## Usage Examples

### Basic Entrance Animation

```typescript
import React from 'react';
import Animated from 'react-native-reanimated';
import { useFadeSlideIn } from '@hooks/useAnimations';

const MyComponent = () => {
  const animatedStyle = useFadeSlideIn(400, 0);

  return (
    <Animated.View style={animatedStyle}>
      <Text>This content fades and slides in!</Text>
    </Animated.View>
  );
};
```

### Staggered List

```typescript
import React from 'react';
import Animated from 'react-native-reanimated';
import { useStaggeredAnimation } from '@hooks/useAnimations';

const ListItem = ({ item, index }) => {
  const animatedStyle = useStaggeredAnimation(index, 0, 100);

  return (
    <Animated.View style={animatedStyle}>
      <Text>{item.name}</Text>
    </Animated.View>
  );
};

const MyList = ({ items }) => (
  <FlatList
    data={items}
    renderItem={({ item, index }) => (
      <ListItem item={item} index={index} />
    )}
  />
);
```

### Interactive Animations

```typescript
import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import { useBounce, useShake } from '@hooks/useAnimations';
import { AnimatedButton } from '@components';

const InteractiveDemo = () => {
  const [bounceKey, setBounceKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const bounceStyle = useBounce(bounceKey);
  const shakeStyle = useShake(shakeKey);

  return (
    <View>
      <AnimatedButton
        title="Trigger Bounce"
        onPress={() => setBounceKey(k => k + 1)}
      />
      <Animated.View style={bounceStyle}>
        <Text>🎈</Text>
      </Animated.View>

      <AnimatedButton
        title="Trigger Shake"
        onPress={() => setShakeKey(k => k + 1)}
      />
      <Animated.View style={shakeStyle}>
        <Text>📱</Text>
      </Animated.View>
    </View>
  );
};
```

### Continuous Animations

```typescript
import React from 'react';
import Animated from 'react-native-reanimated';
import { usePulse } from '@hooks/useAnimations';

const PulsingHeart = () => {
  const pulseStyle = usePulse(1500); // 1.5s pulse cycle

  return (
    <Animated.View style={pulseStyle}>
      <Text style={{ fontSize: 48 }}>💓</Text>
    </Animated.View>
  );
};
```

## Demo Screen

Access the animations demo from:
**Settings → Animations Demo**

The demo showcases:
- All animation hooks with live examples
- Interactive triggers
- Staggered list animations
- Continuous animations
- Animated components

## Performance

All animations use React Native Reanimated 3 which:
- Runs on the native UI thread (not JS thread)
- Maintains 60fps even during heavy JS operations
- Uses worklets for native performance
- Supports gesture-based animations

## Best Practices

### 1. Use Appropriate Animation Types

- **Entrance animations**: Fade, scale, slide for screen/component entry
- **Interactive animations**: Bounce, shake for user feedback
- **Continuous animations**: Pulse for loading states or attention
- **Staggered animations**: Lists and card grids

### 2. Choose Reasonable Durations

- **Quick interactions**: 100-300ms (button presses, toggles)
- **Standard animations**: 300-500ms (screen transitions, cards)
- **Emphasis animations**: 500-800ms (large movements, important UI)

### 3. Optimize for Performance

```typescript
// ✅ Good: Memoize animation hooks outside of render
const animatedStyle = useFadeIn(300);

// ❌ Avoid: Creating new animations on every render
const animatedStyle = useFadeIn(Math.random() * 1000);
```

### 4. Use Springs for Natural Feel

Springs provide more natural, physics-based motion compared to linear timing:

```typescript
// Springs are built into hooks like useBounce and useScaleIn
const scaleStyle = useScaleIn(300, 0);
// Uses spring animation internally
```

### 5. Stagger List Items Carefully

```typescript
// Good: Moderate stagger (50-100ms between items)
const animatedStyle = useStaggeredAnimation(index, 0, 80);

// Avoid: Too much stagger on long lists
// (delays become noticeable)
```

## Configuration

### Babel Configuration

Reanimated 3 plugin is already configured in `babel.config.js`:

```javascript
plugins: [
  // ... other plugins
  'react-native-reanimated/plugin', // Must be last
],
```

### TypeScript

All hooks and components are fully typed. Import types from components:

```typescript
import type { AnimatedCardProps } from '@components/AnimatedCard';
```

## Troubleshooting

### Animations Not Working

1. **Check Babel plugin order**: `react-native-reanimated/plugin` must be last
2. **Clear Metro cache**: `npm start -- --reset-cache`
3. **Rebuild app**: Babel changes require a full rebuild

### Performance Issues

1. **Avoid animating expensive operations** (complex calculations, large lists)
2. **Use `useAnimatedStyle`** instead of inline styles
3. **Memoize animation values** to prevent recreation

### Type Errors

Ensure you're using the correct imports:

```typescript
// ✅ Correct
import Animated from 'react-native-reanimated';
import { useFadeIn } from '@hooks/useAnimations';

// ❌ Wrong
import { Animated } from 'react-native';
```

## Future Enhancements

Potential additions to the animation system:

1. **Gesture-based animations** - Swipe, drag, pinch gestures
2. **Shared element transitions** - Smooth transitions between screens
3. **Layout animations** - Automatic animations for layout changes
4. **More animation hooks** - Rotate, flip, elastic, etc.
5. **Animation presets** - Pre-configured animation sets for common patterns

## Resources

- [React Native Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [Reanimated 3 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary)
- [Animation Best Practices](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation)

## Related Documentation

- [Performance Optimization](./BUNDLE_SIZE_OPTIMIZATION.md)
- [Component Library](../src/components/README.md)
- [Custom TurboModules](./CUSTOM_TURBOMODULE.md)

---

**Built with ❤️ using React Native Reanimated 3**
