/**
 * useDeepLink Hook
 * Provides utilities for handling deep links in components
 */

import { useEffect, useState, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { parseDeepLink, isValidDeepLink } from '../config/linkingConfig';

interface DeepLinkState {
  url: string | null;
  isHandling: boolean;
  error: Error | null;
}

export function useDeepLink() {
  const navigation = useNavigation();
  const [state, setState] = useState<DeepLinkState>({
    url: null,
    isHandling: false,
    error: null,
  });

  /**
   * Handle deep link URL
   */
  const handleDeepLink = useCallback(
    async (url: string) => {
      if (!url || !isValidDeepLink(url)) {
        setState(prev => ({
          ...prev,
          error: new Error('Invalid deep link URL'),
        }));
        return;
      }

      setState(prev => ({ ...prev, url, isHandling: true, error: null }));

      try {
        const linkData = parseDeepLink(url);
        
        if (!linkData) {
          throw new Error('Unable to parse deep link');
        }

        // Navigate to the screen
        // @ts-ignore - Navigation type inference is complex with dynamic screens
        navigation.navigate(linkData.screen, linkData.params);
        
        setState(prev => ({ ...prev, isHandling: false }));
      } catch (error) {
        console.error('Error handling deep link:', error);
        setState(prev => ({
          ...prev,
          isHandling: false,
          error: error as Error,
        }));
      }
    },
    [navigation]
  );

  /**
   * Listen for deep links while app is running
   */
  useEffect(() => {
    // Handle initial URL (app was opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL events (app received deep link while running)
    const subscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  /**
   * Open a URL (either within app or externally)
   */
  const openUrl = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (!canOpen) {
        throw new Error('Cannot open URL');
      }

      // If it's our deep link, handle internally
      if (isValidDeepLink(url)) {
        await handleDeepLink(url);
      } else {
        // Otherwise open externally
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      throw error;
    }
  }, [handleDeepLink]);

  /**
   * Get the current deep link URL
   */
  const getInitialUrl = useCallback(async () => {
    try {
      return await Linking.getInitialURL();
    } catch (error) {
      console.error('Error getting initial URL:', error);
      return null;
    }
  }, []);

  return {
    url: state.url,
    isHandling: state.isHandling,
    error: state.error,
    handleDeepLink,
    openUrl,
    getInitialUrl,
  };
}
