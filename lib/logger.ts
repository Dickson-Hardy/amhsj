// Simple logging utility that works in both server and client environments
let logger: any = null

// Only initialize winston on the server side
if (typeof window === 'undefined') {
  try {
    const winston = require('winston')
    
    logger = winston.createLogger({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: "amhsj" },
      transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
      ],
    })

    if (process.env.NODE_ENV !== "production") {
      logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      )
    }
  } catch (error) {
    // Fallback if winston is not available
    logger = {
      error: console.error,
      info: console.log,
      debug: console.log,
      warn: console.warn,
    }
  }
} else {
  // Client-side fallback to console
  logger = {
    error: console.error,
    info: console.log,
    debug: console.log,
    warn: console.warn,
  }
}

export { logger }

export function logError(error: Error, context?: any) {
  const logData = {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  }
  
  if (typeof window === 'undefined') {
    // Server-side logging
    logger.error("Application error", logData)
  } else {
    // Client-side logging
    console.error("Application error", logData)
  }
}

export function logInfo(message: string, data?: any) {
  const logData = { data, timestamp: new Date().toISOString() }
  
  if (typeof window === 'undefined') {
    // Server-side logging
    logger.info(message, logData)
  } else {
    // Client-side logging
    console.log(message, logData)
  }
}
