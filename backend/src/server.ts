import http from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma, connectDatabase } from "./database/client";

const server = http.createServer(app);

 
 
// Connect to database befo re starting server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await connectDatabase();

    if (!isConnected) {
      logger.error("Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Optional: Run a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection verified with test query");

    // Start server
    server.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Graceful shutdown with database disconnection
const gracefulShutdown = async (signal: NodeJS.Signals) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");

    // Close database connection
    await prisma.$disconnect();
    logger.info("Database connection closed.");

    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("uncaughtException", async (error) => {
  logger.error("Uncaught Exception", { error });
  await prisma.$disconnect();
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  logger.error("Unhandled Rejection", { reason });
  await prisma.$disconnect();
  process.exit(1);
});

// Start the application
startServer();
