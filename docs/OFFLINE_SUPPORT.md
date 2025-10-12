# Offline Support

This document describes the comprehensive offline support implementation in the RN AW Test app.

## Overview

The app features a complete offline-first architecture that provides a seamless user experience even when network connectivity is unavailable. The implementation includes network monitoring, request queuing, intelligent caching, and automatic synchronization when connectivity is restored.

## Features

- ✅ **Network Monitoring** - Real-time network status tracking with NetInfo
- ✅ **Offline Indicator** - Visual banner when device is offline
- ✅ **Request Queuing** - Automatic queuing of failed requests for retry
- ✅ **Smart Caching** - 30-minute cache with LRU eviction and size management
- ✅ **Automatic Retry** - Exponential backoff retry strategy
- ✅ **Persistent State** - Network status and queue persisted across app restarts
- ✅ **Type-Safe API** - Full TypeScript support with comprehensive types

## Architecture

### Components

1. **Network Service** (`src/services/networkService.ts`)
   - Singleton service for network monitoring
   - Handles network state changes via NetInfo
   - Manages offline request queue with retry logic
   - Persists network status to AsyncStorage
   - Processes queued requests when back online

2. **Offline API Client** (`src/services/offlineApiClient.ts`)
   - Network-aware API request wrapper
   - Automatic request queuing when offline
   - Timeout handling with AbortController
   - Exponential backoff retry strategy

3. **useNetwork Hook** (`src/hooks/useNetwork.ts`)
   - React hook for accessing network status
   - Provides online/offline state
   - Access to queue management functions
   - Automatic subscription cleanup

4. **OfflineIndicator Component** (`src/components/OfflineIndicator.tsx`)
   - Visual feedback for offline state
   - Animated slide-in/out transitions
   - Customizable position, colors, and message
   - Automatically shows/hides based on network status

## Usage

### Basic Network Status

```typescript
import { useNetwork } from '../hooks/useNetwork';

const MyComponent: React.FC = () => {
  const { isOnline, isOffline, status } = useNetwork();

  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      <Text>Connection Type: {status.type}</Text>
    </View>
  );
};
```

### Offline-Aware API Requests

```typescript
import { apiRequest } from '../services/offlineApiClient';

// Basic request with automatic queuing when offline
const fetchData = async () => {
  const result = await apiRequest('/api/endpoint', {
    method: 'POST',
    body: { data: 'example' },
    queueIfOffline: true,
  });

  if (result.queued) {
    console.log('Request queued - will retry when online');
  } else if (result.error) {
    console.error('Request failed:', result.error);
  } else {
    console.log('Success:', result.data);
  }
};
```

### Retry with Exponential Backoff

```typescript
import { retryRequest } from '../services/offlineApiClient';

// Retry up to 3 times with exponential backoff
const fetchDataWithRetry = async () => {
  const result = await retryRequest('/api/endpoint', {
    method: 'GET',
  }, 3);

  if (result.error) {
    console.error('Failed after 3 retries:', result.error);
  } else {
    console.log('Success:', result.data);
  }
};
```

### Manual Queue Management

```typescript
import { useNetwork } from '../hooks/useNetwork';

const QueueManagement: React.FC = () => {
  const { getQueueStats, clearQueue } = useNetwork();
  const [stats, setStats] = useState({ count: 0, oldestTimestamp: null });

  useEffect(() => {
    const loadStats = async () => {
      const queueStats = await getQueueStats();
      setStats(queueStats);
    };
    loadStats();
  }, []);

  const handleClearQueue = async () => {
    await clearQueue();
    setStats({ count: 0, oldestTimestamp: null });
  };

  return (
    <View>
      <Text>Queued Requests: {stats.count}</Text>
      <Button title="Clear Queue" onPress={handleClearQueue} />
    </View>
  );
};
```

### Custom Offline Indicator

```typescript
import { OfflineIndicator } from '../components/OfflineIndicator';

const App: React.FC = () => {
  return (
    <View>
      {/* Default offline indicator at top */}
      <OfflineIndicator />

      {/* Custom offline indicator at bottom */}
      <OfflineIndicator 
        position="bottom"
        backgroundColor="#ff6b6b"
        textColor="#ffffff"
        message="You're offline. Some features may be limited."
      />

      {/* Your app content */}
    </View>
  );
};
```

## Pokemon API Integration

The Pokemon API already includes sophisticated offline support:

### Caching Strategy

- **30-minute cache duration** for all API responses
- **LRU (Least Recently Used) eviction** when cache is full
- **Access count tracking** to prioritize frequently used data
- **Optimized data storage** to reduce cache size
- **Automatic cleanup** of expired and unused items
- **2MB max cache size** to prevent storage issues

### Cache Features

```typescript
import { pokemonApi } from '../utils/pokemonApi';

// Get Pokemon with automatic caching
const pokemon = await pokemonApi.getPokemon('pikachu');
// Subsequent calls within 30 minutes will use cached data

// Get cache information
const cacheInfo = await pokemonApi.getCacheInfo();
console.log(`Cached items: ${cacheInfo.count}`);

// Clear all cache
await pokemonApi.clearCache();
```

## Network Status Persistence

The network service automatically persists network status to AsyncStorage:

- **Last known network state** is restored on app launch
- **Offline queue** survives app restarts
- **Queue statistics** track oldest pending request

## Request Queue Processing

When the device comes back online:

1. Network service detects connection restored
2. Processes all queued requests sequentially
3. Retries failed requests up to 3 times
4. Removes successfully processed requests from queue
5. Drops requests that exceed maximum retry count

## Performance Considerations

### Optimization Features

- **Debounced network status updates** to prevent excessive re-renders
- **Lazy queue loading** - queue only loaded when needed
- **Efficient cache eviction** using LRU algorithm
- **Minimal re-renders** with React hooks optimization
- **Background queue processing** doesn't block UI

### Memory Management

- **Cache size limits** (50 items, 2MB total)
- **Automatic cleanup** of expired items
- **Compressed data storage** with optimized Pokemon data
- **Queue size monitoring** to prevent unbounded growth

## Error Handling

The offline system includes comprehensive error handling:

### Network Errors

```typescript
// Automatically detects network errors and queues request
const result = await apiRequest('/api/endpoint', {
  queueIfOffline: true
});

if (result.queued) {
  // Request queued for later
  showNotification('Changes will sync when online');
}
```

### Timeout Handling

```typescript
// Custom timeout (default 30 seconds)
const result = await apiRequest('/api/endpoint', {
  timeout: 10000, // 10 seconds
});

if (result.error?.message.includes('timeout')) {
  // Handle timeout
}
```

### Storage Errors

- **Graceful degradation** when storage is full
- **Automatic cache cleanup** on storage errors
- **Fallback to in-memory state** if persistence fails

## Testing

Comprehensive test coverage for offline functionality:

### Unit Tests

```bash
# Run all tests
npm test

# Run network service tests specifically
npm test -- networkService.test.ts
```

### Test Coverage

- ✅ Network status monitoring
- ✅ Listener subscription/unsubscription
- ✅ Request queuing
- ✅ Queue processing
- ✅ Queue statistics
- ✅ Cache management
- ✅ Error scenarios

## Best Practices

### When to Queue Requests

- ✅ **Queue:** POST, PUT, PATCH, DELETE requests
- ❌ **Don't Queue:** GET requests (use cache instead)
- ✅ **Queue:** User-initiated actions (favorites, preferences)
- ❌ **Don't Queue:** Background analytics or logging

### Cache Strategy

- Use **short TTL** (5-10 min) for frequently changing data
- Use **long TTL** (30-60 min) for static reference data
- Implement **cache invalidation** for user-modified data
- Consider **cache versioning** for API changes

### User Experience

- **Show visual feedback** when offline (OfflineIndicator)
- **Inform users** when actions are queued
- **Provide manual sync** options in settings
- **Display queue status** when relevant

## Future Enhancements

Potential improvements for offline support:

- **Conflict resolution** for concurrent edits
- **Delta sync** to minimize data transfer
- **Background sync** using native background tasks
- **IndexedDB-style queries** for advanced offline queries
- **Service Worker patterns** for web compatibility
- **Custom cache strategies** per endpoint
- **Offline-first mutations** with optimistic updates

## Configuration

### Network Service Configuration

```typescript
// Customize in src/services/networkService.ts
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const MAX_RETRIES = 3;
const RETRY_BACKOFF = 2; // Exponential base
```

### API Client Configuration

```typescript
// Default timeout
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Customize per request
apiRequest('/endpoint', {
  timeout: 10000, // 10 seconds
  queueIfOffline: true,
});
```

## Resources

### Official Documentation

- [NetInfo Documentation](https://github.com/react-native-netinfo/react-native-netinfo)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [React Native Network Info](https://reactnative.dev/docs/network)

### Best Practices

- [Offline-First Design Patterns](https://offlinefirst.org/)
- [Progressive Web App Offline](https://web.dev/offline-cookbook/)
- [Mobile Offline Patterns](https://martinfowler.com/articles/patterns-of-distributed-systems/offline-first.html)

---

**Built with ❤️ for React Native 0.82 New Architecture**

*Complete offline support with network monitoring, request queuing, and intelligent caching.*
