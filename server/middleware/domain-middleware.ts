/**
 * 🌐 DOMAIN MIDDLEWARE
 * Middleware để inject domain info vào request cho webhook URLs
 */

import { Request, Response, NextFunction } from 'express';
import { DomainDetector } from '../domain-detector';

export interface RequestWithDomain extends Request {
  domain?: string;
  webhookUrls?: {
    voice: string;
    status: string;
    fallback: string;
    sms: string;
  };
}

/**
 * Middleware để auto-detect domain từ request
 */
export const domainMiddleware = (req: RequestWithDomain, res: Response, next: NextFunction) => {
  // Inject domain info vào request
  req.domain = DomainDetector.detectDomain(req);
  req.webhookUrls = DomainDetector.getWebhookUrls(req);
  
  // Log domain detection for debugging
  if (req.path.startsWith('/api/twilio') || req.path.startsWith('/api/admin')) {
    console.log(`🌐 Request domain: ${req.domain}`);
  }
  
  next();
};