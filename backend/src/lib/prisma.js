// Prevents creating a new PrismaClient (and new DB connections) on every
// hot-reload / require() call. Always import prisma from here, never
// `new PrismaClient()` directly anywhere else in the app.

const { PrismaClient } = require("@prisma/client");

const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

module.exports = prisma;
