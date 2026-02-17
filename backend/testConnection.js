const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kmrl_metro';
        console.log('Attempting to connect to:', uri);
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB Connected Successfully');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Collections found:', collections.map(c => c.name));
        
        // Check users collection
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        console.log('👥 Users in database:', userCount);
        
        if (userCount > 0) {
            const users = await User.find({}, 'fullName email userType').limit(5);
            console.log('📝 Sample users:', users);
        }
        
        mongoose.connection.close();
        console.log('🔌 Connection closed');
        
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        process.exit(1);
    }
};

testConnection();