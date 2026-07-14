import { createLogger, format, transports } from "winston";
import { env } from "./env";

const logger = createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",

  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
        : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),

  transports: [new transports.Console()],

  exitOnError: false,
});

export { logger };