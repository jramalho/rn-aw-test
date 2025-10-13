/**
 * NotificationDemoScreen
 * Demonstrates notification navigation integration
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card } from '../components';
import { useTheme } from '../hooks';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import { useNotifications } from '../hooks/useNotifications';
import {
  NotificationChannel,
  NotificationPriority,
} from '../types/notifications';

export const NotificationDemoScreen: React.FC = () => {
  const theme = useTheme();
  const { sendNavigationNotification, sendDeepLinkNotification } =
    useNotificationNavigation();
  const { permissionStatus, requestPermissions } = useNotifications();

  const handleSendPokemonNotification = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await sendNavigationNotification({
        title: '🔍 New Pokemon Discovered!',
        body: 'Tap to view Pikachu (#25)',
        screen: 'PokemonDetail',
        params: { id: '25' },
        channelId: NotificationChannel.UPDATES,
        priority: NotificationPriority.HIGH,
      });
      Alert.alert('Success', 'Notification sent! Tap it to navigate to Pikachu');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleSendTeamNotification = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await sendNavigationNotification({
        title: '⚔️ Team Builder',
        body: 'Time to build your dream team!',
        screen: 'TeamBuilder',
        channelId: NotificationChannel.DEFAULT,
        priority: NotificationPriority.DEFAULT,
      });
      Alert.alert('Success', 'Notification sent! Tap it to open Team Builder');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleSendSettingsNotification = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await sendNavigationNotification({
        title: '⚙️ Notification Settings',
        body: 'Manage your notification preferences',
        screen: 'NotificationSettings',
        channelId: NotificationChannel.DEFAULT,
        priority: NotificationPriority.DEFAULT,
      });
      Alert.alert('Success', 'Notification sent! Tap it to open settings');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleSendInteractiveNotification = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await sendNavigationNotification({
        title: '🎮 Battle Invitation',
        body: 'Someone wants to battle! Will you accept?',
        screen: 'TeamBuilder',
        channelId: NotificationChannel.ALERTS,
        priority: NotificationPriority.HIGH,
        actions: [
          { id: 'accept', title: 'Accept' },
          { id: 'decline', title: 'Decline', destructive: true },
        ],
      });
      Alert.alert(
        'Success',
        'Interactive notification sent! Try the action buttons',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleSendDeepLinkNotification = async () => {
    if (!permissionStatus.granted) {
      Alert.alert('Error', 'Please grant notification permissions first');
      return;
    }

    try {
      await sendDeepLinkNotification(
        '🔗 Deep Link Demo',
        'Tap to open via deep link',
        'rnawtest://pokemon/150',
        {
          channelId: NotificationChannel.UPDATES,
          priority: NotificationPriority.HIGH,
        },
      );
      Alert.alert('Success', 'Deep link notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {/* Permission Status */}
      <Card style={styles.card}>
        <Card.Title title="📱 Notification Navigation Demo" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            This demo shows how notifications can navigate to specific screens in
            the app. Tap any notification to see the navigation in action!
          </Text>
          
          {!permissionStatus.granted && (
            <>
              <Text
                variant="bodyMedium"
                style={[styles.warning, { color: theme.colors.error }]}>
                ⚠️ Notification permissions required
              </Text>
              <Button
                title="Grant Permissions"
                mode="contained"
                onPress={requestPermissions}
                style={styles.button}
              />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Navigation Notifications */}
      <Card style={styles.card}>
        <Card.Title title="Screen Navigation" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Notifications that navigate to specific screens with parameters:
          </Text>

          <Button
            title="Navigate to Pokemon Detail"
            mode="contained"
            onPress={handleSendPokemonNotification}
            style={styles.button}
            disabled={!permissionStatus.granted}
            icon="pokemon-go"
          />

          <Button
            title="Navigate to Team Builder"
            mode="contained"
            onPress={handleSendTeamNotification}
            style={styles.button}
            disabled={!permissionStatus.granted}
            icon="sword"
          />

          <Button
            title="Navigate to Notification Settings"
            mode="contained"
            onPress={handleSendSettingsNotification}
            style={styles.button}
            disabled={!permissionStatus.granted}
            icon="cog"
          />
        </Card.Content>
      </Card>

      {/* Interactive Notifications */}
      <Card style={styles.card}>
        <Card.Title title="Interactive Notifications" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Notifications with action buttons:
          </Text>

          <Button
            title="Send Interactive Notification"
            mode="contained"
            onPress={handleSendInteractiveNotification}
            style={styles.button}
            disabled={!permissionStatus.granted}
            icon="gesture-tap"
          />
        </Card.Content>
      </Card>

      {/* Deep Link Notifications */}
      <Card style={styles.card}>
        <Card.Title title="Deep Link Navigation" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Notifications using deep links:
          </Text>

          <Button
            title="Send Deep Link Notification"
            mode="contained"
            onPress={handleSendDeepLinkNotification}
            style={styles.button}
            disabled={!permissionStatus.granted}
            icon="link"
          />

          <Text variant="bodySmall" style={styles.info}>
            Deep links use the format: rnawtest://screen/params
          </Text>
        </Card.Content>
      </Card>

      {/* Information */}
      <Card style={styles.card}>
        <Card.Title title="How It Works" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Notifications include navigation data in their payload
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Tapping a notification triggers deep link navigation
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Works in foreground and background states
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Supports parameters for detailed navigation
          </Text>
          <Text variant="bodyMedium" style={styles.bulletPoint}>
            • Interactive actions can have custom handlers
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
  description: {
    marginBottom: 16,
  },
  sectionDescription: {
    marginBottom: 12,
  },
  warning: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  bulletPoint: {
    marginLeft: 8,
    marginBottom: 4,
  },
});
