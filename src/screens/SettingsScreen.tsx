import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components';
import { pokemonApi } from '../utils/pokemonApi';

const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const { isDarkMode, systemTheme, toggleTheme, setTheme } = useThemeStore();
  const { user, logout } = useAuth();

  // Local state for other settings
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);
  const [performanceMonitoring, setPerformanceMonitoring] =
    React.useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const handleThemeChange = () => {
    toggleTheme();
  };

  const resetToSystemTheme = () => {
    setTheme(systemColorScheme === 'dark');
  };

  const handleClearCache = async () => {
    try {
      await pokemonApi.clearCache();
      Alert.alert('Success', 'Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[styles.container, backgroundStyle, { paddingTop: insets.top }]}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, textStyle]}>Settings</Text>
          <Text style={[styles.subtitle, textStyle]}>
            Customize your app experience
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Appearance</Text>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' },
            ]}
          >
            <SettingItem
              title="Dark Mode"
              description={`Currently: ${isDarkMode ? 'Dark' : 'Light'}`}
              value={isDarkMode}
              onValueChange={handleThemeChange}
              isDarkMode={isDarkMode}
            />

            <View style={styles.separator} />

            <Pressable
              style={styles.settingPressable}
              onPress={resetToSystemTheme}
            >
              <View>
                <Text style={[styles.settingTitle, textStyle]}>
                  Use System Theme
                </Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {systemTheme
                    ? 'Following system settings'
                    : 'Manual override active'}
                </Text>
              </View>
              <Text style={[styles.actionText, { color: '#007AFF' }]}>
                Reset
              </Text>
            </Pressable>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>App Settings</Text>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' },
            ]}
          >
            <SettingItem
              title="Push Notifications"
              description="Receive app updates and alerts"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              isDarkMode={isDarkMode}
            />

            <View style={styles.separator} />

            <SettingItem
              title="Analytics"
              description="Help improve the app with usage data"
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
              isDarkMode={isDarkMode}
            />

            <View style={styles.separator} />

            <SettingItem
              title="Performance Monitoring"
              description="Track app performance metrics"
              value={performanceMonitoring}
              onValueChange={setPerformanceMonitoring}
              isDarkMode={isDarkMode}
            />
          </View>
        </View>

        {/* New Architecture Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>
            New Architecture Status
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f8ff' },
            ]}
          >
            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✓</Text>
              <Text style={[styles.statusText, textStyle]}>
                Fabric Renderer Active
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✓</Text>
              <Text style={[styles.statusText, textStyle]}>
                TurboModules Enabled
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✓</Text>
              <Text style={[styles.statusText, textStyle]}>
                JSI Bridge Active
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✓</Text>
              <Text style={[styles.statusText, textStyle]}>
                Hermes Engine Running
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Actions</Text>

          <View style={styles.actionsContainer}>
            <Button
              title="Clear Cache"
              onPress={handleClearCache}
              variant="outline"
            />

            <Button
              title="Reset Settings"
              onPress={() => console.log('Reset Settings pressed')}
              variant="outline"
            />

            <Button
              title="About App"
              onPress={() => console.log('About App pressed')}
              variant="primary"
            />
          </View>
        </View>

        {/* Account Section */}
        {user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>Account</Text>

            <View
              style={[
                styles.settingCard,
                { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' },
              ]}
            >
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, textStyle]}>
                    Signed in as
                  </Text>
                  <Text style={[styles.settingDescription, textStyle]}>
                    {user.email}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.actionsContainer, { marginTop: 16 }]}>
              <Button
                title="Sign Out"
                onPress={handleLogout}
                variant="outline"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Helper component for setting items
interface SettingItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDarkMode: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  value,
  onValueChange,
  isDarkMode,
}) => {
  const textColor = { color: isDarkMode ? '#ffffff' : '#000000' };

  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, textColor]}>{title}</Text>
        <Text style={[styles.settingDescription, textColor]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#34C759' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 16,
  },
  settingPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 12,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
  },
});

export default SettingsScreen;
