import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, ActivityIndicator, View } from 'react-native';

// Import screens
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PokemonListScreen from '../screens/PokemonListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import PerformanceDashboardScreen from '../screens/PerformanceDashboardScreen';
import TeamBuilderScreen from '../screens/TeamBuilderScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';

// Import types
import type { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Text } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
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
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="PokemonList" 
        component={PokemonListScreen}
          options={{
            title: 'PokéDex',
            tabBarIcon: ({ color }) => <PokemonIcon color={color} />,
          }}
      />
      <Tab.Screen 
        name="TeamBuilder" 
        component={TeamBuilderScreen}
          options={{
            title: 'Team',
            tabBarIcon: ({ color }) => <TeamIcon color={color} />,
          }}
      />
      <Tab.Screen 
        name="PerformanceDashboard" 
        component={PerformanceDashboardScreen}
          options={{
            title: 'Performance',
            tabBarIcon: ({ color }) => <PerformanceIcon color={color} />,
          }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <PersonIcon color={color} />,
          }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          }}
      />
    </Tab.Navigator>
  );
};

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
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <View style={navStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
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
              presentation: 'card'
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
        </>
      )}
    </Stack.Navigator>
  );
};

// Import Text from React Native
import { Text } from 'react-native';

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
