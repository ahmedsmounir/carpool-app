import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, ActivityIndicator } from 'react-native';
import DriverScreen from './screens/Driver/DriverDashboardScreen';
import PartnerScreen from './screens/Partner/PartnerSearchScreen';
import { getUsers, createUser } from './api';

export default function App() {
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // A very simple login simulation: create user if doesn't exist, else grab first matching role
  const handleRoleSelection = async (selectedRole) => {
    setLoading(true);
    try {
      const users = await getUsers();
      let user = users.find(u => u.role === selectedRole);
      
      if (!user) {
        // Create a dummy user for this role if one doesn't exist in DB
        const result = await createUser({
          name: selectedRole === 'driver' ? 'Alice Driver' : 'Bob Partner',
          role: selectedRole
        });
        user = result;
      }
      setCurrentUser(user);
      setRole(selectedRole);
    } catch (e) {
      console.error(e);
      alert("Error connecting to backend: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!role) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>College Carpool App</Text>
        <Text style={styles.subtitle}>Select your role</Text>
        <View style={styles.buttonContainer}>
          <Button title="I am a Driver" onPress={() => handleRoleSelection('driver')} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="I am a Partner (Passenger)" onPress={() => handleRoleSelection('partner')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => { setRole(null); setCurrentUser(null); }} />
        <Text style={styles.headerTitle}>{role === 'driver' ? 'Driver Mode' : 'Partner Mode'}</Text>
      </View>
      {role === 'driver' ? (
        <DriverScreen currentUser={currentUser} />
      ) : (
        <PartnerScreen currentUser={currentUser} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    top: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  }
});
