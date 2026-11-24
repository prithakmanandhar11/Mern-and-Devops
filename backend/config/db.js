const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from the environment variables.
 * The function throws on failure so the caller can decide how to handle it.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Add it to backend/.env');
  }

  // Fail fast instead of buffering queries for 10 seconds when Atlas is unreachable.
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};

module.exports = connectDB;
