import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function MapComponent({ colors }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.icon, { color: colors.primary }]}>🗺️</Text>
      <Text style={[styles.title, { color: colors.text }]}>Live Map is only available on the mobile app</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Please download our mobile app to view driver locations and interact with the real-time map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  icon: {
    fontSize: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});
