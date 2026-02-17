const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const metroRoutes = require('./routes/metro');
const dashboardRoutes = require('./routes/dashboard');
const linesRoutes = require('./routes/lines');
const newsRoutes = require('./routes/news');
const fareRoutes = require('./routes/fare');
const activityLogger = require('./middleware/activityLogger');
const activityRoutes = require('./routes/activity');
require('dotenv').config();

const app = express();


// Connect to MongoDB
connectDB();

// Create default test users if none exist (development convenience)
const User = require('./models/User');
const ensureTestUsers = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            console.log('No users found — creating default test users');
            await User.create({
                fullName: 'Test User',
                email: 'test@example.com',
                username: 'testuser',
                password: 'Test@1234',
                userType: 'customer'
            });
            await User.create({
                fullName: 'Z A B',
                email: 'zab@example.com',
                username: 'ZAB',
                password: 'Zab@1234',
                userType: 'customer'
            });
            console.log('Default users created: testuser / ZAB (passwords: Test@1234 / Zab@1234)');
        }
    } catch (err) {
        console.error('Error creating test users:', err.message);
    }
};
ensureTestUsers();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Activity logger - logs important user/admin actions to MongoDB
app.use(activityLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/metro', metroRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lines', linesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/fare', fareRoutes);
app.use('/api/activity', activityRoutes);

// Welcome route
app.get('/api/welcome', (req, res) => {
    res.json({
        message: 'Welcome to Kochi Metro Rail Limited (KMRL)',
        description: 'AI-Driven Train Induction Planning & Scheduling System',
        version: '1.0.0',
        endpoints: {
            auth: ['/api/auth/signup', '/api/auth/login'],
            metro: ['/api/metro/stations', '/api/metro/calculate-fare'],
            news: ['/api/news/all', '/api/news/create'],
            fare: ['/api/fare/stations', '/api/fare/calculate-fare']
        }
    });
});

// Note: frontend static serving removed to keep backend and frontend running on separate ports

const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`KMRL Metro System API is ready`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} in use, trying port ${port + 1}...`);
            setTimeout(() => startServer(port + 1), 500);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
};

startServer(PORT);