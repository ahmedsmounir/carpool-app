import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import DriverScreen from './screens/Driver/DriverDashboardScreen';
import PartnerScreen from './screens/Partner/PartnerSearchScreen';
import { login, register } from './api';

const Stack = createNativeStackNavigator();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const user = await login(credentials);
      setCurrentUser(user);
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const user = await register(userData);
      setCurrentUser(user);
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!currentUser ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {props => <LoginScreen {...props} route={{ params: { onLogin: handleLogin } }} />}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              options={{ headerShown: false }}
            >
              {props => <RegisterScreen {...props} route={{ params: { onRegister: handleRegister } }} />}
            </Stack.Screen>
          </>
        ) : (
          // App Stack
          <>
            {currentUser.role === 'driver' ? (
              <Stack.Screen
                name="DriverDashboard"
                options={{
                  title: 'Driver Dashboard',
                  headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                      <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                  )
                }}
              >
                {props => <DriverScreen {...props} currentUser={currentUser} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen
                name="PartnerSearch"
                options={{
                  title: 'Partner Search',
                  headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                      <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                  )
                }}
              >
                {props => <PartnerScreen {...props} currentUser={currentUser} />}
              </Stack.Screen>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoutButton: {
    marginRight: 15,
  },
  logoutText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  }
});
