import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { Doctor } from '../models/Doctor.js'

export const signupPatientValidators = [
  body('full_name').isString().trim().isLength({ min: 2 }).withMessage('full_name is required'),
  body('email')
    .isEmail()
    .withMessage('valid email is required')
    .bail()
    .normalizeEmail()
    .custom(async (email) => {
      // ensure email isn't already in use by either patients or doctors
      const user = await User.findOne({ email })
      const doctor = await Doctor.findOne({ email })
      if (user || doctor) return Promise.reject('Email already in use')
      return true
    }),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('age').optional().isInt({ min: 0 }).withMessage('age must be a positive integer'),
  body('gender').optional().isIn(['male','female','other']).withMessage('invalid gender')
]

export const signupDoctorValidators = [
  body('full_name').isString().trim().isLength({ min: 2 }).withMessage('full_name is required'),
  body('email')
    .isEmail()
    .withMessage('valid email is required')
    .bail()
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email })
      const doctor = await Doctor.findOne({ email })
      if (user || doctor) return Promise.reject('Email already in use')
      return true
    }),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('license_number').isString().trim().notEmpty().withMessage('license_number is required')
]

export const loginValidators = [
  body('email').isEmail().withMessage('valid email is required'),
  body('password').notEmpty().withMessage('password is required')
]

// Accept refresh token in body or in header `x-refresh-token` or Authorization: Bearer <token>
export const refreshValidators = [
  body().custom((_, { req }) => {
    const fromBody = req.body && req.body.refreshToken
    const fromHeader = req.get('x-refresh-token')
    const auth = req.get('authorization') || ''
    const fromAuth = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!fromBody && !fromHeader && !fromAuth) throw new Error('refreshToken is required (body or x-refresh-token header or Authorization Bearer)')
    return true
  })
]

export const logoutValidators = [
  body().custom((_, { req }) => {
    const fromBody = req.body && req.body.refreshToken
    const fromHeader = req.get('x-refresh-token')
    const auth = req.get('authorization') || ''
    const fromAuth = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!fromBody && !fromHeader && !fromAuth) throw new Error('refreshToken is required (body or x-refresh-token header or Authorization Bearer)')
    return true
  })
]

// middleware to run after the validators in the route
export function handleValidation(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}
