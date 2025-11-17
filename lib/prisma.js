import { PrismaClient } from "@prisma/client";

/** @type {{ prisma: import("@prisma/client").PrismaClient | undefined }} */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
