import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: Record<string, unknown> | undefined; // Explicitly allow undefined
}

export class Logger {
  private static logDir = path.join(process.cwd(), 'logs');
  private static logFile = path.join(this.logDir, 'app.log');

  static init() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  static log(level: LogEntry['level'], message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    };

    // Console output
    const logMessage = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;
    console.log(logMessage, meta ? JSON.stringify(meta, null, 2) : '');

    // File output
    if (process.env.NODE_ENV === 'production') {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    }
  }

  static info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  static warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  static error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta);
  }

  static debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

// Request logging middleware
export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  // Log request start
  Logger.info(`Request started: ${method} ${originalUrl}`, {
    ip,
    userAgent,
    body: method !== 'GET' ? req.body : undefined
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    Logger.log(logLevel, `Request completed: ${method} ${originalUrl}`, {
      statusCode,
      duration,
      ip,
      userAgent
    });
  });

  next();
};

// Error logging middleware
export const errorLogging = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorInfo: { message?: string | undefined; stack?: string | undefined; name?: string | undefined } = {};
  if (typeof error === 'object' && error !== null) {
    const errObj = error as { message?: string; stack?: string; name?: string };
    errorInfo = {
      message: errObj.message,
      stack: errObj.stack,
      name: errObj.name
    };
  } else {
    errorInfo = { message: String(error) };
  }

  Logger.error('Request error occurred', {
    error: errorInfo,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body
    }
  });

  next(error);
};

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      Logger.warn(`Slow request detected: ${req.method} ${req.originalUrl}`, {
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip
      });
    }

    // Log memory usage for monitoring
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 100 * 1024 * 1024) { // > 100MB
      Logger.warn('High memory usage detected', {
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`
      });
    }
  });

  next();
};

// Initialize logger
Logger.init();