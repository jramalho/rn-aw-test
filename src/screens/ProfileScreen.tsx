import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  return (
    <View style={[styles.container, backgroundStyle, { paddingTop: insets.top }]}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' }]}>
            <Text style={styles.avatarText}>RN</Text>
          </View>
          <Text style={[styles.name, textStyle]}>React Native Developer</Text>
          <Text style={[styles.email, textStyle]}>developer@rnawtest.com</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Development Stats</Text>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f8ff' }]}>
              <Text style={[styles.statNumber, textStyle]}>0.82</Text>
              <Text style={[styles.statLabel, textStyle]}>RN Version</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f0fff0' }]}>
              <Text style={[styles.statNumber, textStyle]}>19.1</Text>
              <Text style={[styles.statLabel, textStyle]}>React Version</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff8f0' }]}>
              <Text style={[styles.statNumber, textStyle]}>5.8</Text>
              <Text style={[styles.statLabel, textStyle]}>TypeScript</Text>
            </View>
          </View>
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>New Architecture Experience</Text>
          
          <View style={[styles.experienceCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
            <View style={styles.experienceItem}>
              <Text style={styles.experienceIcon}>✓</Text>
              <Text style={[styles.experienceText, textStyle]}>Fabric Renderer Implementation</Text>
            </View>
            
            <View style={styles.experienceItem}>
              <Text style={styles.experienceIcon}>✓</Text>
              <Text style={[styles.experienceText, textStyle]}>TurboModules Development</Text>
            </View>
            
            <View style={styles.experienceItem}>
              <Text style={styles.experienceIcon}>✓</Text>
              <Text style={[styles.experienceText, textStyle]}>JSI Direct Integration</Text>
            </View>
            
            <View style={styles.experienceItem}>
              <Text style={styles.experienceIcon}>✓</Text>
              <Text style={[styles.experienceText, textStyle]}>Concurrent React Features</Text>
            </View>
            
            <View style={styles.experienceItem}>
              <Text style={styles.experienceIcon}>✓</Text>
              <Text style={[styles.experienceText, textStyle]}>Hermes V1 Optimization</Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Profile Actions</Text>
          
          <View style={styles.actionsContainer}>
            <Button 
              title="Edit Profile"
              onPress={() => console.log('Edit Profile pressed')}
              variant="primary"
            />
            
            <Button 
              title="View Projects"
              onPress={() => console.log('View Projects pressed')}
              variant="outline"
            />
            
            <Button 
              title="Share Profile"
              onPress={() => console.log('Share Profile pressed')}
              variant="secondary"
            />
          </View>
        </View>

      </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  experienceCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  experienceIcon: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 12,
    fontWeight: '600',
  },
  experienceText: {
    fontSize: 16,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
  },
});

export default ProfileScreen;
