const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Request = require('./models/Request');

const app = express();
app.use(cors());
app.use(express.json());

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver schedules
app.post('/api/schedules', async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner searches for schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const { day, timeSlot, origin } = req.query;
    let query = {};
    if (day) query.day = day;
    if (timeSlot) query.timeSlot = timeSlot;
    if (origin) query.origin = origin;
    // ensure there are available seats
    query.availableSeats = { $gt: 0 };
    
    const schedules = await Schedule.find(query).populate('driverId', 'name');
    res.json(schedules);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner requests a ride
app.post('/api/requests', async (req, res) => {
  try {
    const request = new Request({ ...req.body, status: 'pending' });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get requests for a specific driver
app.get('/api/requests/driver/:driverId', async (req, res) => {
  try {
    const schedules = await Schedule.find({ driverId: req.params.driverId });
    const scheduleIds = schedules.map(s => s._id);
    const requests = await Request.find({ scheduleId: { $in: scheduleIds } })
      .populate('partnerId', 'name')
      .populate('scheduleId');
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Driver accepts/rejects a ride request
app.patch('/api/requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id).populate('scheduleId');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (status === 'accepted') {
      const schedule = await Schedule.findById(request.scheduleId._id);
      
      if (schedule.availableSeats <= 0) {
        return res.status(400).json({ error: 'No available seats' });
      }

      // Simple gas split calculation (divide gasCost equally among total passengers)
      // total passengers = original seats - current available seats + 1 (the driver) + 1 (the new accepted partner)
      // actually wait, this logic is up to interpretation, let's keep it simple: split amount = gasCost / (total people in car)
      // For simplicity let's assume "total people in car" when this is accepted is 2 (driver + 1 partner).
      // We'll update the logic slightly. Let's just say splitting the gas by all currently accepted requests + driver.
      
      const allAcceptedReqsCount = await Request.countDocuments({ scheduleId: schedule._id, status: 'accepted' });
      const totalPeople = allAcceptedReqsCount + 1 + 1; // current accepted + driver + this new person
      const splitAmount = schedule.gasCost / totalPeople;

      request.splitAmount = splitAmount;
      request.status = 'accepted';
      
      schedule.availableSeats -= 1;
      await schedule.save();

      // Recalculate split for all other accepted requests
      await Request.updateMany(
        { scheduleId: schedule._id, status: 'accepted' },
        { splitAmount: splitAmount }
      );

    } else if (status === 'rejected') {
      request.status = 'rejected';
    }

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Start server
if (require.main === module) {
  connectDB().then(() => {
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  });
}

module.exports = app;
