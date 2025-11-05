import mongoose from 'mongoose';

export const connectMongoDB = async (mongoUrl: string) => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB successfully', mongoUrl);
  } catch (error) {
    console.log('⚠️Connected to MongoDB failed', error);
    process.exit(1);
  }
};
