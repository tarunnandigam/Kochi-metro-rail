const mongoose = require('mongoose');

const FareSchema = new mongoose.Schema({
    fromStation: {
        type: String,
        required: [true, 'From station is required']
    },
    toStation: {
        type: String,
        required: [true, 'To station is required']
    },
    distance: {
        type: Number,
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Fare', FareSchema);
