import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { enhancedScreenOptions, getDefaultTransition } from '../utils/screenTransitions';

// Import screens
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PokemonListScreen from '../screens/PokemonListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import PerformanceDashboardScreen from '../screens/PerformanceDashboardScreen';
import DeviceInfoScreen from '../screens/DeviceInfoScreen';
import TeamBuilderScreen from '../screens/TeamBuilderScreen';
import OpponentSelectionScreen from '../screens/OpponentSelectionScreen';
import BattleScreen from '../screens/BattleScreen';
import BattleHistoryScreen from '../screens/BattleHistoryScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { NotificationDemoScreen } from '../screens/NotificationDemoScreen';
import TournamentLobbyScreen from '../screens/TournamentLobbyScreen';
import TournamentBracketScreen from '../screens/TournamentBracketScreen';
import TournamentBattleScreen from '../screens/TournamentBattleScreen';
import AnimationsDemoScreen from '../screens/AnimationsDemoScreen';

// Import types
import type { RootStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useDeepLink } from '../hooks/useDeepLink';
import { Text } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = React.memo(() => {
  // Memoize tab bar options to prevent recreation
  const tabScreenOptions = React.useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Platform.OS === 'ios' ? '#f8f9fa' : '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e1e5e9',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        height: Platform.OS === 'ios' ? 80 : 60,
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8e8e93',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500' as const,
      },
    }),
    [],
  );

  // Memoize icon renderers to prevent recreation
  const renderPokemonIcon = React.useCallback(
    (props: { color: string }) => <PokemonIcon color={props.color} />,
    [],
  );
  const renderTeamIcon = React.useCallback(
    (props: { color: string }) => <TeamIcon color={props.color} />,
    [],
  );
  const renderPerformanceIcon = React.useCallback(
    (props: { color: string }) => <PerformanceIcon color={props.color} />,
    [],
  );
  const renderPersonIcon = React.useCallback(
    (props: { color: string }) => <PersonIcon color={props.color} />,
    [],
  );
  const renderSettingsIcon = React.useCallback(
    (props: { color: string }) => <SettingsIcon color={props.color} />,
    [],
  );

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="PokemonList"
        component={PokemonListScreen}
        options={{
          title: 'PokéDex',
          tabBarIcon: renderPokemonIcon,
        }}
      />
      <Tab.Screen
        name="TeamBuilder"
        component={TeamBuilderScreen}
        options={{
          title: 'Team',
          tabBarIcon: renderTeamIcon,
        }}
      />
      <Tab.Screen
        name="PerformanceDashboard"
        component={PerformanceDashboardScreen}
        options={{
          title: 'Performance',
          tabBarIcon: renderPerformanceIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: renderPersonIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: renderSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
});

// Tab icon components
const PokemonIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>🎮</Text>
));

const TeamIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>⚔️</Text>
));

const PerformanceIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>📊</Text>
));

const PersonIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>👤</Text>
));

const SettingsIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>⚙️</Text>
));

export const AppNavigator: React.FC = () => {
  // Use specific selectors instead of destructuring
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const [isInitialized, setIsInitialized] = React.useState(false);

  /**
   * Debug function to log why AppNavigator is re-rendering.
   * Only logs when specific values change.
   */
  React.useEffect(() => {
    console.log('AppNavigator auth state changed:', {
      isAuthenticated,
      isLoading,
      isInitialized,
    });
  }, [isAuthenticated, isLoading, isInitialized]);

  // Initialize deep linking (must be inside NavigationContainer)
  // Only get URL when it changes, don't store in local state
  const deepLinkUrl = useDeepLink().url;

  React.useEffect(() => {
    if (deepLinkUrl) {
      console.log('Deep link received:', deepLinkUrl);
    }
  }, [deepLinkUrl]);

  // Mark as initialized after first render to prevent flashing
  React.useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsInitialized(true);
      }
    }, 100); // Small delay to prevent flash

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Memoize components and options at the top level to prevent recreation

  const screenOptions = React.useMemo(
    () => ({
      ...enhancedScreenOptions.stack,
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: '600' as const,
      },
    }),
    [],
  );

  // Show loading spinner while checking auth state or during initialization
  // if (isLoading || !isInitialized) {
  //   return loadingComponent;
  // }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        // Auth Stack - shown when user is not authenticated
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              headerShown: true,
              title: 'Create Account',
            }}
          />
        </>
      ) : (
        // App Stack - shown when user is authenticated
        <>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PokemonDetail"
            component={PokemonDetailScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="OpponentSelection"
            component={OpponentSelectionScreen}
            options={{
              title: 'Choose Opponent',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="Battle"
            component={BattleScreen}
            options={{
              title: 'Battle',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="BattleHistory"
            component={BattleHistoryScreen}
            options={{
              title: 'Battle History',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{
              title: 'Notifications',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="NotificationDemo"
            component={NotificationDemoScreen}
            options={{
              title: 'Notification Navigation Demo',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="DeviceInfo"
            component={DeviceInfoScreen}
            options={{
              title: 'Device Information',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="TournamentLobby"
            component={TournamentLobbyScreen}
            options={{
              title: 'Tournament Lobby',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="TournamentBracket"
            component={TournamentBracketScreen}
            options={{
              title: 'Tournament Bracket',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="TournamentBattle"
            component={TournamentBattleScreen}
            options={{
              title: 'Tournament Battle',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="AnimationsDemo"
            component={AnimationsDemoScreen}
            options={{
              title: 'Animations Demo',
              headerShown: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
const navStyles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
