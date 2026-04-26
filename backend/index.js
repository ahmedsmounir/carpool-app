const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Auth
app.post('/api/register', async (req, res) => {
  try {
    const pool = getDB();
    const { name, email, password, role } = req.body;

    // Check email domain
    if (!email.endsWith('@giu-uni.de')) {
      return res.status(400).json({ error: 'Email must end in @giu-uni.de' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, is_verified, otp_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, email, password, role, false, otp]
    );
    res.status(201).json({ _id: result.rows[0].id, name, email, role, is_verified: false, message: 'OTP sent to email. Please verify.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const pool = getDB();
    const { email, password } = req.body;

    const result = await pool.query('SELECT id as _id, name, email, role, is_verified FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

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
    const pool = getDB();
    const { email, otp_code } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.otp_code !== otp_code) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    await pool.query('UPDATE users SET is_verified = true, otp_code = NULL WHERE email = $1', [email]);

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
    const pool = getDB();
    const result = await pool.query('SELECT id as _id, name, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const pool = getDB();
    const { name, email, password, role } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, password, role]
    );
    res.status(201).json({ _id: result.rows[0].id, name, email, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver schedules
app.post('/api/schedules', async (req, res) => {
  try {
    const pool = getDB();
    const { driverId, day, timeSlot, origin, destination, availableSeats, gasCost } = req.body;
    const result = await pool.query(
      'INSERT INTO schedules (driverId, day, timeSlot, origin, destination, availableSeats, gasCost) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [driverId, day, timeSlot, origin, destination, availableSeats, gasCost]
    );
    res.status(201).json({ _id: result.rows[0].id, driverId, day, timeSlot, origin, destination, availableSeats, gasCost });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner searches for schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const pool = getDB();
    const { day, timeSlot, origin, destination } = req.query;
    let query = 'SELECT schedules.id as _id, driverId, day, timeSlot, origin, destination, availableSeats, gasCost, users.name as driverName FROM schedules JOIN users ON schedules.driverId = users.id WHERE availableSeats > 0';
    const params = [];

    if (day) { params.push(day); query += ` AND day = $${params.length}`; }
    if (timeSlot) { params.push(timeSlot); query += ` AND timeSlot = $${params.length}`; }
    if (origin) { params.push(origin); query += ` AND origin = $${params.length}`; }
    if (destination) { params.push(destination); query += ` AND destination = $${params.length}`; }

    const { rows: schedules } = await pool.query(query, params);
    
    const formattedSchedules = schedules.map(s => ({
      _id: s._id,
      driverId: { _id: s.driverid, name: s.drivername },
      day: s.day,
      timeSlot: s.timeslot,
      origin: s.origin,
      destination: s.destination,
      availableSeats: s.availableseats,
      gasCost: s.gascost
    }));

    res.json(formattedSchedules);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get schedules for a specific driver
app.get('/api/schedules/driver/:driverId', async (req, res) => {
  try {
    const pool = getDB();
    const { driverId } = req.params;
    const result = await pool.query('SELECT id as _id, driverId, day, timeSlot, origin, destination, availableSeats, gasCost FROM schedules WHERE driverId = $1', [driverId]);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner requests a ride
app.post('/api/requests', async (req, res) => {
  try {
    const pool = getDB();
    const { ride_id, passenger_id } = req.body;
    const result = await pool.query(
      'INSERT INTO requests (ride_id, passenger_id, status) VALUES ($1, $2, $3) RETURNING id',
      [ride_id, passenger_id, 'pending']
    );
    res.status(201).json({ _id: result.rows[0].id, ride_id, passenger_id, status: 'pending' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get requests for a specific driver
app.get('/api/requests/driver/:driverId', async (req, res) => {
  try {
    const pool = getDB();
    const { driverId } = req.params;

    const result = await pool.query(`
      SELECT requests.id as _id, requests.ride_id, requests.passenger_id, requests.status, requests.splitAmount,
             users.name as passengerName,
             schedules.day, schedules.timeSlot, schedules.origin, schedules.destination, schedules.availableSeats, schedules.gasCost
      FROM requests
      JOIN schedules ON requests.ride_id = schedules.id
      JOIN users ON requests.passenger_id = users.id
      WHERE schedules.driverId = $1
    `, [driverId]);

    const formattedRequests = result.rows.map(r => ({
      _id: r._id,
      ride_id: {
        _id: r.ride_id,
        day: r.day,
        timeSlot: r.timeslot,
        origin: r.origin,
        destination: r.destination,
        availableSeats: r.availableseats,
        gasCost: r.gascost
      },
      passenger_id: {
        _id: r.passenger_id,
        name: r.passengername
      },
      status: r.status,
      splitAmount: r.splitamount
    }));

    res.json(formattedRequests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver accepts/declines a ride request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const pool = getDB();
    const { status } = req.body;
    const { id } = req.params;

    const requestRes = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    const request = requestRes.rows[0];

    if (status === 'accepted') {
      const scheduleRes = await pool.query('SELECT * FROM schedules WHERE id = $1', [request.ride_id]);
      const schedule = scheduleRes.rows[0];
      
      if (schedule.availableseats <= 0) return res.status(400).json({ error: 'No available seats' });

      const acceptedReqs = await pool.query('SELECT * FROM requests WHERE ride_id = $1 AND status = $2', [schedule.id, 'accepted']);
      const totalPeople = acceptedReqs.rows.length + 1 + 1; 
      const splitAmount = schedule.gascost / totalPeople;

      await pool.query('UPDATE requests SET status = $1, splitAmount = $2 WHERE id = $3', ['accepted', splitAmount, id]);
      await pool.query('UPDATE schedules SET availableSeats = availableSeats - 1 WHERE id = $1', [schedule.id]);
      await pool.query('UPDATE requests SET splitAmount = $1 WHERE ride_id = $2 AND status = $3', [splitAmount, schedule.id, 'accepted']);
      
      res.json({ _id: id, status: 'accepted', splitAmount });
    } else if (status === 'declined') {
      await pool.query('UPDATE requests SET status = $1 WHERE id = $2', ['declined', id]);
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
    const pool = getDB();
    const { userId } = req.params;

    const userRes = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const transactions = await pool.query(`
      SELECT t.id, t.sender_id, t.receiver_id, t.amount, t.ride_id, t.created_at as timestamp,
             s.name as sender_name, r.name as receiver_name
      FROM transactions t
      JOIN users s ON t.sender_id = s.id
      JOIN users r ON t.receiver_id = r.id
      WHERE t.sender_id = $1 OR t.receiver_id = $2
      ORDER BY t.created_at DESC
    `, [userId, userId]);

    res.json({ balance: userRes.rows[0].wallet_balance, transactions: transactions.rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/wallet/transfer', async (req, res) => {
  const pool = getDB();
  const client = await pool.connect(); // We MUST use a dedicated client for transactions in Postgres
  try {
    const { sender_id, receiver_id, amount, ride_id, request_id } = req.body;
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });

    await client.query('BEGIN');

    if (request_id) {
      const requestRes = await client.query('SELECT status FROM requests WHERE id = $1', [request_id]);
      if (requestRes.rows[0] && requestRes.rows[0].status === 'completed') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Ride already completed' });
      }
    }

    const senderRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [sender_id]);
    const receiverRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [receiver_id]);

    if (senderRes.rows.length === 0 || receiverRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    if (senderRes.rows[0].wallet_balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    await client.query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [amount, sender_id]);
    await client.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [amount, receiver_id]);

    const result = await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, ride_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [sender_id, receiver_id, amount, ride_id]
    );

    if (request_id) {
      await client.query('UPDATE requests SET status = $1 WHERE id = $2', ['completed', request_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ id: result.rows[0].id, sender_id, receiver_id, amount, ride_id, message: 'Transfer successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
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