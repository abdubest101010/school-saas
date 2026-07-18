const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const { isValidPassword, MIN_PASSWORD_LENGTH } = require("../utils/validation");

// POST /api/setup/owner  (PUBLIC — no auth required, but self-limiting)
// Creates the very first Owner account. Refuses if an Owner already exists,
// so this can never be used to create a second one, or by someone who
// isn't supposed to have access.
async function createInitialOwner(req, res) {
  const existingOwner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  if (existingOwner) {
    return res.status(403).json({ error: "Setup has already been completed" });
  }

  const { email, name, password, schoolName } = req.body;

  if (!email || !name || !password || !schoolName) {
    return res.status(400).json({ error: "email, name, password, and schoolName are required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "OWNER",
      owner: { create: { name, schoolName } },
    },
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
  });
}

// GET /api/setup/status  (PUBLIC)
// Lets the frontend check whether setup is still needed, so it knows
// whether to show the setup form or redirect straight to /login.
async function getSetupStatus(req, res) {
  const existingOwner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  res.json({ setupComplete: Boolean(existingOwner) });
}

module.exports = { createInitialOwner, getSetupStatus };
