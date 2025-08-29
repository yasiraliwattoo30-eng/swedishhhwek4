import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger';
import { corsOptions, corsErrorHandler } from './config/cors';
import { requestLogging, errorLogging, performanceMonitoring } from './middleware/logging';
import { securityHeaders, sanitizeInput } from './middleware/security';
import { compressionMiddleware, compressionHeaders } from './middleware/compression';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import Environment from './config/environment';
import bankidRoutes from './routes/bankid';
import { testConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import foundationRoutes from './routes/foundations';
import documentRoutes from './routes/documents';
import meetingRoutes from './routes/meetings';
import expenseRoutes from './routes/expenses';
import investmentRoutes from './routes/investments';
import projectRoutes from './routes/projects';
import grantRoutes from './routes/grants';
import profileRoutes from './routes/profiles';
import financialRoutes from './routes/financial';
import governanceRoutes from './routes/governance';
import reportRoutes from './routes/reports';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Load environment configuration
const env = Environment.load();

const app = express();
const PORT = env.port;

// Test database connection
testConnection();

// Security and performance middleware
app.use(securityHeaders);
app.use(compressionHeaders);
app.use(compressionMiddleware);
app.use(sanitizeInput);

// CORS configuration
app.use(cors(corsOptions));
app.use(corsErrorHandler);

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging and monitoring middleware
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(requestLogging);
app.use(performanceMonitoring);

// API Documentation
if (env.nodeEnv === 'development') {
  setupSwagger(app);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/foundations', authMiddleware, foundationRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/meetings', authMiddleware, meetingRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/investments', authMiddleware, investmentRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/grants', authMiddleware, grantRoutes);
app.use('/api/profiles', authMiddleware, profileRoutes);
app.use('/api/financial', authMiddleware, financialRoutes);
app.use('/api/governance', authMiddleware, governanceRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/bankid', bankidRoutes);

// Error handling middleware (must be last)
app.use(errorLogging);
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found on this server.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${env.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  if (env.nodeEnv === 'development') {
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  }
});

export default app;