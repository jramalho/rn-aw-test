import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';

// Import screens
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PokemonListScreen from '../screens/PokemonListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';

// Import types
import type { RootStackParamList } from '../types';

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

const PersonIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>👤</Text>
));

const SettingsIcon = React.memo(({ color }: { color: string }) => (
  <Text style={[navStyles.tabIcon, { color }]}>⚙️</Text>
));

export const AppNavigator: React.FC = () => {
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
    </Stack.Navigator>
  );
};

// Import Text from React Native
import { Text } from 'react-native';

const navStyles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});
