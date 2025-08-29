import dotenv from 'dotenv';
import { Validators } from '../utils/validators';

// Load environment variables
dotenv.config();

export interface EnvironmentConfig {
  // Server configuration
  port: number;
  nodeEnv: string;
  frontendUrl: string;

  // Database configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;

  // Authentication
  jwtSecret: string;
  jwtExpiresIn: string;

  // File upload
  maxFileSize: number;
  allowedFileTypes: string[];

  // Email configuration
  smtpHost?: string | undefined;
  smtpPort?: number | undefined;
  smtpUser?: string | undefined;
  smtpPass?: string | undefined;

  // BankID configuration
  bankidEndpoint?: string | undefined;
  bankidCertPath?: string | undefined;
  bankidCertPassword?: string | undefined;

  // Bank integration
  bankApiEndpoint?: string | undefined;
  bankApiKey?: string | undefined;

  // Logging
  logLevel: string;
  logFile?: string | undefined;

  // Rate limiting
  rateLimitWindow: number;
  rateLimitMax: number;
}

class Environment {
  private static config: EnvironmentConfig;

  static load(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    // Validate required environment variables
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.config = {
      // Server configuration
      port: parseInt(process.env.PORT || '3001'),
      nodeEnv: process.env.NODE_ENV || 'development',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

      // Database configuration
      supabaseUrl: process.env.VITE_SUPABASE_URL!,
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY!,
      supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,

      // Authentication
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

      // File upload
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],

      // Email configuration
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,

      // BankID configuration
      bankidEndpoint: process.env.BANKID_ENDPOINT,
      bankidCertPath: process.env.BANKID_CERT_PATH,
      bankidCertPassword: process.env.BANKID_CERT_PASSWORD,

      // Bank integration
      bankApiEndpoint: process.env.BANK_API_ENDPOINT,
      bankApiKey: process.env.BANK_API_KEY,

      // Logging
      logLevel: process.env.LOG_LEVEL || 'info',
      logFile: process.env.LOG_FILE,

      // Rate limiting
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100')
    };

    // Validate configuration
    this.validateConfig();

    return this.config;
  }

  private static validateConfig(): void {
    const config = this.config;

    // Validate URLs
    if (!Validators.isValidUrl(config.supabaseUrl)) {
      throw new Error('Invalid Supabase URL');
    }

    if (!Validators.isValidUrl(config.frontendUrl)) {
      throw new Error('Invalid frontend URL');
    }

    // Validate port
    if (config.port < 1 || config.port > 65535) {
      throw new Error('Invalid port number');
    }

    // Validate file size
    if (config.maxFileSize < 1024 || config.maxFileSize > 100 * 1024 * 1024) { // 1KB to 100MB
      throw new Error('Invalid max file size');
    }

    // Validate email configuration if provided
    if (config.smtpHost && !config.smtpUser) {
      throw new Error('SMTP user is required when SMTP host is configured');
    }

    console.log('✅ Environment configuration validated');
  }

  static get(): EnvironmentConfig {
    if (!this.config) {
      return this.load();
    }
    return this.config;
  }

  static isDevelopment(): boolean {
    return this.get().nodeEnv === 'development';
  }

  static isProduction(): boolean {
    return this.get().nodeEnv === 'production';
  }

  static isTest(): boolean {
    return this.get().nodeEnv === 'test';
  }
}

export default Environment;