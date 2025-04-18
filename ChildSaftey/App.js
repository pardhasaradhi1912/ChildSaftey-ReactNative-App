import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import ProfileScreen from './ProfileScreen';
import HomeScreen from './HomeScreen';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator for Login and Signup screens
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

// Main App Navigator with Bottom Tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4A90E2',
      tabBarInactiveTintColor: 'gray',
      headerShown: true,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Root Navigator to handle auth state
const RootNavigator = () => {
  const { isLoggedIn, isLoading } = React.useContext(AuthContext);

  if (isLoading) {
    // Show a loading screen while we check if the user is logged in
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
};

export default App;