import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { createSchedule, getRequestsForDriver, updateRequest, getSchedulesForDriver } from '../../api';
import { useTheme } from '../../ThemeContext';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5'];

export default function DriverScreen({ currentUser }) {
  const { colors, isDarkMode } = useTheme();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [gasCost, setGasCost] = useState('');

  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

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
    const day = selectedDay;
    const timeSlot = selectedPeriod;

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

      setModalVisible(false);
      setOrigin(''); setDestination(''); setAvailableSeats(''); setGasCost('');
      fetchData();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleCellClick = (day, period) => {
    const ride = schedules.find(s => s.day === day && s.timeSlot === period);
    if (ride) {
      Alert.alert("Ride Scheduled", `${ride.origin} to ${ride.destination}\nSeats: ${ride.availableSeats}\nGas: $${ride.gasCost}`);
      return;
    }

    setSelectedDay(day);
    setSelectedPeriod(period);
    setModalVisible(true);
  };

  const getCellContent = (day, period) => {
    const ride = schedules.find(s => s.day === day && s.timeSlot === period);
    if (ride) {
      return (
        <View style={[styles.scheduledCell, { backgroundColor: colors.primary }]}>
          <Text style={[styles.cellText, { color: colors.primaryText }]} numberOfLines={1}>{ride.destination}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.emptyCell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cellText, { color: colors.textMuted }]}>+</Text>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Weekly Schedule</Text>
      
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row */}
          <View style={styles.gridRow}>
            <View style={[styles.gridHeaderCell, { backgroundColor: colors.surface }]} />
            {PERIODS.map(period => (
              <View key={period} style={[styles.gridHeaderCell, { backgroundColor: colors.surface }]}>
                <Text style={[styles.gridHeaderText, { color: colors.text }]}>{period}</Text>
              </View>
            ))}
          </View>

          {/* Grid Rows */}
          {DAYS.map(day => (
            <View key={day} style={styles.gridRow}>
              <View style={[styles.gridHeaderCell, { backgroundColor: colors.surface }]}>
                <Text style={[styles.gridHeaderText, { color: colors.text }]}>{day.substring(0, 3)}</Text>
              </View>
              {PERIODS.map(period => (
                <TouchableOpacity
                  key={`${day}-${period}`}
                  style={styles.gridCell}
                  onPress={() => handleCellClick(day, period)}
                  activeOpacity={0.7}
                >
                  {getCellContent(day, period)}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal for adding a ride */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Ride for {selectedDay}, {selectedPeriod}</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Origin</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholder="Enter starting location" placeholderTextColor={colors.textMuted} value={origin} onChangeText={setOrigin} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Destination</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholder="Enter destination" placeholderTextColor={colors.textMuted} value={destination} onChangeText={setDestination} />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Seats</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholder="e.g. 3" placeholderTextColor={colors.textMuted} value={availableSeats} onChangeText={setAvailableSeats} keyboardType="numeric" />
              </View>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Gas Cost ($)</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]} placeholder="e.g. 15.00" placeholderTextColor={colors.textMuted} value={gasCost} onChangeText={setGasCost} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.border }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
                <Text style={[styles.actionButtonText, { color: colors.primaryText }]}>Post Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[styles.header, {marginTop: 30, color: colors.text }]}>Requests for your rides</Text>
      {requests.length === 0 ? <Text style={[styles.emptyText, { color: colors.textMuted }]}>No requests found.</Text> : null}
      
      {requests.map((item) => (
        <View key={`req-${item._id}`} style={[styles.listCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
          <Text style={[styles.listCardTitle, { color: colors.text }]}>{item.scheduleId?.origin} to {item.scheduleId?.destination}</Text>
          <Text style={[styles.listCardText, { color: colors.textSecondary }]}>Date/Time: {item.scheduleId?.day}, {item.scheduleId?.timeSlot}</Text>
          <Text style={[styles.listCardText, { color: colors.textSecondary }]}>Partner: {item.partnerId?.name}</Text>
          <Text style={[styles.listCardText, { color: colors.textSecondary }]}>Status: <Text style={styles.statusText(item.status)}>{item.status.toUpperCase()}</Text></Text>
          {item.status === 'accepted' && (
            <Text style={[styles.boldText, { color: colors.text }]}>Current Gas Split: ${item.splitAmount?.toFixed(2)}</Text>
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
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridHeaderCell: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  gridHeaderText: {
    fontWeight: '600',
    fontSize: 12,
  },
  gridCell: {
    width: 80,
    height: 60,
    margin: 2,
  },
  emptyCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  scheduledCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
  },
  cellText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  halfWidth: {
    width: '48%',
  },
  emptyText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  listCard: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  listCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  listCardText: {
    fontSize: 15,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 15,
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
