import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { getUsers, createUser } from '../../api';

export default function AuthScreen({ onRoleSelect }) {
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (selectedRole) => {
    setLoading(true);
    try {
      const users = await getUsers();
      let user = users.find(u => u.role === selectedRole);
      
      if (!user) {
        const result = await createUser({
          name: selectedRole === 'driver' ? 'Alice Driver' : 'Bob Partner',
          role: selectedRole
        });
        user = result;
      }
      onRoleSelect(selectedRole, user);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Error connecting to backend: " + e.message);
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
});