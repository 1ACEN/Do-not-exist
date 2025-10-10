import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { RefreshToken } from "../models/RefreshToken.js";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
} from "../utils/auth.js";

export async function login(req, res) {
  try {
    const { email, password, type } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    let account = null;
    let role = null;
    if (type === "doctor") {
      account = await Doctor.findOne({ email });
      role = "doctor";
    } else if (type === "patient") {
      account = await User.findOne({ email });
      role = "patient";
    } else {
      account = await User.findOne({ email });
      role = "patient";
      if (!account) {
        account = await Doctor.findOne({ email });
        role = "doctor";
      }
    }

    if (!account)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, account.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = createAccessToken({ id: account._id, type: role });
    const refreshToken = createRefreshToken({ id: account._id, type: role });

    const refreshDoc = new RefreshToken({
      user_id: account._id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userModel: role === "doctor" ? "Doctor" : "User",
    });
    await refreshDoc.save();

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "Strict" : "Lax",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: account._id,
        email: account.email,
        full_name: account.full_name,
        role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
