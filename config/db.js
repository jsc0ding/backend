import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use MongoDB Atlas if available, otherwise fallback to local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medqueue';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI:', mongoURI);
    
    // Connect with timeout options for Atlas
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    // Provide specific troubleshooting guidance for Atlas
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n🔧 Troubleshooting MongoDB Atlas Connection:');
      console.error('1. Check your internet connection');
      console.error('2. Verify the username and password in your MONGODB_URI');
      console.error('3. Ensure your IP address is whitelisted in MongoDB Atlas:');
      console.error('   - Log in to MongoDB Atlas');
      console.error('   - Go to Network Access in the left sidebar');
      console.error('   - Add your current IP address to the whitelist');
      console.error('4. Check if your cluster is paused (it should be "Running")');
      console.error('5. Try connecting with MongoDB Compass using the same URI');
    }
    
    console.log('\n⚠️  Server will continue running without database connection');
  }
};

export default connectDB;