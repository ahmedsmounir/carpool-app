import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, FlatList } from 'react-native';
import { createSchedule, getRequestsForDriver, updateRequest } from '../../api';

export default function DriverScreen({ currentUser }) {
  const [day, setDay] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [gasCost, setGasCost] = useState('');

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchRequests();
    }
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      const data = await getRequestsForDriver(currentUser._id);
      if (data.error) throw new Error(data.error);
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (reqId, status) => {
    try {
      const res = await updateRequest(reqId, { status });
      if (res.error) throw new Error(res.error);
      Alert.alert("Success", `Request ${status}`);
      fetchRequests(); // Refresh list to get updated splitAmount and status
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const scheduleData = {
        driverId: currentUser._id,
        day,
        timeSlot,
        origin,
        destination,
        availableSeats: parseInt(availableSeats),
        gasCost: parseFloat(gasCost)
      };
      const result = await createSchedule(scheduleData);
      if (result.error) throw new Error(result.error);
      Alert.alert("Success", "Schedule created!");
      // Reset form
      setDay(''); setTimeSlot(''); setOrigin(''); setDestination(''); setAvailableSeats(''); setGasCost('');
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create a Schedule</Text>
      
      <Text>Day (e.g. Monday)</Text>
      <TextInput style={styles.input} value={day} onChangeText={setDay} />

      <Text>Time Slot (e.g. Morning, 8:00 AM)</Text>
      <TextInput style={styles.input} value={timeSlot} onChangeText={setTimeSlot} />

      <Text>Origin</Text>
      <TextInput style={styles.input} value={origin} onChangeText={setOrigin} />

      <Text>Destination</Text>
      <TextInput style={styles.input} value={destination} onChangeText={setDestination} />

      <Text>Available Seats</Text>
      <TextInput style={styles.input} value={availableSeats} onChangeText={setAvailableSeats} keyboardType="numeric" />

      <Text>Total Gas Cost</Text>
      <TextInput style={styles.input} value={gasCost} onChangeText={setGasCost} keyboardType="numeric" />

      <Button title="Create Schedule" onPress={handleSubmit} />
      
      <Text style={[styles.header, {marginTop: 30}]}>Requests for your rides</Text>
      {requests.length === 0 ? <Text>No requests found.</Text> : null}
      
      {requests.map((item) => (
        <View key={item._id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.scheduleId?.origin} to {item.scheduleId?.destination}</Text>
          <Text>Day: {item.scheduleId?.day}, {item.scheduleId?.timeSlot}</Text>
          <Text>Partner: {item.partnerId?.name}</Text>
          <Text>Status: {item.status}</Text>
          {item.status === 'accepted' && (
            <Text style={{fontWeight: 'bold'}}>Current Gas Split: ${item.splitAmount?.toFixed(2)}</Text>
          )}

          {item.status === 'pending' && (
            <View style={styles.btnRow}>
              <Button title="Accept" onPress={() => handleStatusUpdate(item._id, 'accepted')} />
              <Button title="Reject" onPress={() => handleStatusUpdate(item._id, 'rejected')} color="red" />
            </View>
          )}
        </View>
      ))}

      <View style={{height: 100}} /> 
    </ScrollView>
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
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
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  }
});
