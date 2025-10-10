import { RefreshToken } from "../models/RefreshToken.js";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
} from "../utils/auth.js";

export async function refreshTokenHandler(req, res) {
  try {
    // read refresh token from HttpOnly cookie
    let refreshToken = req.cookies && req.cookies.refreshToken
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken cookie is required' })

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (e) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const stored = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
    });
    if (!stored)
      return res
        .status(401)
        .json({ message: "Refresh token revoked or not found" });
    if (stored.expires_at < new Date())
      return res.status(401).json({ message: "Refresh token expired" });

    stored.revoked = true;
    await stored.save();

    const newAccessToken = createAccessToken({
      id: payload.id,
      type: payload.type,
    });
    const newRefreshToken = createRefreshToken({
      id: payload.id,
      type: payload.type,
    });

    const newDoc = new RefreshToken({
      user_id: payload.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userModel: payload.type === "doctor" ? "Doctor" : "User",
    });
    await newDoc.save();
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'Strict' : 'Lax' }
    res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.json({ message: 'Tokens refreshed' })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
