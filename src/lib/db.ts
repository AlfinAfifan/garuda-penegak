import mongoose from 'mongoose';
import { connected } from 'process';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/garuda-scout';

const connect = async () => {
  const connectionState = mongoose.connection.readyState;
  
  if (connectionState === 1) {
    console.log('Already connected to MongoDB');
    return;
  }

  if (connectionState === 2) {
    console.log('Connecting to MongoDB...');
    return;
  }

  try {
    mongoose.connect(MONGODB_URI, {
        dbName: 'garuda-scout',
        bufferCommands: true,
    })
    console.log(connected);
  } catch (error: any) {
    console.log("Error connecting to MongoDB:", error);
    throw new Error('Error', error);
  }
};

export default connect;