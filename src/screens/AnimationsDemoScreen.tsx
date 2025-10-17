/**
 * Animations Demo Screen
 * Showcases Reanimated 3 animations and micro-interactions
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AnimatedButton,
  AnimatedCard,
  Card,
  Text,
  Divider,
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SwipeableListItem } from '../components/SwipeableListItem';
import {
  useFadeIn,
  useScaleIn,
  useSlideInBottom,
  useBounce,
  useShake,
  useStaggeredAnimation,
  usePulse,
} from '../hooks/useAnimations';

const AnimationsDemoScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [bounceKey, setBounceKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const backgroundColor = isDarkMode ? '#000000' : '#f2f2f7';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  // Entrance animations for header
  const fadeInStyle = useFadeIn(600);
  const scaleInStyle = useScaleIn(400, 100);

  // Bounce and shake animations
  const bounceStyle = useBounce(bounceKey);
  const shakeStyle = useShake(shakeKey);

  // Pulse animation
  const pulseStyle = usePulse(1500);

  // Staggered list items
  const listItems = [
    'Fade In',
    'Scale In',
    'Slide In',
    'Bounce',
    'Shake',
    'Pulse',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with fade in */}
        <Animated.View style={[styles.header, fadeInStyle]}>
          <Text variant="displayMedium" style={{ color: textColor }}>
            🎭 Animations
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: textColor }]}>
            Showcasing Reanimated 3 capabilities
          </Text>
        </Animated.View>

        {/* Animated Buttons Section */}
        <Animated.View style={scaleInStyle}>
          <Card style={styles.section}>
            <Card.Title title="Animated Buttons" />
            <Card.Content>
              <Text variant="bodyMedium" style={styles.description}>
                Buttons with smooth press animations using springs
              </Text>
              <View style={styles.buttonContainer}>
                <AnimatedButton
                  title="Primary"
                  variant="primary"
                  onPress={() => console.log('Primary pressed')}
                />
                <AnimatedButton
                  title="Secondary"
                  variant="secondary"
                  onPress={() => console.log('Secondary pressed')}
                />
                <AnimatedButton
                  title="Outline"
                  variant="outline"
                  onPress={() => console.log('Outline pressed')}
                />
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Animated Cards Section */}
        <View style={styles.section}>
          <Card>
            <Card.Title title="Animated Cards" />
            <Card.Content>
              <Text variant="bodyMedium" style={styles.description}>
                Cards with entrance animations
              </Text>
            </Card.Content>
          </Card>

          <AnimatedCard delay={0} style={styles.demoCard}>
            <Card.Content>
              <Text variant="titleMedium">Card with no delay</Text>
              <Text variant="bodySmall">Appears immediately</Text>
            </Card.Content>
          </AnimatedCard>

          <AnimatedCard delay={200} style={styles.demoCard}>
            <Card.Content>
              <Text variant="titleMedium">Card with 200ms delay</Text>
              <Text variant="bodySmall">Slightly staggered</Text>
            </Card.Content>
          </AnimatedCard>

          <AnimatedCard delay={400} style={styles.demoCard}>
            <Card.Content>
              <Text variant="titleMedium">Card with 400ms delay</Text>
              <Text variant="bodySmall">More staggered</Text>
            </Card.Content>
          </AnimatedCard>
        </View>

        {/* Interactive Animations */}
        <Card style={styles.section}>
          <Card.Title title="Interactive Animations" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.description}>
              Tap buttons to trigger animations
            </Text>

            <View style={styles.interactiveRow}>
              <AnimatedButton
                title="Trigger Bounce"
                size="small"
                onPress={() => setBounceKey((k) => k + 1)}
              />
              <Animated.View style={[styles.interactiveDemo, bounceStyle]}>
                <Text variant="titleLarge">🎈</Text>
              </Animated.View>
            </View>

            <View style={styles.interactiveRow}>
              <AnimatedButton
                title="Trigger Shake"
                size="small"
                onPress={() => setShakeKey((k) => k + 1)}
              />
              <Animated.View style={[styles.interactiveDemo, shakeStyle]}>
                <Text variant="titleLarge">📱</Text>
              </Animated.View>
            </View>
          </Card.Content>
        </Card>

        {/* Continuous Animations */}
        <Card style={styles.section}>
          <Card.Title title="Continuous Animations" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.description}>
              Animations that loop continuously
            </Text>

            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseItem, pulseStyle]}>
                <Text variant="titleLarge">💓</Text>
              </Animated.View>
              <Text variant="bodySmall">Pulsing animation</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Staggered List */}
        <Card style={styles.section}>
          <Card.Title title="Staggered List Animation" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.description}>
              List items appear with sequential delays
            </Text>

            {listItems.map((item, index) => {
              const staggeredStyle = useStaggeredAnimation(index, 0, 100);
              return (
                <Animated.View key={item} style={[styles.listItem, staggeredStyle]}>
                  <View style={styles.listItemContent}>
                    <Text variant="bodyLarge">{item}</Text>
                    <Text variant="bodySmall" style={styles.listItemDelay}>
                      {index * 100}ms
                    </Text>
                  </View>
                  {index < listItems.length - 1 && <Divider />}
                </Animated.View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Loading Spinners Section */}
        <Card style={styles.section}>
          <Card.Title title="Loading Animations" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.description}>
              Multiple loading animation types with Reanimated 3
            </Text>
            <View style={styles.loadingGrid}>
              <View style={styles.loadingItem}>
                <LoadingSpinner type="circular" size={40} color="#007AFF" />
                <Text variant="bodySmall" style={styles.loadingLabel}>
                  Circular
                </Text>
              </View>
              <View style={styles.loadingItem}>
                <LoadingSpinner type="pulse" size={40} color="#34C759" />
                <Text variant="bodySmall" style={styles.loadingLabel}>
                  Pulse
                </Text>
              </View>
              <View style={styles.loadingItem}>
                <LoadingSpinner type="bounce" size={40} color="#FF9500" />
                <Text variant="bodySmall" style={styles.loadingLabel}>
                  Bounce
                </Text>
              </View>
              <View style={styles.loadingItem}>
                <LoadingSpinner type="dots" size={40} color="#FF3B30" />
                <Text variant="bodySmall" style={styles.loadingLabel}>
                  Dots
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Swipeable List Items Section */}
        <Card style={styles.section}>
          <Card.Title title="Swipeable List Items" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.description}>
              Swipe left to reveal actions
            </Text>
            
            <SwipeableListItem
              rightActions={[
                {
                  text: 'Delete',
                  color: '#FF3B30',
                  icon: '🗑️',
                  onPress: () => console.log('Delete pressed'),
                },
                {
                  text: 'Edit',
                  color: '#007AFF',
                  icon: '✏️',
                  onPress: () => console.log('Edit pressed'),
                },
              ]}
              style={styles.swipeableItem}
            >
              <View style={styles.swipeableContent}>
                <Text variant="bodyLarge">🎮 Swipe me left</Text>
                <Text variant="bodySmall" style={styles.swipeHint}>
                  Try swiping to see actions
                </Text>
              </View>
            </SwipeableListItem>

            <SwipeableListItem
              leftActions={[
                {
                  text: 'Archive',
                  color: '#34C759',
                  icon: '📦',
                  onPress: () => console.log('Archive pressed'),
                },
              ]}
              rightActions={[
                {
                  text: 'Star',
                  color: '#FFD60A',
                  icon: '⭐',
                  onPress: () => console.log('Star pressed'),
                },
              ]}
              style={styles.swipeableItem}
            >
              <View style={styles.swipeableContent}>
                <Text variant="bodyLarge">⚡ Swipe both ways</Text>
                <Text variant="bodySmall" style={styles.swipeHint}>
                  Left: Archive | Right: Star
                </Text>
              </View>
            </SwipeableListItem>
          </Card.Content>
        </Card>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  section: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 12,
  },
  demoCard: {
    marginTop: 12,
  },
  interactiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  interactiveDemo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pulseItem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 12,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemDelay: {
    opacity: 0.5,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  loadingItem: {
    alignItems: 'center',
    marginBottom: 24,
    width: '45%',
  },
  loadingLabel: {
    marginTop: 12,
    opacity: 0.7,
  },
  swipeableItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  swipeableContent: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  swipeHint: {
    marginTop: 4,
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AnimationsDemoScreen;
