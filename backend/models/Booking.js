const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    fromStation: { type: String, required: true },
    toStation: { type: String, required: true },
    passengerName: { type: String },
    passengerPhone: { type: String },
    fare: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
