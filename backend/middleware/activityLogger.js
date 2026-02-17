const Activity = require('../models/Activity');

// Simple activity logger middleware
module.exports = async function activityLogger(req, res, next) {
    try {
        // Only log important actions to reduce noise (you can expand this list)
        const toLogMethods = ['POST', 'PUT', 'DELETE'];
        const shouldLog = toLogMethods.includes(req.method) || req.path.startsWith('/api/news') || req.path.startsWith('/api/auth');

        if (!shouldLog) return next();

        const activity = new Activity({
            userId: req.body.userId || req.headers['x-user-id'] || null,
            userName: req.body.postedByName || req.body.username || null,
            userRole: req.body.postedByRole || req.headers['x-user-role'] || null,
            action: `${req.method} ${req.path}`,
            path: req.path,
            method: req.method,
            payload: Object.keys(req.body || {}).length ? req.body : undefined,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'] || ''
        });

        await activity.save();
    } catch (err) {
        console.error('Activity logger error:', err);
    } finally {
        next();
    }
};
