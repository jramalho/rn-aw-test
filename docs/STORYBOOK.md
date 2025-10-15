# Storybook Integration

## Overview

This project includes Storybook for React Native, providing an interactive component playground for developing, testing, and documenting UI components in isolation.

## What is Storybook?

Storybook is a development environment and UI component explorer for building, testing, and documenting components independently from your main application. It allows you to:

- **Develop components in isolation** - Build and test components without running the full app
- **View component variations** - See all states and props of your components
- **Interactive controls** - Modify props in real-time to see how components behave
- **Documentation** - Auto-generate documentation from your component stories
- **Visual testing** - Ensure components look correct across different scenarios

## Features

### On-Device Addons

- **Controls** - Dynamically interact with component args (props)
- **Actions** - Display data received by event handlers
- **Backgrounds** - Switch background colors to test component appearance
- **Notes** - Add additional documentation and notes to stories

## Getting Started

### Prerequisites

Ensure all project dependencies are installed:

```bash
npm install
```

### Running Storybook

You have two options to run Storybook:

#### Option 1: Toggle in `index.js` (Recommended for Development)

1. Open `index.js` in the project root
2. Change `LOAD_STORYBOOK` to `true`:
   ```javascript
   const LOAD_STORYBOOK = true;
   ```
3. Run the app normally:
   ```bash
   npm run ios
   # or
   npm run android
   ```

#### Option 2: Use Storybook Scripts

```bash
# Generate story files and start metro
npm run storybook

# Run on iOS
npm run storybook:ios

# Run on Android
npm run storybook:android
```

**Note:** When using Option 1, remember to set `LOAD_STORYBOOK` back to `false` when you want to run the main app.

## Project Structure

```
.storybook/
├── main.ts                    # Main Storybook configuration
├── preview.tsx                # Global decorators and parameters
├── Storybook.tsx              # Storybook UI entry point
└── storybook.requires.ts      # Auto-generated story imports

src/components/
├── Button/
│   ├── index.tsx
│   ├── styles.ts
│   └── Button.stories.tsx     # Button component stories
├── Card/
│   ├── index.tsx
│   ├── styles.ts
│   └── Card.stories.tsx       # Card component stories
└── TextInput/
    ├── index.tsx
    ├── styles.ts
    └── TextInput.stories.tsx  # TextInput component stories
```

## Writing Stories

### Basic Story Structure

Stories are written using the Component Story Format (CSF). Here's a simple example:

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import Button from './index';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    title: 'Button',
    variant: 'primary',
    onPress: () => console.log('Pressed'),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    disabled: true,
  },
};
```

### Story Best Practices

1. **One component per file** - Keep stories focused on a single component
2. **Name stories descriptively** - Use clear names like `Primary`, `Disabled`, `WithIcon`
3. **Use argTypes for controls** - Define interactive controls for component props
4. **Provide default args** - Set sensible default values in the meta object
5. **Group related stories** - Use the `title` field to organize stories (e.g., `Components/Button`)

### Advanced Story Patterns

#### Stories with State

```typescript
export const WithState: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <TextInput
        label="Controlled Input"
        value={value}
        onChangeText={setValue}
      />
    );
  },
};
```

#### Stories with Multiple Components

```typescript
export const FormExample: Story = {
  render: () => (
    <View>
      <TextInput label="Username" />
      <TextInput label="Password" secureTextEntry />
      <Button title="Submit" variant="primary" />
    </View>
  ),
};
```

#### Stories with Custom Decorators

```typescript
const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;
```

## Available Components

Currently documented components:

- **Button** - Primary, secondary, and outline button variants with different sizes
- **Card** - Flexible card component with title and content sections
- **TextInput** - Text input with label, error states, and helper text

## Adding New Stories

To add stories for a new component:

1. Create a `ComponentName.stories.tsx` file in the component's directory
2. Import the component and necessary types
3. Define the meta object with component metadata
4. Create story variations as named exports
5. Update `.storybook/storybook.requires.ts` to include your new story:

```typescript
const getStories = () => {
  return [
    require('../src/components/Button/Button.stories.tsx'),
    require('../src/components/Card/Card.stories.tsx'),
    require('../src/components/TextInput/TextInput.stories.tsx'),
    require('../src/components/YourComponent/YourComponent.stories.tsx'), // Add here
  ];
};
```

## Controls and Interactions

Storybook provides interactive controls for modifying component props in real-time:

- **Text** - For string props
- **Boolean** - For true/false props
- **Number** - For numeric props with sliders or inputs
- **Select** - For enum/union types
- **Radio** - For choosing between limited options
- **Object** - For complex object props
- **Array** - For array props

Example with multiple control types:

```typescript
argTypes: {
  title: {
    control: 'text',
  },
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
  },
  size: {
    control: 'radio',
    options: ['small', 'medium', 'large'],
  },
  disabled: {
    control: 'boolean',
  },
},
```

## Background Addon

Test components against different backgrounds:

- **plain** - Light gray background (#f5f5f5)
- **warm** - Warm background (#fff5eb)
- **cool** - Cool background (#e6f7ff)
- **dark** - Dark background (#1a1a1a)

Switch backgrounds using the Backgrounds addon in the Storybook toolbar.

## Actions Addon

The Actions addon displays data received by event handlers. Any function prop will automatically log its arguments when called:

```typescript
export const WithActions: Story = {
  args: {
    onPress: action('pressed'),
    onLongPress: action('long-pressed'),
  },
};
```

## Troubleshooting

### Stories not loading

If your stories aren't appearing:

1. Check that `LOAD_STORYBOOK` is set to `true` in `index.js`
2. Verify the story file follows the naming pattern `*.stories.tsx`
3. Ensure the story is imported in `.storybook/storybook.requires.ts`
4. Try clearing the Metro cache: `npm run start:reset`

### Metro bundler errors

If you encounter bundler errors:

```bash
# Clear Metro cache
npm run start:reset

# Clean and rebuild
npm run clean
npm install
```

### Component not rendering correctly

1. Check that all required props are provided in story args
2. Verify imports are correct
3. Ensure the component is properly exported
4. Check for TypeScript errors: `npm run type-check`

## Integration with Main App

Storybook is designed to run alongside your main application. You can easily switch between the two:

1. **Development Mode** - Set `LOAD_STORYBOOK = true` to develop components
2. **App Mode** - Set `LOAD_STORYBOOK = false` to run the full application

This approach allows you to:
- Develop new components in isolation
- Test edge cases and error states
- Document component APIs
- Share component behavior with team members
- Catch visual regressions early

## Resources

- [Storybook for React Native Documentation](https://github.com/storybookjs/react-native)
- [Component Story Format (CSF)](https://storybook.js.org/docs/react-native/api/csf)
- [Storybook Addons](https://storybook.js.org/docs/react-native/addons/introduction)
- [Writing Stories](https://storybook.js.org/docs/react-native/writing-stories/introduction)

## Benefits for This Project

Storybook integration provides several benefits for this React Native New Architecture showcase:

1. **Component Documentation** - Interactive documentation for all custom components
2. **Development Speed** - Build components without running the full app
3. **Quality Assurance** - Test components in isolation with various props and states
4. **Onboarding** - New developers can explore components visually
5. **Design Consistency** - Ensure components follow design patterns
6. **Regression Prevention** - Catch visual bugs before they reach production

## Next Steps

To expand Storybook coverage:

1. Add stories for remaining components (IconButton, SearchBar, Chip, etc.)
2. Create stories for complex components (PokemonCard, ErrorScreen)
3. Add stories for screen layouts and navigation patterns
4. Integrate visual regression testing
5. Set up Storybook deployment for team access
6. Add more decorators for common UI patterns
7. Create template stories for rapid component development
