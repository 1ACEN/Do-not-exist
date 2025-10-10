import { RefreshToken } from "../models/RefreshToken.js";

export async function logout(req, res) {
  try {
    // prefer cookie-based refresh token
    let refreshToken = req.cookies && req.cookies.refreshToken
    if (!refreshToken) {
      refreshToken = req.body && req.body.refreshToken
      if (!refreshToken) {
        const fromHeader = req.get('x-refresh-token')
        const auth = req.get('authorization') || ''
        refreshToken = fromHeader || (auth.startsWith('Bearer ') ? auth.slice(7) : null)
      }
    }

    if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' })

    const stored = await RefreshToken.findOne({ token: refreshToken })
    if (stored) {
      stored.revoked = true
      await stored.save()
    }
    try {
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
    } catch (e) {
        throw new Error('Cannot clear cookie');
    }

    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
