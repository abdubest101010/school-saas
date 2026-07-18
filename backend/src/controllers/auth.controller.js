const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/token");

// httpOnly + sameSite cookie for the refresh token — JS on the frontend
// never touches it, which is what keeps it safe from XSS token theft.
const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax", // use "none" + secure:true if frontend and backend are on different domains in production
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches REFRESH_TOKEN_EXPIRES_IN
  path: "/api/auth", // only sent back to auth routes, not every request
};

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Same error for "no user" and "wrong password" — don't leak which one it was.
  if (!user || !user.isActive || user.deletedAt) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}

// POST /api/auth/refresh
// Frontend calls this when an API request comes back 401 due to an expired
// access token, to get a new one without forcing the user to log in again.
async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive || user.deletedAt) {
    return res.status(401).json({ error: "User no longer active" });
  }

  const accessToken = signAccessToken(user);
  res.json({ accessToken });
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.json({ success: true });
}

// GET /api/auth/me
// Requires the `authenticate` middleware to have run first (req.user set).
async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, email: true, role: true, phone: true, profileImage: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
}

module.exports = { login, refresh, logout, me };
