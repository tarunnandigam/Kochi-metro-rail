const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kmrl_metro', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message || error);
        // Do not exit the process in development - allow server to run with in-memory fallbacks
        // so frontend can function for UI testing when MongoDB is not available.
        return;
    }
};

module.exports = connectDB;