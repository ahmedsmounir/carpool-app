import { Platform } from 'react-native';

// Use your local network IP if testing on physical device, or localhost for simulator
// In Android emulator, localhost is 10.0.2.2.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
};

export const register = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
};

export const verifyOTP = async (email, otp_code) => {
  const res = await fetch(`${API_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp_code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Verification failed');
  }
  return data;
};

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
};

export const createUser = async (userData) => {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const getRequestsForDriver = async (driverId) => {
  const res = await fetch(`${API_URL}/requests/driver/${driverId}`);
  return res.json();
};

export const getSchedulesForDriver = async (driverId) => {
  const res = await fetch(`${API_URL}/schedules/driver/${driverId}`);
  return res.json();
};

export const createSchedule = async (scheduleData) => {
  const res = await fetch(`${API_URL}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
  return res.json();
};

export const getSchedules = async (query) => {
  const params = new URLSearchParams(query).toString();
  const res = await fetch(`${API_URL}/schedules?${params}`);
  return res.json();
};

export const createRequest = async (requestData) => {
  const res = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  return res.json();
};

export const updateRequest = async (id, statusData) => {
  const res = await fetch(`${API_URL}/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statusData),
  });
  return res.json();
};
