const mongoose = require('mongoose');

// Read URI from environment or fallback
const uri = 'mongodb+srv://harishvenuma_db_user:rTivvy4UjgQzXd73@xeno-cluster.aoqprqw.mongodb.net/?appName=xeno-cluster';

console.log('----------------------------------------------------');
console.log('Testing connection to MongoDB Atlas...');
console.log('URI:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password
console.log('----------------------------------------------------');

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('🎉 SUCCESS: Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ ERROR: Connection failed!');
    console.error('\nDetails of the error:');
    console.error(err.message || err);
    console.log('----------------------------------------------------');
    console.log('👉 TROUBLESHOOTING STEPS:');
    if (err.message && err.message.includes('IP')) {
      console.log('1. IP Address Whitelisting: Your IP is not whitelisted on MongoDB Atlas.');
    } else {
      console.log('1. IP Address Whitelisting: Ensure your current IP is whitelisted in MongoDB Atlas.');
    }
    console.log('2. Network/VPN: If you are behind a corporate firewall or VPN, port 27017 might be blocked.');
    console.log('3. Credentials: Check if the username or password in .env.local has changed.');
    console.log('4. Local MongoDB Fallback: If Atlas is blocked, you can run a local MongoDB server using:');
    console.log('   "mongod"');
    console.log('   And change MONGODB_URI in your .env.local to:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/marketing-copilot');
    console.log('----------------------------------------------------');
    process.exit(1);
  });
