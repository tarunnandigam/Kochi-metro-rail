const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kmrl_metro';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const username = 'ZAB';
    const newPassword = 'Zab@1234';

    const user = await User.findOne({ username });
    if (!user) {
      console.error('User not found:', username);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log('Password reset for', username);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
})();
