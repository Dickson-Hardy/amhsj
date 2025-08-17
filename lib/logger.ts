// Enhanced logging utility for production-ready application
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
        winston.format.printf(({ level, message, timestamp, ...meta }: any) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
        })
      ),
      defaultMeta: { 
        service: "amhsj",
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      },
      transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.File({ filename: "logs/audit.log", level: "info" }),
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

// Additional convenience logging functions
export function logAuth(message: string, userId?: string, action?: string) {
  logInfo(`AUTH: ${message}`, { userId, action, type: 'authentication' })
}

export function logEmail(message: string, recipient?: string, status?: string) {
  logInfo(`EMAIL: ${message}`, { recipient, status, type: 'email' })
}

export function logSystem(message: string, metric?: string, value?: any) {
  logInfo(`SYSTEM: ${message}`, { metric, value, type: 'system' })
}

export function logAdmin(message: string, adminId?: string, action?: string, target?: string) {
  logInfo(`ADMIN: ${message}`, { adminId, action, target, type: 'admin_action' })
}
