import compression from 'compression';
import { Request, Response } from 'express';

// Custom compression configuration
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (1-9, 6 is default)
  level: 6,
  
  // Memory level (1-9, 8 is default)
  memLevel: 8,
  
  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress images, videos, or already compressed files
    const contentType = res.getHeader('content-type') as string;
    if (contentType) {
      const skipTypes = [
        'image/',
        'video/',
        'audio/',
        'application/zip',
        'application/gzip',
        'application/x-rar-compressed',
        'application/pdf' // PDFs are already compressed
      ];

      if (skipTypes.some(type => contentType.startsWith(type))) {
        return false;
      }
    }

    // Use default compression filter for everything else
    return compression.filter(req, res);
  }
});

// Middleware to add compression headers
export const compressionHeaders = (req: Request, res: Response, next: any) => {
  // Add Vary header for proper caching
  res.setHeader('Vary', 'Accept-Encoding');
  
  // Set cache control for compressed responses
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  next();
};