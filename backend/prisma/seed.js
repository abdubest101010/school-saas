// Creates one test account per role, all with the same password, so you can
// log in as each and confirm auth + role restrictions work end to end.
//
// Run with: npx prisma db seed
// (after adding "prisma": { "seed": "node prisma/seed.js" } to package.json)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const TEST_PASSWORD = "Password123!";

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const ownerUser = await prisma.user.create({
    data: {
      email: "owner@test.com",
      passwordHash,
      role: "OWNER",
      owner: { create: { name: "Test Owner", schoolName: "Test School" } },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@test.com",
      passwordHash,
      role: "ADMIN",
      admin: { create: { name: "Test Admin" } },
    },
    include: { admin: true },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@test.com",
      passwordHash,
      role: "TEACHER",
      teacher: {
        create: {
          name: "Test Teacher",
          hiredById: adminUser.admin.id,
        },
      },
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@test.com",
      passwordHash,
      role: "PARENT",
      parent: { create: { name: "Test Parent" } },
    },
    include: { parent: true },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@test.com",
      passwordHash,
      role: "STUDENT",
      student: {
        create: {
          studentCode: `STU-${Date.now()}`,
          name: "Test Student",
          registeredById: adminUser.admin.id,
          parentId: parentUser.parent.id,
        },
      },
    },
  });

  console.log("Seeded test users (all passwords: " + TEST_PASSWORD + "):");
  console.log("- owner@test.com");
  console.log("- admin@test.com");
  console.log("- teacher@test.com");
  console.log("- parent@test.com");
  console.log("- student@test.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });