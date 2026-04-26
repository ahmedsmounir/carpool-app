import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { verifyOTP } from '../../api'; // We need to import your API function!

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New States for the Verification Flow
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const { onLogin } = route.params || {};

  const handleLogin = async () => {
    try {
      if (onLogin) {
        // We catch the error locally first to see if it's the 403 Unverified error
        await onLogin({ email, password });
      }
    } catch (error) {
      if (error.message.includes('verify')) {
        // The server told us we aren't verified! Switch to the OTP screen.
        setIsVerifying(true);
      } else {
        // It was a normal error (like wrong password)
        Alert.alert("Login Failed", error.message);
      }
    }
  };

  const handleVerify = async () => {
    try {
      const verifiedUser = await verifyOTP(email, otpCode);
      Alert.alert("Success", "Email verified! You are now logged in.");
      // We manually trigger the login state now that we have the verified user object
      if (route.params?.onVerify) {
        route.params.onVerify(verifiedUser);
      } else {
         // Fallback if App.js isn't passing onVerify to LoginScreen
         onLogin({email, password}); 
      }
    } catch (error) {
      Alert.alert("Verification Failed", error.message);
    }
  };

  const handleRegisterNavigation = () => {
    navigation.navigate('Register');
  };

  // If the user needs to verify, show this screen instead
  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.content}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#888"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleVerify}>
              <Text style={styles.loginButtonText}>Verify & Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVerifying(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Normal Login Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegisterNavigation}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 32, fontWeight: '700', color: '#000000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666666', marginBottom: 40 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingVertical: 15, paddingHorizontal: 20, fontSize: 16, color: '#333333', borderWidth: 1, borderColor: '#e0e0e0' },
  loginButton: { backgroundColor: '#000000', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  loginButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  registerText: { color: '#666666', fontSize: 15 },
  registerLink: { color: '#000000', fontSize: 15, fontWeight: '600' },
  cancelButton: { marginTop: 20, alignItems: 'center' },
  cancelButtonText: { color: '#666666', fontSize: 16 }
});