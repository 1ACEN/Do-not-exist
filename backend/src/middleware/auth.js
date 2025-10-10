import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing or invalid Authorization header' })

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    // attach payload to request
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
