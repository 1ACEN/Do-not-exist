import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_SALT_ROUNDS = 10;

export async function hashPassword(password, rounds = DEFAULT_SALT_ROUNDS) {
  if (!password) throw new Error("Password is required");
  return bcrypt.hash(password, rounds);
}

export async function comparePassword(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}



// Access and refresh token helpers
export function createAccessToken(payload) {
  const expiresIn = process.env.TOKEN_EXPIRY || "15m";
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET for access tokens");
  return jwt.sign(payload, secret, { expiresIn });
}

export function createRefreshToken(payload) {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || "7d";
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret)
    throw new Error(
      "Missing REFRESH_TOKEN_SECRET or JWT_SECRET for refresh tokens"
    );
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET for access tokens");
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret)
    throw new Error(
      "Missing REFRESH_TOKEN_SECRET or JWT_SECRET for refresh tokens"
    );
  return jwt.verify(token, secret);
}
