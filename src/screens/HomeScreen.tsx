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
import { useCountdown } from '../hooks';

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const { time, isActive, start, pause, reset } = useCountdown(60);
  const [counter, setCounter] = React.useState(0);

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, textStyle]}>
            Welcome to RN AW Test!
          </Text>
          <Text style={[styles.subtitle, textStyle]}>
            Showcasing React Native 0.82 New Architecture
          </Text>
        </View>

        {/* Feature Demo Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Interactive Features</Text>
          
          {/* Counter Demo */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
            <Text style={[styles.cardTitle, textStyle]}>Counter Demo</Text>
            <Text style={[styles.counterText, textStyle]}>Count: {counter}</Text>
            
            <View style={styles.buttonRow}>
              <Button 
                title="-" 
                onPress={() => setCounter(prev => Math.max(0, prev - 1))}
                size="small"
                variant="outline"
              />
              <Button 
                title="Reset" 
                onPress={() => setCounter(0)}
                size="small"
              />
              <Button 
                title="+" 
                onPress={() => setCounter(prev => prev + 1)}
                size="small"
                variant="secondary"
              />
            </View>
          </View>

          {/* Countdown Demo */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
            <Text style={[styles.cardTitle, textStyle]}>Countdown Timer</Text>
            <Text style={[styles.timerText, textStyle]}>
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </Text>
            
            <View style={styles.buttonRow}>
              <Button 
                title={isActive ? "Pause" : "Start"}
                onPress={isActive ? pause : start}
                size="small"
                variant={isActive ? "outline" : "primary"}
              />
              <Button 
                title="Reset" 
                onPress={reset}
                size="small"
              />
            </View>
          </View>
        </View>

        {/* New Architecture Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>New Architecture Benefits</Text>
          
          <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f8ff' }]}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⚡</Text>
              <Text style={[styles.infoText, textStyle]}>Synchronous Native Calls</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🚀</Text>
              <Text style={[styles.infoText, textStyle]}>30-50% Faster Startup</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📱</Text>
              <Text style={[styles.infoText, textStyle]}>15-20% Smaller Bundle</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🔄</Text>
              <Text style={[styles.infoText, textStyle]}>Concurrent Rendering</Text>
            </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  counterText: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 12,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
});

export default HomeScreen;

// Import Platform
import { Platform } from 'react-native';
