import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { RefreshToken } from "../models/RefreshToken.js";
import {
  hashPassword,
  createAccessToken,
  createRefreshToken,
} from "../utils/auth.js";

export async function signupPatient(req, res) {
  try {
    const { full_name, age, gender, email, phone_number, location, password } =
      req.body;
    if (!email || !password || !full_name)
      return res
        .status(400)
        .json({ message: "full_name, email and password are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const password_hash = await hashPassword(password);
    const user = new User({
      full_name,
      age,
      gender,
      email,
      phone_number,
      location,
      password_hash,
    });
    await user.save();

    const accessToken = createAccessToken({ id: user._id, type: "patient" });
    const refreshToken = createRefreshToken({ id: user._id, type: "patient" });

    const refreshDoc = new RefreshToken({ user_id: user._id, token: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), userModel: "User" });
    await refreshDoc.save();

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'Strict' : 'Lax' }
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(201).json({ user: { id: user._id, email: user.email, full_name: user.full_name } })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function signupDoctor(req, res) {
  try {
    const {
      full_name,
      email,
      phone_number,
      clinic_location,
      license_number,
      specialization,
      password,
    } = req.body;
    if (!email || !password || !full_name || !license_number)
      return res
        .status(400)
        .json({
          message: "full_name, email, license_number and password are required",
        });

    const existing = await Doctor.findOne({
      $or: [{ email }, { license_number }],
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "Email or license number already in use" });

    const password_hash = await hashPassword(password);
    const doctor = new Doctor({
      full_name,
      email,
      phone_number,
      clinic_location,
      license_number,
      specialization,
      password_hash,
    });
    await doctor.save();

    const accessToken = createAccessToken({ id: doctor._id, type: "doctor" });
    const refreshToken = createRefreshToken({ id: doctor._id, type: "doctor" });

    const refreshDoc = new RefreshToken({
      user_id: doctor._id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userModel: "Doctor",
    });
    await refreshDoc.save();

    res
      .status(201)
      .json({
        accessToken,
        refreshToken,
        doctor: {
          id: doctor._id,
          email: doctor.email,
          full_name: doctor.full_name,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
