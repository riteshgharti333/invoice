import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances during development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: 
      process.env.NODE_ENV === "development"
        ? ["info", "warn", "error"] //Removed "query" - hides SELECT/INSERT logs
        : ["error"], // Production: only errors
  });

// Add this function to test and log database connection
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}