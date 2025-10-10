import mongoose from 'mongoose'

const { Schema, model } = mongoose

const DoctorSchema = new Schema({
  full_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone_number: { type: String, trim: true },
  clinic_location: { type: String, trim: true },
  license_number: { type: String, required: true, unique: true, trim: true },
  specialization: { type: String, trim: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, { collection: 'doctors' })

export const Doctor = model('Doctor', DoctorSchema)
