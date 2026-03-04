const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  console.log(`MongoDB successfully connected to ${uri}`);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };
