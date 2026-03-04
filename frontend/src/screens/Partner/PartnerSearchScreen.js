import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { getSchedules, createRequest } from '../../api';

export default function PartnerScreen({ currentUser }) {
  const [day, setDay] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [origin, setOrigin] = useState('');
  
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const query = {};
      if (day) query.day = day;
      if (timeSlot) query.timeSlot = timeSlot;
      if (origin) query.origin = origin;

      const res = await getSchedules(query);
      if (res.error) throw new Error(res.error);
      setResults(res);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleRequestRide = async (scheduleId) => {
    try {
      const result = await createRequest({ partnerId: currentUser._id, scheduleId });
      if (result.error) throw new Error(result.error);
      Alert.alert("Success", "Ride requested!");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.origin} to {item.destination}</Text>
      <Text>{item.day} - {item.timeSlot}</Text>
      <Text>Seats Available: {item.availableSeats}</Text>
      <Text>Driver: {item.driverId?.name}</Text>
      <View style={{marginTop: 10}}>
        <Button title="Request Ride" onPress={() => handleRequestRide(item._id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Rides</Text>
      
      <Text>Day (Optional)</Text>
      <TextInput style={styles.input} value={day} onChangeText={setDay} />

      <Text>Time Slot (Optional)</Text>
      <TextInput style={styles.input} value={timeSlot} onChangeText={setTimeSlot} />

      <Text>Origin (Optional)</Text>
      <TextInput style={styles.input} value={origin} onChangeText={setOrigin} />

      <Button title="Search" onPress={handleSearch} />

      <Text style={[styles.header, {marginTop: 20}]}>Available Rides</Text>
      <FlatList 
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No rides found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 20,
    marginTop: 100, // accommodate back button
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fafafa'
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  }
});
