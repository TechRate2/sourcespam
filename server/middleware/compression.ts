// Response compression middleware for better performance
import { Request, Response, NextFunction } from 'express';
import { gzipSync, deflateSync } from 'zlib';

export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Override res.json to compress responses
  const originalJson = res.json;
  res.json = function(body) {
    const jsonString = JSON.stringify(body);
    
    // Only compress responses larger than 1KB
    if (jsonString.length > 1024) {
      if (acceptEncoding.includes('gzip')) {
        const compressed = gzipSync(jsonString);
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Type', 'application/json');
        return res.end(compressed);
      } else if (acceptEncoding.includes('deflate')) {
        const compressed = deflateSync(jsonString);
        res.setHeader('Content-Encoding', 'deflate');
        res.setHeader('Content-Type', 'application/json');
        return res.end(compressed);
      }
    }
    
    return originalJson.call(this, body);
  };
  
  next();
}