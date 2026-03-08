import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, FlatList, TouchableOpacity } from 'react-native';
import { getSchedules, createRequest } from '../../api';
import { useTheme } from '../../ThemeContext';
import MapComponent from './MapComponent';

export default function PartnerScreen({ currentUser }) {
  const { colors, isDarkMode } = useTheme();
  const [day, setDay] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [origin, setOrigin] = useState('');
  
  const [results, setResults] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const fetchRides = async (query = {}) => {
    try {
      const res = await getSchedules(query);
      if (res.error) throw new Error(res.error);
      setResults(res);
    } catch (e) {
      Alert.alert("Error fetching rides", e.message);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = () => {
    const query = {};
    if (day) query.day = day;
    if (timeSlot) query.timeSlot = timeSlot;
    if (origin) query.origin = origin;

    fetchRides(query);
  };

  const handleRequestRide = async (ride_id) => {
    try {
      const result = await createRequest({ passenger_id: currentUser._id, ride_id });
      if (result.error) throw new Error(result.error);
      Alert.alert("Success", "Ride requested!");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.origin} → {item.destination}</Text>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, { color: colors.primaryText }]}>{item.availableSeats} Seats</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Day:</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{item.day}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Time:</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{item.timeSlot}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Driver:</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{item.driverId?.name}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.requestBtn, { backgroundColor: colors.primary }]}
        onPress={() => handleRequestRide(item._id)}
      >
        <Text style={[styles.requestBtnText, { color: colors.primaryText }]}>Request Ride</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.text }]}>Find a Ride</Text>
        <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' ? { color: colors.primaryText } : { color: colors.textSecondary }]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' ? { color: colors.primaryText } : { color: colors.textSecondary }]}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Day</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            value={day}
            onChangeText={setDay}
            placeholder="Any"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Time Slot</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            value={timeSlot}
            onChangeText={setTimeSlot}
            placeholder="Any"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Origin</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            value={origin}
            onChangeText={setOrigin}
            placeholder="Any"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Text style={[styles.searchBtnText, { color: colors.primaryText }]}>Search Available Rides</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <>
          <Text style={[styles.subHeader, { color: colors.text }]}>Available Rides</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No rides found. Try adjusting your search.</Text>
              </View>
            }
          />
        </>
      ) : (
        <MapComponent results={results} colors={colors} isDarkMode={isDarkMode} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 15,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  searchBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  searchBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  requestBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  }
});
