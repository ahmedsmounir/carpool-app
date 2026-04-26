import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import DriverScreen from './screens/Driver/DriverDashboardScreen';
import PartnerScreen from './screens/Partner/PartnerSearchScreen';
import WalletScreen from './screens/WalletScreen';
import { login, register } from './api';
import { ThemeProvider, useTheme } from './ThemeContext';

const Stack = createNativeStackNavigator();

function AppNavigation() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { colors, toggleTheme, isDarkMode } = useTheme();

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const user = await login(credentials);
      setCurrentUser(user);
    } catch (e) {
      setLoading(false);
      throw e; // We MUST throw this so LoginScreen can catch it and show the OTP input!
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const res = await register(userData);
      return res;
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const headerRightComponent = (navigation) => (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Wallet')} style={styles.walletButton}>
        <Text style={[styles.walletText, { color: colors.text }]}>Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
        <Text style={[styles.themeText, { color: colors.text }]}>{isDarkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
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
              {props => <RegisterScreen {...props} route={{ params: { onRegister: handleRegister, onVerify: handleVerify } }} />}
            </Stack.Screen>
          </>
        ) : (
          // App Stack
          <>
            {currentUser.role === 'driver' ? (
              <Stack.Screen
                name="DriverDashboard"
                options={({ navigation }) => ({
                  title: 'Driver Dashboard',
                  headerRight: () => headerRightComponent(navigation)
                })}
              >
                {props => <DriverScreen {...props} currentUser={currentUser} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen
                name="PartnerSearch"
                options={({ navigation }) => ({
                  title: 'Partner Search',
                  headerRight: () => headerRightComponent(navigation)
                })}
              >
                {props => <PartnerScreen {...props} currentUser={currentUser} />}
              </Stack.Screen>
            )}

            <Stack.Screen
              name="Wallet"
              options={{
                title: 'My Wallet'
              }}
            >
              {props => <WalletScreen {...props} currentUser={currentUser} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    marginRight: 15,
  },
  themeText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  walletButton: {
    marginRight: 15,
  },
  walletText: {
    fontSize: 16,
    fontWeight: '600',
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
