import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

const RefreshTokenSchema = new Schema({
  user_id: { type: Types.ObjectId, required: true, refPath: 'userModel' },
  token: { type: String, required: true, unique: true },
  revoked: { type: Boolean, default: false },
  expires_at: { type: Date, required: true },
  userModel: { type: String, enum: ['User', 'Doctor'], required: true }
}, { collection: 'refresh_tokens' })

export const RefreshToken = model('RefreshToken', RefreshTokenSchema)
