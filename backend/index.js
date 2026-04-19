const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Auth
app.post('/api/register', async (req, res) => {
  try {
    const db = getDB();
    const { name, email, password, role } = req.body;

    // Check email domain
    if (!email.endsWith('@giu-uni.de')) {
      return res.status(400).json({ error: 'Email must end in @giu-uni.de' });
    }

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);

    const result = await db.run(
      'INSERT INTO users (name, email, password, role, is_verified, otp_code) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role, 0, otp]
    );
    res.status(201).json({ _id: result.lastID, name, email, role, is_verified: false, message: 'OTP sent to email. Please verify.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    const user = await db.get('SELECT id as _id, name, email, role, is_verified FROM users WHERE email = ? AND password = ?', [email, password]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email address before logging in.', unverifiedUser: user });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/verify', async (req, res) => {
  try {
    const db = getDB();
    const { email, otp_code } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp_code !== otp_code) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    await db.run('UPDATE users SET is_verified = 1, otp_code = NULL WHERE email = ?', [email]);

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: true
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const db = getDB();
    const users = await db.all('SELECT id as _id, name, email, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const db = getDB();
    const { name, email, password, role } = req.body;
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    res.status(201).json({ _id: result.lastID, name, email, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver schedules
app.post('/api/schedules', async (req, res) => {
  try {
    const db = getDB();
    const { driverId, day, timeSlot, origin, destination, availableSeats, gasCost } = req.body;
    const result = await db.run(
      'INSERT INTO schedules (driverId, day, timeSlot, origin, destination, availableSeats, gasCost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [driverId, day, timeSlot, origin, destination, availableSeats, gasCost]
    );
    res.status(201).json({ _id: result.lastID, driverId, day, timeSlot, origin, destination, availableSeats, gasCost });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner searches for schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const db = getDB();
    const { day, timeSlot, origin, destination } = req.query;
    let query = 'SELECT schedules.id as _id, driverId, day, timeSlot, origin, destination, availableSeats, gasCost, users.name as driverName FROM schedules JOIN users ON schedules.driverId = users.id WHERE availableSeats > 0';
    const params = [];

    if (day) {
      query += ' AND day = ?';
      params.push(day);
    }
    if (timeSlot) {
      query += ' AND timeSlot = ?';
      params.push(timeSlot);
    }
    if (origin) {
      query += ' AND origin = ?';
      params.push(origin);
    }
    if (destination) {
      query += ' AND destination = ?';
      params.push(destination);
    }

    const schedules = await db.all(query, params);
    
    // Map output to match frontend expectations
    const formattedSchedules = schedules.map(s => ({
      _id: s._id,
      driverId: {
        _id: s.driverId,
        name: s.driverName
      },
      day: s.day,
      timeSlot: s.timeSlot,
      origin: s.origin,
      destination: s.destination,
      availableSeats: s.availableSeats,
      gasCost: s.gasCost
    }));

    res.json(formattedSchedules);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get schedules for a specific driver
app.get('/api/schedules/driver/:driverId', async (req, res) => {
  try {
    const db = getDB();
    const { driverId } = req.params;
    const schedules = await db.all('SELECT id as _id, driverId, day, timeSlot, origin, destination, availableSeats, gasCost FROM schedules WHERE driverId = ?', [driverId]);
    res.json(schedules);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner requests a ride
app.post('/api/requests', async (req, res) => {
  try {
    const db = getDB();
    const { ride_id, passenger_id } = req.body;
    const result = await db.run(
      'INSERT INTO requests (ride_id, passenger_id, status) VALUES (?, ?, ?)',
      [ride_id, passenger_id, 'pending']
    );
    res.status(201).json({ _id: result.lastID, ride_id, passenger_id, status: 'pending' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get requests for a specific driver
app.get('/api/requests/driver/:driverId', async (req, res) => {
  try {
    const db = getDB();
    const { driverId } = req.params;

    // Get schedules for this driver
    const requests = await db.all(`
      SELECT requests.id as _id, requests.ride_id, requests.passenger_id, requests.status, requests.splitAmount,
             users.name as passengerName,
             schedules.day, schedules.timeSlot, schedules.origin, schedules.destination, schedules.availableSeats, schedules.gasCost
      FROM requests
      JOIN schedules ON requests.ride_id = schedules.id
      JOIN users ON requests.passenger_id = users.id
      WHERE schedules.driverId = ?
    `, [driverId]);

    const formattedRequests = requests.map(r => ({
      _id: r._id,
      ride_id: {
        _id: r.ride_id,
        day: r.day,
        timeSlot: r.timeSlot,
        origin: r.origin,
        destination: r.destination,
        availableSeats: r.availableSeats,
        gasCost: r.gasCost
      },
      passenger_id: {
        _id: r.passenger_id,
        name: r.passengerName
      },
      status: r.status,
      splitAmount: r.splitAmount
    }));

    res.json(formattedRequests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver accepts/declines a ride request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    const { id } = req.params;

    const request = await db.get('SELECT * FROM requests WHERE id = ?', [id]);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (status === 'accepted') {
      const schedule = await db.get('SELECT * FROM schedules WHERE id = ?', [request.ride_id]);
      
      if (schedule.availableSeats <= 0) {
        return res.status(400).json({ error: 'No available seats' });
      }

      const allAcceptedReqs = await db.all('SELECT * FROM requests WHERE ride_id = ? AND status = ?', [schedule.id, 'accepted']);
      const allAcceptedReqsCount = allAcceptedReqs.length;
      
      const totalPeople = allAcceptedReqsCount + 1 + 1; // current accepted + driver + this new person
      const splitAmount = schedule.gasCost / totalPeople;

      await db.run('UPDATE requests SET status = ?, splitAmount = ? WHERE id = ?', ['accepted', splitAmount, id]);
      await db.run('UPDATE schedules SET availableSeats = availableSeats - 1 WHERE id = ?', [schedule.id]);
      await db.run('UPDATE requests SET splitAmount = ? WHERE ride_id = ? AND status = ?', [splitAmount, schedule.id, 'accepted']);
      
      res.json({ _id: id, status: 'accepted', splitAmount });
    } else if (status === 'declined') {
      await db.run('UPDATE requests SET status = ? WHERE id = ?', ['declined', id]);
      res.json({ _id: id, status: 'declined' });
    } else {
      res.status(400).json({ error: 'Invalid status' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Wallet
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.params;

    const user = await db.get('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await db.all(`
      SELECT t.id, t.sender_id, t.receiver_id, t.amount, t.ride_id, t.timestamp,
             s.name as sender_name, r.name as receiver_name
      FROM transactions t
      JOIN users s ON t.sender_id = s.id
      JOIN users r ON t.receiver_id = r.id
      WHERE t.sender_id = ? OR t.receiver_id = ?
      ORDER BY t.timestamp DESC
    `, [userId, userId]);

    res.json({
      balance: user.wallet_balance,
      transactions: transactions
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/wallet/transfer', async (req, res) => {
  try {
    const db = getDB();
    const { sender_id, receiver_id, amount, ride_id, request_id } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    // Begin a transaction
    await db.run('BEGIN TRANSACTION');

    if (request_id) {
      const request = await db.get('SELECT status FROM requests WHERE id = ?', [request_id]);
      if (request && request.status === 'completed') {
        await db.run('ROLLBACK');
        return res.status(400).json({ error: 'Ride already completed' });
      }
    }

    const sender = await db.get('SELECT wallet_balance FROM users WHERE id = ?', [sender_id]);
    const receiver = await db.get('SELECT wallet_balance FROM users WHERE id = ?', [receiver_id]);

    if (!sender || !receiver) {
      await db.run('ROLLBACK');
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    if (sender.wallet_balance < amount) {
      await db.run('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    await db.run('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [amount, sender_id]);
    await db.run('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, receiver_id]);

    const result = await db.run(
      'INSERT INTO transactions (sender_id, receiver_id, amount, ride_id) VALUES (?, ?, ?, ?)',
      [sender_id, receiver_id, amount, ride_id]
    );

    if (request_id) {
      // Mark the request as completed so it can't be completed again
      await db.run('UPDATE requests SET status = ? WHERE id = ?', ['completed', request_id]);
    }

    await db.run('COMMIT');

    res.status(201).json({
      id: result.lastID,
      sender_id,
      receiver_id,
      amount,
      ride_id,
      message: 'Transfer successful'
    });
  } catch (err) {
    const db = getDB();
    await db.run('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Carpool API is running on port ${PORT}`);
    });
  });
}

module.exports = app;