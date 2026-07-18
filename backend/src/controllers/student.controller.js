const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const { isValidPassword, MIN_PASSWORD_LENGTH } = require("../utils/validation");

// POST /api/students  (ADMIN only)
//
// Body:
// {
//   email, name, password, dateOfBirth?, gender?, classSectionId?,
//   parentId?              // link to an EXISTING parent, OR
//   newParent?: { email, name, password, phone? }   // create a new parent account
// }
async function registerStudent(req, res) {
  const { email, name, password, dateOfBirth, gender, classSectionId, parentId, newParent } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "email, name, and password are required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: `Student password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }
  if (parentId && newParent) {
    return res.status(400).json({ error: "Provide either parentId or newParent, not both" });
  }
  if (newParent && (!newParent.email || !newParent.name || !newParent.password)) {
    return res.status(400).json({ error: "newParent requires email, name, and password" });
  }
  if (newParent && !isValidPassword(newParent.password)) {
    return res.status(400).json({ error: `Parent password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }

  const callerAdmin = await prisma.admin.findUnique({ where: { userId: req.user.sub } });
  if (!callerAdmin) {
    return res.status(403).json({ error: "Admin profile not found for this account" });
  }

  const studentPasswordHash = await bcrypt.hash(password, 10);

  // Everything below happens in one transaction: if creating the parent
  // succeeds but creating the student fails (or vice versa), both roll back
  // instead of leaving an orphaned account.
  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      let resolvedParentId = parentId || null;

      if (newParent) {
        const parentExisting = await tx.user.findUnique({ where: { email: newParent.email } });
        if (parentExisting) {
          throw new Error("EMAIL_TAKEN:" + newParent.email);
        }

        const parentPasswordHash = await bcrypt.hash(newParent.password, 10);

        const parentUser = await tx.user.create({
          data: {
            email: newParent.email,
            passwordHash: parentPasswordHash,
            role: "PARENT",
            phone: newParent.phone || null,
            parent: { create: { name: newParent.name } },
          },
          include: { parent: true },
        });

        resolvedParentId = parentUser.parent.id;
      }

      const studentUser = await tx.user.create({
        data: {
          email,
          passwordHash: studentPasswordHash,
          role: "STUDENT",
          student: {
            create: {
              studentCode: `STU-${Date.now()}`,
              name,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              gender: gender || null,
              classSectionId: classSectionId || null,
              parentId: resolvedParentId,
              registeredById: callerAdmin.id,
            },
          },
        },
        include: { student: true },
      });

      return { studentUser };
    });
  } catch (err) {
    if (typeof err.message === "string" && err.message.startsWith("EMAIL_TAKEN:")) {
      return res.status(409).json({ error: "A user with the parent's email already exists" });
    }
    throw err;
  }

  res.status(201).json({
    student: { id: result.studentUser.id, email: result.studentUser.email },
    ...(newParent && { parent: { email: newParent.email } }),
  });
}

module.exports = { registerStudent };
