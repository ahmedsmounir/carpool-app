const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  splitAmount: { type: Number }, // To be calculated when accepted
});

module.exports = mongoose.model('Request', requestSchema);
