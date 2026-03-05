import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { createSchedule, getRequestsForDriver, updateRequest, getSchedulesForDriver } from '../../api';

export default function DriverScreen({ currentUser }) {
  const [day, setDay] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [gasCost, setGasCost] = useState('');

  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const reqData = await getRequestsForDriver(currentUser._id);
      if (reqData.error) throw new Error(reqData.error);
      setRequests(reqData);

      const schedData = await getSchedulesForDriver(currentUser._id);
      if (schedData.error) throw new Error(schedData.error);
      setSchedules(schedData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (reqId, status) => {
    try {
      const res = await updateRequest(reqId, { status });
      if (res.error) throw new Error(res.error);
      Alert.alert("Success", `Request ${status}`);
      fetchData(); // Refresh list to get updated splitAmount and status
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleSubmit = async () => {
    if (!day || !timeSlot || !origin || !destination || !availableSeats || !gasCost) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

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
      fetchData();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Post a New Ride</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Day</Text>
        <TextInput style={styles.input} placeholder="e.g. Monday" placeholderTextColor="#aaa" value={day} onChangeText={setDay} />

        <Text style={styles.label}>Departure Time</Text>
        <TextInput style={styles.input} placeholder="e.g. 8:00 AM" placeholderTextColor="#aaa" value={timeSlot} onChangeText={setTimeSlot} />

        <Text style={styles.label}>Origin</Text>
        <TextInput style={styles.input} placeholder="Enter starting location" placeholderTextColor="#aaa" value={origin} onChangeText={setOrigin} />

        <Text style={styles.label}>Destination</Text>
        <TextInput style={styles.input} placeholder="Enter destination" placeholderTextColor="#aaa" value={destination} onChangeText={setDestination} />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Available Seats</Text>
            <TextInput style={styles.input} placeholder="e.g. 3" placeholderTextColor="#aaa" value={availableSeats} onChangeText={setAvailableSeats} keyboardType="numeric" />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Total Gas Cost ($)</Text>
            <TextInput style={styles.input} placeholder="e.g. 15.00" placeholderTextColor="#aaa" value={gasCost} onChangeText={setGasCost} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Post Ride</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.header, {marginTop: 30}]}>Your Posted Rides</Text>
      {schedules.length === 0 ? <Text style={styles.emptyText}>You haven't posted any rides yet.</Text> : null}

      {schedules.map((item) => (
        <View key={`sched-${item._id}`} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{item.origin} to {item.destination}</Text>
          <Text style={styles.listCardText}>Date/Time: {item.day}, {item.timeSlot}</Text>
          <Text style={styles.listCardText}>Seats: {item.availableSeats} | Gas: ${item.gasCost}</Text>
        </View>
      ))}

      <Text style={[styles.header, {marginTop: 30}]}>Requests for your rides</Text>
      {requests.length === 0 ? <Text style={styles.emptyText}>No requests found.</Text> : null}
      
      {requests.map((item) => (
        <View key={`req-${item._id}`} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{item.scheduleId?.origin} to {item.scheduleId?.destination}</Text>
          <Text style={styles.listCardText}>Date/Time: {item.scheduleId?.day}, {item.scheduleId?.timeSlot}</Text>
          <Text style={styles.listCardText}>Partner: {item.partnerId?.name}</Text>
          <Text style={styles.listCardText}>Status: <Text style={styles.statusText(item.status)}>{item.status.toUpperCase()}</Text></Text>
          {item.status === 'accepted' && (
            <Text style={styles.boldText}>Current Gas Split: ${item.splitAmount?.toFixed(2)}</Text>
          )}

          {item.status === 'pending' && (
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleStatusUpdate(item._id, 'accepted')}>
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleStatusUpdate(item._id, 'rejected')}>
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
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
    marginTop: 60,
    backgroundColor: '#F5F5F5', // Light gray background
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  halfWidth: {
    width: '48%',
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: '#777',
    fontStyle: 'italic',
  },
  listCard: {
    padding: 18,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#000', // Modern accent color
  },
  listCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    marginBottom: 6,
  },
  listCardText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginTop: 4,
  },
  statusText: (status) => ({
    fontWeight: '700',
    color: status === 'accepted' ? '#28a745' : status === 'rejected' ? '#dc3545' : '#f0ad4e',
  }),
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
