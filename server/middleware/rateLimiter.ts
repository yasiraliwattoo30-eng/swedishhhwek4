import rateLimit from 'express-rate-limit';
import { API_RATE_LIMITS } from '../utils/constants';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: API_RATE_LIMITS.WINDOW_MS,
  max: API_RATE_LIMITS.MAX_REQUESTS,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retry_after: Math.ceil(API_RATE_LIMITS.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retry_after: Math.ceil(API_RATE_LIMITS.WINDOW_MS / 1000)
    });
  }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts, please try again later.',
    retry_after: 900 // 15 minutes
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Authentication Attempts',
      message: 'Account temporarily locked due to too many failed attempts.',
      retry_after: 900
    });
  }
});

// BankID specific rate limiter
export const bankIDLimiter = rateLimit({
  windowMs: API_RATE_LIMITS.BANKID_WINDOW_MS,
  max: API_RATE_LIMITS.BANKID_MAX_REQUESTS,
  message: {
    error: 'Too Many BankID Requests',
    message: 'Too many BankID requests, please wait before trying again.',
    retry_after: Math.ceil(API_RATE_LIMITS.BANKID_WINDOW_MS / 1000)
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many BankID Requests',
      message: 'BankID rate limit exceeded. Please wait before trying again.',
      retry_after: Math.ceil(API_RATE_LIMITS.BANKID_WINDOW_MS / 1000)
    });
  }
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    error: 'Too Many Upload Requests',
    message: 'Upload rate limit exceeded, please wait before uploading again.',
    retry_after: 60
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Upload Requests',
      message: 'Too many file uploads. Please wait before trying again.',
      retry_after: 60
    });
  }
});

// Report generation rate limiter
export const reportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 reports per 5 minutes
  message: {
    error: 'Too Many Report Requests',
    message: 'Report generation rate limit exceeded.',
    retry_after: 300
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Report Requests',
      message: 'Too many report generation requests. Please wait before generating another report.',
      retry_after: 300
    });
  }
});