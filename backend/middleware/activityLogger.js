const Activity = require('../models/Activity');

// Simple activity logger middleware
module.exports = async function activityLogger(req, res, next) {
    try {
        // Only log important actions to reduce noise (you can expand this list)
        const toLogMethods = ['POST', 'PUT', 'DELETE'];
        const shouldLog = toLogMethods.includes(req.method) || req.path.startsWith('/api/news') || req.path.startsWith('/api/auth');

        if (!shouldLog) {
            next();
            return;
        }

        let safePayload = undefined;
        if (req.body && Object.keys(req.body).length) {
            safePayload = { ...req.body };
            if (safePayload.password) safePayload.password = '[REDACTED]';
            if (safePayload.confirmPassword) safePayload.confirmPassword = '[REDACTED]';
        }

        const activity = new Activity({
            userId: req.body.userId || req.headers['x-user-id'] || null,
            userName: req.body.postedByName || req.body.username || null,
            userRole: req.body.postedByRole || req.headers['x-user-role'] || null,
            action: `${req.method} ${req.path}`,
            path: req.path,
            method: req.method,
            payload: safePayload,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'] || ''
        });

        await activity.save();
        next();
    } catch (err) {
        console.error('Activity logger error:', err);
        next();
    }
};
