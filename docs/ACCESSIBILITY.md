# Accessibility Guide

## Overview

This project implements comprehensive accessibility features to ensure the Pokemon application is usable by all users, including those who rely on screen readers and assistive technologies.

## Accessibility Standards

The application follows **WCAG 2.1 Level AA** guidelines and React Native accessibility best practices.

## Implementation Details

### Components with Accessibility Support

#### 1. PokemonCard Component

**Features:**
- **Comprehensive accessibility labels**: Each Pokemon card includes the Pokemon's name, ID number, types, and key stats (HP, Attack, Defense)
- **Accessibility hints**: Provides guidance on what will happen when the user interacts with the card
- **Accessible images**: Pokemon sprites include descriptive labels and ignore color inversion for better image quality
- **Semantic roles**: Uses `button` role for proper screen reader announcement

**Example Screen Reader Output:**
```
"Pikachu, number 025, electric type. HP 35, Attack 55, Defense 40. Button. Double tap to view detailed information about this Pokémon"
```

#### 2. SearchBar Component

**Features:**
- **Input field labels**: Clear description of the search input purpose
- **Accessibility hints**: Explains how to use the search functionality
- **Accessibility values**: Current search text is announced to screen readers
- **Button roles**: Clear, Search, and Quick Action buttons all have proper roles and labels
- **Loading states**: Disabled states are properly communicated to assistive technologies
- **Touch targets**: Clear button has extended hit area (hitSlop) for easier interaction

**Key Accessibility Props:**
- Search input: "Search for Pokémon by name"
- Clear button: "Clear search" with hint "Double tap to clear the search field"
- Quick actions: Each Pokemon name is announced with "Quick search for [Pokemon]"

#### 3. TypeFilter Component

**Features:**
- **Scroll view labels**: Describes the horizontal scrollable type filter
- **Filter buttons**: Each type filter has a descriptive label and hint
- **Selected states**: Current selection is announced via `accessibilityState.selected`
- **Navigation hints**: Explains how to scroll and select different types

**Example Screen Reader Output:**
```
"Pokémon type filter. Scroll horizontally to view and select different Pokémon types"
"Fire type filter. Button. Selected. Double tap to show only fire type Pokémon"
```

#### 4. Button Component

**Features:**
- **Accessibility labels**: Uses the button title as the label
- **State communication**: Disabled and loading states are properly announced
- **Semantic role**: Uses `button` role for proper identification

### Testing

Comprehensive accessibility tests are implemented in `src/components/__tests__/Accessibility.test.tsx`:

**Test Coverage:**
- ✅ Accessibility labels for all interactive elements
- ✅ Accessibility hints for complex interactions
- ✅ Accessibility roles (button, input, etc.)
- ✅ Accessibility states (selected, disabled, loading)
- ✅ Accessibility values for dynamic content
- ✅ Image accessibility with proper labels
- ✅ Touch target sizes (hitSlop)
- ✅ Unique labels within lists
- ✅ Semantic hierarchy

**Running Accessibility Tests:**
```bash
npm test -- --testPathPattern=Accessibility
```

## Screen Reader Testing

### iOS VoiceOver

1. Enable VoiceOver: Settings → Accessibility → VoiceOver
2. Triple-click side button to toggle VoiceOver
3. Swipe right/left to navigate between elements
4. Double-tap to activate buttons

**Expected Behavior:**
- All Pokemon cards announce name, type, and stats
- Search bar provides clear input instructions
- Type filters announce selection state
- Navigation is logical and sequential

### Android TalkBack

1. Enable TalkBack: Settings → Accessibility → TalkBack
2. Swipe right/left to navigate
3. Double-tap to activate buttons

**Expected Behavior:**
- Similar to VoiceOver with Android-specific announcements
- All interactive elements are properly announced
- State changes are communicated clearly

## Best Practices Implemented

### 1. Descriptive Labels
- All interactive elements have clear, descriptive labels
- Labels include context (e.g., "Pikachu, number 025" instead of just "Pikachu")
- Multi-type Pokemon announce all types

### 2. Helpful Hints
- Complex interactions include hints explaining what will happen
- Hints use action-oriented language ("Double tap to...")
- Hints are concise and clear

### 3. Proper Roles
- Buttons use `accessibilityRole="button"`
- Text inputs have proper accessibility properties
- Images have descriptive alternative text

### 4. State Communication
- Selected items announce their selection state
- Disabled buttons communicate their disabled state
- Loading states prevent interaction and announce the loading status

### 5. Touch Targets
- Minimum touch target sizes follow platform guidelines
- Extended hit areas (hitSlop) for small interactive elements
- Adequate spacing between interactive elements

### 6. Image Accessibility
- Decorative images have empty accessibility labels
- Informative images have descriptive labels
- Images ignore color inversion when appropriate

### 7. Dynamic Content
- Search input announces current value
- State changes are communicated to screen readers
- Loading indicators are properly announced

## Future Enhancements

### Planned Accessibility Improvements

1. **Focus Management**
   - Automatic focus after navigation
   - Focus trap for modal dialogs
   - Skip navigation links

2. **Reduced Motion**
   - Respect system reduced motion preferences
   - Disable animations when reduced motion is enabled

3. **High Contrast Mode**
   - Support for high contrast themes
   - Improved color contrast ratios
   - Better text visibility

4. **Font Scaling**
   - Support for dynamic type/font scaling
   - Flexible layouts that adapt to larger text
   - Minimum font sizes for readability

5. **Keyboard Navigation**
   - Full keyboard navigation support
   - Visible focus indicators
   - Logical tab order

6. **ARIA Live Regions**
   - Announce important updates
   - Live regions for search results
   - Status updates for async operations

## Resources

### Official Documentation
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS VoiceOver Guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility/overview/voiceover/)
- [Android TalkBack Guidelines](https://support.google.com/accessibility/android/answer/6283677)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Testing Tools
- **iOS**: VoiceOver, Accessibility Inspector
- **Android**: TalkBack, Accessibility Scanner
- **React Native**: @testing-library/react-native

### Helpful Libraries
- [@react-native-community/hooks](https://github.com/react-native-community/hooks) - Accessibility hooks
- [react-native-accessibility-engine](https://github.com/FormidableLabs/react-native-accessibility-engine) - Testing utilities

## Contributing

When adding new components or features, please ensure:

1. All interactive elements have proper accessibility labels
2. Complex interactions include helpful hints
3. State changes are communicated to assistive technologies
4. Test with VoiceOver (iOS) and TalkBack (Android)
5. Add accessibility tests for new components
6. Follow the patterns established in existing components

## Questions or Issues?

If you encounter accessibility issues or have suggestions for improvements, please:
1. Open an issue on GitHub with the label "accessibility"
2. Include details about the screen reader and device you're using
3. Describe the expected vs. actual behavior
4. Include steps to reproduce the issue
