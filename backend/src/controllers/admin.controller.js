const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const { isValidPassword, MIN_PASSWORD_LENGTH } = require("../utils/validation");

// POST /api/admins  (OWNER only)
// Owner creates a new Admin account and sets their password.
async function createAdmin(req, res) {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "email, name, and password are required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      admin: { create: { name } }, // hiredById left null — the Owner created this one, not another Admin
    },
    include: { admin: true },
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
  });
}

// POST /api/teachers  (ADMIN only — Teacher.hiredById is a required relation to Admin)
async function hireTeacher(req, res) {
  const { email, name, subject, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "email, name, and password are required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }

  // req.user.sub is the caller's User.id — look up their Admin profile id,
  // since Teacher.hiredById points at Admin.id, not User.id.
  const callerAdmin = await prisma.admin.findUnique({ where: { userId: req.user.sub } });
  if (!callerAdmin) {
    return res.status(403).json({ error: "Admin profile not found for this account" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "TEACHER",
      teacher: {
        create: {
          name,
          subject: subject || null,
          hiredById: callerAdmin.id,
        },
      },
    },
    include: { teacher: true },
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
  });
}

module.exports = { createAdmin, hireTeacher };
