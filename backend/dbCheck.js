const mongoose = require('mongoose');

// Adjust to your connect string if different
const URI = 'mongodb://127.0.0.1:27017/kmrl_metro';

async function checkDB() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to DB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        for (const c of collections) {
            const count = await mongoose.connection.db.collection(c.name).countDocuments();
            console.log(`- ${c.name}: ${count} documents`);
            const sample = await mongoose.connection.db.collection(c.name).findOne({});
            console.log(`  Sample:`, sample);
        }

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDB();
