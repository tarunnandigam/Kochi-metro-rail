const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kmrl_metro';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const username = 'ZAB';
    const email = 'zab@example.com';
    const password = 'Zab@1234';

    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      user = await User.create({ fullName: 'Z A B', username, email, password, userType: 'customer' });
      console.log('Created user', username);
    } else {
      console.log('User already exists:', user.username);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
})();
