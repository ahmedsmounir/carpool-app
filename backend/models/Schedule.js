const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  timeSlot: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  gasCost: { type: Number, required: true },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
