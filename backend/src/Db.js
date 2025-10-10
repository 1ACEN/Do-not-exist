// db.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

export const mongodb = async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};



