# Performance Analytics Integration

## Overview

The Performance Analytics system provides comprehensive monitoring and tracking of app performance, user interactions, API calls, and errors. This implementation is lightweight, self-contained, and requires no external dependencies or third-party services.

## Features

### 📊 Core Capabilities

- **App Startup Tracking** - Measures time from app launch to interactive state
- **Screen Navigation Timing** - Tracks time spent on each screen and transition times
- **API Call Monitoring** - Records API response times and success/failure rates
- **Error Tracking** - Captures JavaScript errors, component crashes, and stack traces
- **User Interaction Logging** - Tracks button clicks, form submissions, and custom events
- **Session Management** - Maintains analytics sessions across app restarts
- **Data Persistence** - Stores analytics data locally using AsyncStorage
- **Export Functionality** - Share analytics reports as JSON for analysis

### 🎯 Automatic Tracking

The system automatically tracks:
- App startup duration
- Screen transitions via React Navigation
- JavaScript errors via Error Boundary integration
- Session duration and activity timestamps

## Architecture

### Service Layer

**`src/services/analytics/performanceAnalytics.ts`**
- Singleton service managing all analytics operations
- Event queue with automatic persistence
- Configurable limits (500 events, 100 errors)
- Session timeout (30 minutes of inactivity)

### Hook Layer

**`src/hooks/useAnalytics.ts`**
- React Hook for easy integration throughout the app
- Automatic screen tracking via React Navigation
- Convenient methods for common tracking scenarios

### UI Layer

**`src/screens/AnalyticsDashboardScreen.tsx`**
- Visual dashboard for viewing analytics data
- Real-time session metrics
- Export and clear functionality
- Recent events and errors display

## Usage

### Basic Integration

#### 1. Track Screen Views (Automatic)

The `useAnalytics` hook automatically tracks screen changes via React Navigation:

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const MyScreen = () => {
  useAnalytics(); // Automatically tracks screen views
  
  return <View>{/* Your screen content */}</View>;
};
```

#### 2. Track User Interactions

```typescript
const MyComponent = () => {
  const { trackInteraction } = useAnalytics();
  
  const handleButtonPress = () => {
    trackInteraction('button_press', {
      buttonName: 'submit_form',
      formId: 'login',
    });
    // Handle button press
  };
  
  return <Button onPress={handleButtonPress} title="Submit" />;
};
```

#### 3. Track API Calls

```typescript
const MyComponent = () => {
  const { trackApiCall } = useAnalytics();
  
  const fetchData = async () => {
    const data = await trackApiCall(
      'fetch_pokemon',
      () => pokemonApi.getPokemon(1),
      { pokemonId: 1 }
    );
    return data;
  };
  
  // API call is automatically timed and tracked
};
```

#### 4. Track Custom Events

```typescript
const { trackEvent } = useAnalytics();

trackEvent({
  type: 'custom',
  name: 'feature_used',
  duration: 1500,
  metadata: {
    featureName: 'dark_mode',
    enabled: true,
  },
});
```

#### 5. Track Errors

```typescript
const { trackError } = useAnalytics();

try {
  // Some operation
} catch (error) {
  trackError(error as Error, undefined, {
    context: 'data_fetching',
    userId: currentUser.id,
  });
}
```

### Advanced Usage

#### Timing Custom Operations

```typescript
const { startTimer, endTimer } = useAnalytics();

// Start timing
startTimer('data_processing');

// Perform operation
await processLargeDataset();

// End timing and track
const duration = endTimer('data_processing', 'custom', {
  dataSize: dataset.length,
});

console.log(`Processing took ${duration}ms`);
```

#### Getting Analytics Reports

```typescript
const { getReport } = useAnalytics();

const report = await getReport();
console.log('Total events:', report.summary.totalEvents);
console.log('Average screen load:', report.summary.avgScreenLoadTime);
console.log('Total errors:', report.summary.totalErrors);
```

#### Exporting Analytics Data

```typescript
const { exportData } = useAnalytics();

const jsonData = await exportData();
// Share via native Share API or send to server
await Share.share({
  message: jsonData,
  title: 'Performance Analytics Report',
});
```

## Analytics Dashboard

Navigate to the Analytics Dashboard screen to view:

- **Session Information** - Session ID, start time, duration, platform
- **Summary Metrics** - Total events, errors, average load times
- **Slowest Operations** - Identify performance bottlenecks
- **Recent Events** - Last 10 tracked events with timestamps
- **Recent Errors** - Last 5 errors with details
- **Export/Clear Actions** - Manage analytics data

## Data Structure

### Performance Event

```typescript
interface PerformanceEvent {
  id: string;                    // Unique event identifier
  type: 'startup' | 'screen' | 'interaction' | 'error' | 'api' | 'custom';
  name: string;                  // Event name
  timestamp: number;             // Unix timestamp (ms)
  duration?: number;             // Duration in milliseconds
  metadata?: Record<string, any>; // Additional contextual data
}
```

### Error Event

```typescript
interface ErrorEvent {
  id: string;                    // Unique error identifier
  timestamp: number;             // Unix timestamp (ms)
  error: string;                 // Error message
  stack?: string;                // Stack trace
  componentStack?: string;       // React component stack
  metadata?: Record<string, any>; // Additional context
}
```

### Analytics Report

```typescript
interface AnalyticsReport {
  sessionId: string;
  startTime: number;
  endTime: number;
  platform: string;              // 'ios' or 'android'
  platformVersion: string;
  appVersion: string;
  events: PerformanceEvent[];
  errors: ErrorEvent[];
  summary: {
    totalEvents: number;
    totalErrors: number;
    avgScreenLoadTime: number;   // Average in milliseconds
    avgApiCallTime: number;      // Average in milliseconds
    slowestScreen: { name: string; duration: number } | null;
    slowestApi: { name: string; duration: number } | null;
  };
}
```

## Configuration

### Adjusting Limits

Edit `src/services/analytics/performanceAnalytics.ts`:

```typescript
const MAX_EVENTS = 500;          // Maximum events to store
const MAX_ERRORS = 100;          // Maximum errors to store
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
```

### Storage Key

Analytics data is stored in AsyncStorage with key:
```typescript
const STORAGE_KEY = '@performance_analytics';
```

## Integration with Existing Features

### Error Boundary Integration

The `ErrorBoundary` component automatically tracks errors:

```typescript
// In src/components/ErrorBoundary/index.tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  performanceAnalytics.trackError({
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
}
```

### Navigation Integration

The `useAnalytics` hook integrates with React Navigation:

```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('state', () => {
    const currentRoute = navigation.getState().routes[navigation.getState().index];
    performanceAnalytics.trackScreen(currentRoute.name);
  });
  return unsubscribe;
}, [navigation]);
```

## Best Practices

### 1. Track Meaningful Events

Focus on events that provide actionable insights:
- Critical user flows (signup, checkout, etc.)
- Performance-sensitive operations
- Features usage patterns

### 2. Add Contextual Metadata

Include relevant context in metadata:
```typescript
trackInteraction('purchase_completed', {
  itemCount: cart.items.length,
  totalAmount: cart.total,
  paymentMethod: 'credit_card',
});
```

### 3. Monitor Key Metrics

Regularly review:
- Screen load times (should be < 1000ms)
- API response times (should be < 2000ms)
- Error rates (should be < 1% of events)
- Startup time (should be < 3000ms)

### 4. Clean Up Old Data

Periodically clear analytics data to prevent storage bloat:
```typescript
// Clear monthly or when appropriate
await performanceAnalytics.clearData();
```

### 5. Export Before Clearing

Always export data before clearing for analysis:
```typescript
const data = await performanceAnalytics.exportData();
// Send to your analytics server or save for review
await performanceAnalytics.clearData();
```

## Performance Considerations

### Minimal Overhead

- **Async Operations** - All storage operations are asynchronous
- **Batch Writes** - Events are batched to minimize I/O
- **Memory Limits** - Automatic trimming prevents memory bloat
- **Lazy Persistence** - Data persisted only when changed

### Storage Impact

- Each event: ~200-500 bytes
- 500 events: ~100-250 KB
- Total storage: < 300 KB with metadata

## Troubleshooting

### Events Not Being Tracked

1. Verify `useAnalytics()` hook is called in component
2. Check console for error messages
3. Ensure AsyncStorage permissions are granted

### Missing Screen Transitions

1. Confirm React Navigation is properly configured
2. Verify navigation listener is attached
3. Check that screen names are defined in navigation types

### High Memory Usage

1. Reduce `MAX_EVENTS` and `MAX_ERRORS` limits
2. Clear data more frequently
3. Reduce metadata payload size

## Future Enhancements

Potential improvements for production use:

1. **Server Integration** - Sync analytics to backend server
2. **Real-time Monitoring** - WebSocket updates for live dashboard
3. **Advanced Filtering** - Filter events by type, date range, metadata
4. **Crash Reporting** - Native crash detection and reporting
5. **Performance Budgets** - Alert on metrics exceeding thresholds
6. **A/B Testing** - Track experiment variants and outcomes
7. **User Segmentation** - Group analytics by user cohorts
8. **Heat Maps** - Visual representation of user interactions
9. **Retention Analysis** - Track user engagement over time
10. **Custom Dashboards** - Configurable analytics views

## Examples

### E-commerce Flow

```typescript
// Track product view
trackEvent({
  type: 'interaction',
  name: 'product_viewed',
  metadata: {
    productId: product.id,
    productName: product.name,
    price: product.price,
  },
});

// Track add to cart
startTimer('add_to_cart');
await addToCart(product);
endTimer('add_to_cart', 'interaction', {
  productId: product.id,
  cartSize: cart.items.length,
});

// Track purchase
trackApiCall(
  'complete_purchase',
  () => purchaseApi.checkout(cart),
  {
    totalAmount: cart.total,
    itemCount: cart.items.length,
  }
);
```

### Form Submission

```typescript
const handleSubmit = async () => {
  startTimer('form_submission');
  
  try {
    await trackApiCall(
      'submit_form',
      () => api.submitForm(formData),
      {
        formType: 'contact',
        fieldCount: Object.keys(formData).length,
      }
    );
    
    trackInteraction('form_submitted_successfully', {
      formType: 'contact',
    });
  } catch (error) {
    trackError(error as Error, undefined, {
      formType: 'contact',
      formData: formData, // Be careful with sensitive data
    });
  } finally {
    endTimer('form_submission', 'interaction');
  }
};
```

## Related Documentation

- [Performance Optimization](./BUNDLE_SIZE_OPTIMIZATION.md)
- [Error Handling](../src/components/ErrorBoundary/README.md)
- [React Navigation](https://reactnavigation.org/docs/navigation-lifecycle/)

---

**Status**: ✅ Complete and Production Ready

**Last Updated**: October 16, 2025

**Version**: 1.0.0
