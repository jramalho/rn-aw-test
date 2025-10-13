/**
 * NotificationSettingsScreen
 * Screen for managing notification preferences and testing notifications
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  Button,
  Card,
  Switch,
  Divider,
  List,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNotifications } from '../hooks/useNotifications';
import {
  NotificationChannel,
  NotificationPriority,
} from '../types/notifications';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'NotificationSettings'
>;

export const NotificationSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    permissionStatus,
    requestPermissions,
    displayNotification,
    cancelAllNotifications,
    setBadgeCount,
    openSettings,
  } = useNotifications();

  const [channelSettings, setChannelSettings] = useState({
    [NotificationChannel.DEFAULT]: true,
    [NotificationChannel.ALERTS]: true,
    [NotificationChannel.UPDATES]: true,
    [NotificationChannel.PROMOTIONS]: false,
  });

  const handleRequestPermissions = async () => {
    const status = await requestPermissions();
    if (status.granted) {
      Alert.alert('Success', 'Notification permissions granted!');
    } else if (status.deniedForever) {
      Alert.alert(
        'Permissions Denied',
        'Notification permissions have been permanently denied. Please enable them in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings },
        ],
      );
    } else {
      Alert.alert(
        'Permissions Denied',
        'Notification permissions were not granted.',
      );
    }
  };

  const handleTestNotification = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await displayNotification({
        id: `test-${Date.now()}`,
        title: 'Test Notification',
        body: 'This is a test notification from RN AW Test!',
        channelId: NotificationChannel.DEFAULT,
        priority: NotificationPriority.HIGH,
        data: {
          type: 'test',
          timestamp: Date.now(),
        },
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleTestWithActions = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await displayNotification({
        id: `test-actions-${Date.now()}`,
        title: 'Interactive Notification',
        body: 'This notification has action buttons',
        channelId: NotificationChannel.ALERTS,
        priority: NotificationPriority.HIGH,
        actions: [
          { id: 'accept', title: 'Accept' },
          { id: 'decline', title: 'Decline', destructive: true },
        ],
        data: {
          type: 'interactive',
          timestamp: Date.now(),
        },
      });
      Alert.alert('Success', 'Interactive notification sent!');
    } catch {
      Alert.alert('Error', 'Failed to send interactive notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await cancelAllNotifications();
      Alert.alert('Success', 'All notifications cleared!');
    } catch {
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  const handleSetBadge = async (count: number) => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Badge count is only available on iOS');
      return;
    }

    try {
      await setBadgeCount(count);
      Alert.alert('Success', `Badge count set to ${count}`);
    } catch {
      Alert.alert('Error', 'Failed to set badge count');
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setChannelSettings(prev => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Permission Status */}
      <Card style={styles.card}>
        <Card.Title title="Notification Permissions" />
        <Card.Content>
          <View style={styles.statusRow}>
            <Text variant="bodyLarge">Status:</Text>
            <Text
              variant="bodyLarge"
              style={{
                color: permissionStatus.granted
                  ? theme.colors.primary
                  : theme.colors.error,
                fontWeight: 'bold',
              }}
            >
              {permissionStatus.granted ? 'Granted' : 'Not Granted'}
            </Text>
          </View>
          {!permissionStatus.granted && (
            <Button
              mode="contained"
              onPress={handleRequestPermissions}
              style={styles.button}
            >
              Request Permissions
            </Button>
          )}
          {permissionStatus.deniedForever && (
            <Button
              mode="outlined"
              onPress={openSettings}
              style={styles.button}
            >
              Open Settings
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Test Notifications */}
      <Card style={styles.card}>
        <Card.Title title="Test Notifications" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleTestNotification}
            style={styles.button}
            disabled={!permissionStatus.granted}
          >
            Send Test Notification
          </Button>
          <Button
            mode="contained"
            onPress={handleTestWithActions}
            style={styles.button}
            disabled={!permissionStatus.granted}
          >
            Send Interactive Notification
          </Button>
          <Button
            mode="outlined"
            onPress={handleClearAll}
            style={styles.button}
          >
            Clear All Notifications
          </Button>
          <Divider style={styles.divider} />
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('NotificationDemo')}
            style={styles.button}
            icon="navigation"
          >
            Open Navigation Demo
          </Button>
        </Card.Content>
      </Card>

      {/* Badge Management (iOS) */}
      {Platform.OS === 'ios' && (
        <Card style={styles.card}>
          <Card.Title title="Badge Management (iOS)" />
          <Card.Content>
            <View style={styles.badgeRow}>
              <Button
                mode="outlined"
                onPress={() => handleSetBadge(0)}
                style={styles.badgeButton}
              >
                Clear Badge
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleSetBadge(5)}
                style={styles.badgeButton}
              >
                Set to 5
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleSetBadge(10)}
                style={styles.badgeButton}
              >
                Set to 10
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Channel Settings */}
      <Card style={styles.card}>
        <Card.Title title="Notification Channels" />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Default Notifications"
              description="General app notifications"
              right={() => (
                <Switch
                  value={channelSettings[NotificationChannel.DEFAULT]}
                  onValueChange={() =>
                    toggleChannel(NotificationChannel.DEFAULT)
                  }
                />
              )}
            />
            <Divider />
            <List.Item
              title="Important Alerts"
              description="Critical alerts and warnings"
              right={() => (
                <Switch
                  value={channelSettings[NotificationChannel.ALERTS]}
                  onValueChange={() =>
                    toggleChannel(NotificationChannel.ALERTS)
                  }
                />
              )}
            />
            <Divider />
            <List.Item
              title="Updates"
              description="App and content updates"
              right={() => (
                <Switch
                  value={channelSettings[NotificationChannel.UPDATES]}
                  onValueChange={() =>
                    toggleChannel(NotificationChannel.UPDATES)
                  }
                />
              )}
            />
            <Divider />
            <List.Item
              title="Promotions"
              description="Promotional content and offers"
              right={() => (
                <Switch
                  value={channelSettings[NotificationChannel.PROMOTIONS]}
                  onValueChange={() =>
                    toggleChannel(NotificationChannel.PROMOTIONS)
                  }
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Information */}
      <Card style={styles.card}>
        <Card.Title title="About Notifications" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.infoText}>
            This app uses Notifee for local and push notifications with full
            support for iOS and Android.
          </Text>
          <Text variant="bodyMedium" style={styles.infoText}>
            Features include:
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Multiple notification channels
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Interactive action buttons
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Badge management (iOS)
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Custom sounds and images
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Foreground and background handling
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  badgeButton: {
    flex: 1,
  },
  infoText: {
    marginBottom: 8,
  },
  bulletPoint: {
    marginLeft: 8,
    marginBottom: 4,
  },
});
