/**
 * DeviceInfoScreen
 * 
 * Demo screen showcasing the DeviceInfo TurboModule
 * Displays device information, battery status, and storage info
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Card, List, Divider, ProgressBar, IconButton, Chip,  } from '../components';
import { useTheme } from '../hooks';
import DeviceInfo from '../modules/DeviceInfo';
import type { DeviceInfo as IDeviceInfo, BatteryInfo, StorageInfo } from '../modules/DeviceInfo';

export default function DeviceInfoScreen() {
  const theme = useTheme();
  const [deviceInfo, setDeviceInfo] = useState<IDeviceInfo | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [hasBiometric, setHasBiometric] = useState<boolean>(false);
  const [locale, setLocale] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [hasHaptics, setHasHaptics] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const [device, battery, storage, biometric, loc, tz, haptics] = await Promise.all([
        DeviceInfo.getDeviceInfo(),
        DeviceInfo.getBatteryInfo(),
        DeviceInfo.getStorageInfo(),
        DeviceInfo.hasBiometricAuthentication(),
        DeviceInfo.getDeviceLocale(),
        DeviceInfo.getDeviceTimezone(),
        DeviceInfo.supportsHaptics(),
      ]);

      setDeviceInfo(device);
      setBatteryInfo(battery);
      setStorageInfo(storage);
      setHasBiometric(biometric);
      setLocale(loc);
      setTimezone(tz);
      setHasHaptics(haptics);
    } catch (error) {
      Alert.alert('Error', 'Failed to load device information');
      console.error('DeviceInfo error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeviceInfo();
  };

  const batteryStatus = batteryInfo ? DeviceInfo.getBatteryStatus(batteryInfo) : null;
  const storagePercentage = storageInfo ? DeviceInfo.getStorageUsagePercentage(storageInfo) / 100 : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading device information...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Card style={styles.card}>
        <Card.Title
          title="Device Information"
          subtitle="Custom TurboModule Demo"
          left={(props) => <IconButton {...props} icon="cellphone-information" />}
        />
      </Card>

      {/* Device Info */}
      {deviceInfo && (
        <Card style={styles.card}>
          <Card.Title title="Device Details" />
          <Card.Content>
            <List.Item
              title="Model"
              description={deviceInfo.model}
              left={(props) => <List.Icon {...props} icon="cellphone" />}
            />
            <List.Item
              title="System"
              description={`${deviceInfo.systemName} ${deviceInfo.systemVersion}`}
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <List.Item
              title="Manufacturer"
              description={`${deviceInfo.manufacturer} ${deviceInfo.brand}`}
              left={(props) => <List.Icon {...props} icon="factory" />}
            />
            <List.Item
              title="App Version"
              description={`${deviceInfo.appVersion} (${deviceInfo.buildNumber})`}
              left={(props) => <List.Icon {...props} icon="application" />}
            />
            <View style={styles.chipContainer}>
              {deviceInfo.isTablet && (
                <Chip icon="tablet" style={styles.chip}>Tablet</Chip>
              )}
              {deviceInfo.isEmulator && (
                <Chip icon="desktop-tower" style={styles.chip}>Emulator</Chip>
              )}
              {hasBiometric && (
                <Chip icon="fingerprint" style={styles.chip}>Biometric</Chip>
              )}
              {hasHaptics && (
                <Chip icon="vibrate" style={styles.chip}>Haptics</Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Battery Info */}
      {batteryInfo && batteryStatus && (
        <Card style={styles.card}>
          <Card.Title title="Battery Status" />
          <Card.Content>
            <View style={styles.batteryContainer}>
              <IconButton
                icon={batteryStatus.icon}
                iconColor={batteryStatus.color}
                size={40}
              />
              <View style={styles.batteryTextContainer}>
                <Text variant="headlineMedium" style={{ color: batteryStatus.color }}>
                  {DeviceInfo.formatBatteryLevel(batteryInfo.level)}
                </Text>
                <Text variant="bodyMedium">{batteryInfo.state}</Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <ProgressBar
              progress={batteryInfo.level}
              color={batteryStatus.color}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>
      )}

      {/* Storage Info */}
      {storageInfo && (
        <Card style={styles.card}>
          <Card.Title title="Storage" />
          <Card.Content>
            <List.Item
              title="Total Space"
              description={DeviceInfo.formatStorageSize(storageInfo.totalSpace)}
              left={(props) => <List.Icon {...props} icon="harddisk" />}
            />
            <List.Item
              title="Free Space"
              description={DeviceInfo.formatStorageSize(storageInfo.freeSpace)}
              left={(props) => <List.Icon {...props} icon="folder-open" />}
            />
            <List.Item
              title="Used Space"
              description={DeviceInfo.formatStorageSize(storageInfo.usedSpace)}
              left={(props) => <List.Icon {...props} icon="folder" />}
            />
            <Divider style={styles.divider} />
            <Text variant="bodySmall" style={styles.storageLabel}>
              Storage Usage: {storagePercentage.toFixed(1)}%
            </Text>
            <ProgressBar
              progress={storagePercentage}
              color={storagePercentage > 0.9 ? '#f44336' : theme.colors.primary}
              style={styles.progressBar}
            />
            {DeviceInfo.isLowStorage(storageInfo) && (
              <Chip icon="alert" style={[styles.chip, styles.warningChip]}>
                Low Storage Warning
              </Chip>
            )}
          </Card.Content>
        </Card>
      )}

      {/* System Info */}
      <Card style={styles.card}>
        <Card.Title title="System Settings" />
        <Card.Content>
          <List.Item
            title="Locale"
            description={locale}
            left={(props) => <List.Icon {...props} icon="translate" />}
          />
          <List.Item
            title="Timezone"
            description={timezone}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
          />
        </Card.Content>
      </Card>

      {/* Synchronous Method Demo */}
      <Card style={styles.card}>
        <Card.Title title="TurboModule Performance" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.noteText}>
            This screen demonstrates a custom TurboModule built with the React Native New Architecture.
            {'\n\n'}
            TurboModules provide:
            {'\n'}• Direct JSI communication (no bridge)
            {'\n'}• Type-safe interfaces
            {'\n'}• Better performance
            {'\n'}• Lazy loading
            {'\n\n'}
            Synchronous method result: {DeviceInfo.getDeviceModelSync()}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 8,
    marginTop: 16,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryTextContainer: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  storageLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  warningChip: {
    marginTop: 8,
  },
  noteText: {
    lineHeight: 22,
    opacity: 0.8,
  },
  footer: {
    height: 32,
  },
});
