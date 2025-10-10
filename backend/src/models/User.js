import mongoose from 'mongoose'

const { Schema, model } = mongoose

const UserSchema = new Schema({
  full_name: { type: String, required: true, trim: true },
  age: { type: Number, min: 0 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone_number: { type: String, trim: true },
  location: { type: String, trim: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, { collection: 'users' })

export const User = model('User', UserSchema)
