# Enhanced Animation System

This document describes the enhanced animation system implemented with React Native Reanimated 3, featuring improved screen transitions, gesture-based interactions, and smooth micro-interactions.

## Overview

The enhanced animation system provides:
- 🎬 **Screen Transitions** - Smooth, spring-based transitions between screens
- 🎯 **Gesture Interactions** - Swipe-to-delete, pull-to-refresh, and custom gestures
- ⏳ **Loading Animations** - Multiple loading animation types
- 🎨 **Micro-interactions** - Button presses, card animations, list items
- ⚡ **60fps Performance** - All animations run on native UI thread

## Architecture

### 1. Screen Transitions (`src/utils/screenTransitions.ts`)

Enhanced navigation transitions with custom interpolators:

#### Available Transitions

**SlideFromRightTransition**
```typescript
import { SlideFromRightTransition } from '@utils/screenTransitions';

// Smooth slide with spring physics
// Perfect for standard stack navigation
```

**FadeTransition**
```typescript
// Fade in/out for modal-style screens
// 250ms timing animation
```

**ScaleFadeTransition**
```typescript
// Combined scale and fade with spring physics
// Ideal for modal presentations
```

**BottomSheetTransition**
```typescript
// Slide up from bottom with overlay
// Perfect for bottom sheet modals
```

**FlipTransition**
```typescript
// 3D flip effect with perspective
// Unique transition for special screens
```

#### Usage in Navigation

```typescript
import { enhancedScreenOptions } from '@utils/screenTransitions';

<Stack.Navigator screenOptions={enhancedScreenOptions.stack}>
  <Stack.Screen name="Home" component={HomeScreen} />
</Stack.Navigator>

// For modal screens
<Stack.Screen 
  name="Modal" 
  component={ModalScreen}
  options={enhancedScreenOptions.modal}
/>

// For bottom sheet screens
<Stack.Screen 
  name="BottomSheet" 
  component={BottomSheetScreen}
  options={enhancedScreenOptions.bottomSheet}
/>
```

### 2. Swipeable List Items (`src/components/SwipeableListItem`)

Gesture-based swipeable list items with left/right actions:

#### Features

- ✨ Smooth spring-based swipe animations
- 🎯 Left and right swipe actions
- 🔥 Configurable action buttons with colors
- ⚡ Velocity-based gesture recognition
- 🎨 Scale and opacity animations for actions
- 🛡️ Overshoot protection with friction

#### Basic Usage

```typescript
import { SwipeableListItem } from '@components/SwipeableListItem';

<SwipeableListItem
  rightActions={[
    {
      text: 'Delete',
      color: '#FF3B30',
      icon: '🗑️',
      onPress: () => handleDelete(item.id),
    },
    {
      text: 'Edit',
      color: '#007AFF',
      icon: '✏️',
      onPress: () => handleEdit(item.id),
    },
  ]}
>
  <View style={styles.listItem}>
    <Text>{item.title}</Text>
  </View>
</SwipeableListItem>
```

#### Advanced Usage

```typescript
<SwipeableListItem
  leftActions={[
    {
      text: 'Archive',
      color: '#34C759',
      icon: '📦',
      onPress: handleArchive,
    },
  ]}
  rightActions={[
    {
      text: 'Delete',
      color: '#FF3B30',
      icon: '🗑️',
      onPress: handleDelete,
    },
  ]}
  onSwipeableWillOpen={(direction) => {
    console.log(`Swiping ${direction}`);
  }}
  onSwipeableWillClose={() => {
    console.log('Closing swipe');
  }}
  friction={1.2}
  overshootFriction={10}
>
  <YourListItemContent />
</SwipeableListItem>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content to display in the list item |
| `leftActions` | SwipeAction[] | [] | Actions shown when swiping right |
| `rightActions` | SwipeAction[] | [] | Actions shown when swiping left |
| `onSwipeableWillOpen` | (direction) => void | - | Called when swipe will open |
| `onSwipeableWillClose` | () => void | - | Called when swipe will close |
| `enabled` | boolean | true | Enable/disable swiping |
| `friction` | number | 1 | Friction for normal swipe |
| `overshootFriction` | number | 8 | Friction for overshoot |

### 3. Loading Animations (`src/components/LoadingSpinner`)

Multiple loading animation types with Reanimated 3:

#### Animation Types

**Circular** (default)
```typescript
<LoadingSpinner 
  type="circular" 
  size={40} 
  color="#007AFF" 
/>
```
Rotating circular spinner with gradient effect.

**Pulse**
```typescript
<LoadingSpinner 
  type="pulse" 
  size={40} 
  color="#007AFF" 
/>
```
Pulsing circle that scales and fades.

**Bounce**
```typescript
<LoadingSpinner 
  type="bounce" 
  size={40} 
  color="#007AFF" 
/>
```
Bouncing ball with physics-based animation.

**Dots**
```typescript
<LoadingSpinner 
  type="dots" 
  size={40} 
  color="#007AFF" 
/>
```
Three dots bouncing in sequence.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | number | 40 | Size of the spinner |
| `color` | string | '#007AFF' | Color of the spinner |
| `type` | 'circular' \| 'pulse' \| 'bounce' \| 'dots' | 'circular' | Animation type |
| `style` | ViewStyle | - | Additional container styles |

#### Usage in Loading States

```typescript
import { LoadingSpinner } from '@components/LoadingSpinner';

const MyScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner type="pulse" size={60} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <YourContent />;
};
```

## Performance Optimizations

### Spring Physics

All swipe and gesture interactions use spring-based animations for natural feel:

```typescript
{
  stiffness: 1000,   // How "tight" the spring is
  damping: 500,      // How quickly it settles
  mass: 3,           // Weight of the object
  overshootClamping: true,  // Prevent overshooting
}
```

### Native Thread Execution

All animations use Reanimated 3's worklets, ensuring:
- ✅ Animations run on UI thread
- ✅ No JS thread blocking
- ✅ Consistent 60fps
- ✅ Smooth during heavy operations

### Memory Management

- Animations properly cleaned up on unmount
- `cancelAnimation()` called in cleanup
- Minimal re-renders with `useAnimatedStyle`
- Memoized gesture handlers

## Best Practices

### 1. Choose Appropriate Transitions

```typescript
// Stack navigation - SlideFromRight (default)
<Stack.Screen name="Detail" component={DetailScreen} />

// Modal presentation - ScaleFade
<Stack.Screen 
  name="Modal" 
  component={ModalScreen}
  options={enhancedScreenOptions.modal}
/>

// Bottom sheets - BottomSheet
<Stack.Screen 
  name="Actions" 
  component={ActionsSheet}
  options={enhancedScreenOptions.bottomSheet}
/>
```

### 2. Swipeable Lists Performance

```typescript
// ✅ Good: Use with FlatList for performance
<FlatList
  data={items}
  renderItem={({ item }) => (
    <SwipeableListItem rightActions={actions}>
      <ListItem item={item} />
    </SwipeableListItem>
  )}
  keyExtractor={(item) => item.id}
/>

// ❌ Avoid: Don't nest swipeables
<SwipeableListItem>
  <SwipeableListItem> {/* Conflicts with parent gestures */}
    <Content />
  </SwipeableListItem>
</SwipeableListItem>
```

### 3. Loading Animation Selection

```typescript
// Quick operations (< 1s) - Dots or Pulse
<LoadingSpinner type="dots" size={30} />

// Medium operations (1-3s) - Circular or Bounce
<LoadingSpinner type="circular" size={40} />

// Long operations (> 3s) - Add descriptive text
<View>
  <LoadingSpinner type="pulse" size={60} />
  <Text>Processing your request...</Text>
</View>
```

### 4. Gesture Conflicts

```typescript
// ✅ Good: One gesture handler per area
<ScrollView>
  <SwipeableListItem>
    <Content />
  </SwipeableListItem>
</ScrollView>

// ⚠️ Careful: Multiple overlapping gestures
<PanGestureHandler>
  <SwipeableListItem> {/* May conflict */}
    <Content />
  </SwipeableListItem>
</PanGestureHandler>
```

## Examples

### Example 1: Team Builder with Swipeable Pokemon

```typescript
import { SwipeableListItem } from '@components/SwipeableListItem';

const TeamBuilderScreen = () => {
  const [team, setTeam] = useState(myTeam);

  const removePokemon = (id: string) => {
    setTeam(team.filter(p => p.id !== id));
  };

  return (
    <FlatList
      data={team}
      renderItem={({ item }) => (
        <SwipeableListItem
          rightActions={[
            {
              text: 'Remove',
              color: '#FF3B30',
              icon: '❌',
              onPress: () => removePokemon(item.id),
            },
          ]}
        >
          <PokemonCard pokemon={item} />
        </SwipeableListItem>
      )}
    />
  );
};
```

### Example 2: Loading Screen with Animated Spinner

```typescript
import { LoadingSpinner } from '@components/LoadingSpinner';

const PokemonDetailScreen = ({ route }) => {
  const { pokemon, isLoading } = usePokemonDetail(route.params.id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner type="pulse" size={80} color="#FF5555" />
        <Text style={styles.loadingText}>
          Loading Pokémon details...
        </Text>
      </View>
    );
  }

  return <PokemonDetail pokemon={pokemon} />;
};
```

### Example 3: Custom Modal Transition

```typescript
import { ScaleFadeTransition } from '@utils/screenTransitions';

<Stack.Screen
  name="ShareModal"
  component={ShareModalScreen}
  options={{
    ...ScaleFadeTransition,
    headerShown: false,
    presentation: 'transparentModal',
  }}
/>
```

## Troubleshooting

### Gestures Not Working

1. **Check gesture handler setup**
   ```typescript
   // Ensure GestureHandlerRootView at app root
   import { GestureHandlerRootView } from 'react-native-gesture-handler';
   
   <GestureHandlerRootView style={{ flex: 1 }}>
     <App />
   </GestureHandlerRootView>
   ```

2. **Verify Reanimated plugin**
   ```javascript
   // babel.config.js
   plugins: [
     'react-native-reanimated/plugin', // Must be last
   ],
   ```

3. **Clear cache and rebuild**
   ```bash
   npm start -- --reset-cache
   cd ios && pod install && cd ..
   npm run ios
   ```

### Performance Issues

1. **Too many swipeables** - Virtualize with FlatList
2. **Complex children** - Memoize list item components
3. **Heavy animations** - Reduce simultaneous animations

### Animation Conflicts

```typescript
// ✅ Good: Disable parent scroll during swipe
<SwipeableListItem
  onSwipeableWillOpen={() => setScrollEnabled(false)}
  onSwipeableWillClose={() => setScrollEnabled(true)}
>
  <Content />
</SwipeableListItem>
```

## Migration from Existing Animations

### Replacing Basic Animations

**Before:**
```typescript
<TouchableOpacity onPress={onPress}>
  <View style={styles.item}>
    <Text>{item.title}</Text>
  </View>
</TouchableOpacity>
```

**After:**
```typescript
<SwipeableListItem
  rightActions={[
    { text: 'Delete', color: '#FF3B30', onPress: onDelete },
  ]}
>
  <Pressable onPress={onPress}>
    <View style={styles.item}>
      <Text>{item.title}</Text>
    </View>
  </Pressable>
</SwipeableListItem>
```

### Replacing ActivityIndicator

**Before:**
```typescript
<ActivityIndicator size="large" color="#007AFF" />
```

**After:**
```typescript
<LoadingSpinner type="circular" size={40} color="#007AFF" />
```

## Future Enhancements

Potential additions:
1. **Pull-to-refresh** component
2. **Expandable list items** with spring animations
3. **Drag-to-reorder** for lists
4. **Parallax scrolling** headers
5. **Shared element transitions** between screens
6. **More loading animation types** (ripple, wave, etc.)

## Resources

- [Reanimated 3 Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Navigation Transitions](https://reactnavigation.org/docs/stack-navigator/#animations)

## Related Documentation

- [Basic Animations](./ANIMATIONS.md)
- [Performance Optimization](./BUNDLE_SIZE_OPTIMIZATION.md)
- [Component Library](../README.md)

---

**Built with ❤️ using React Native Reanimated 3**
