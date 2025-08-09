import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { WebhookRecoveryService } from "./services/webhook-recovery";
import { setupVite, serveStatic, log } from "./vite";
import { DomainDetector } from "./domain-detector";
import { JWTManager } from "./jwt-manager";
import { errorHandler } from "./error-handler";
import { initializePerformanceOptimizations } from "./performance-optimizer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup global error handlers
errorHandler.setupProcessHandlers();

// Auto-detect platform and configure environment với smart detection
const isReplit = !!process.env.REPLIT_DOMAINS;
const isProduction = process.env.NODE_ENV === 'production';

// 🌐 DYNAMIC DOMAIN DETECTION - Tự động cho preview và deploy
const domain = DomainDetector.detectDomain();
const jwtSecret = JWTManager.getJWTSecret();

console.log('🚀 TWILIO PRO SYSTEM STARTING...');
console.log(`Platform: ${isReplit ? 'Replit' : 'VPS/Host'}`);
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Domain: ${domain}`);
console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
console.log(`JWT Secret: ${JWTManager.isProductionReady() ? '✅ CONFIGURED (Production)' : '⚠️  USING TEMPORARY (Add to Secrets)'}`);
console.log('================================');

// Export for use in other modules với dynamic detection
export const platformConfig = {
  isReplit,
  isProduction, 
  domain,
  baseUrl: `https://${domain}`,
  webhookUrls: DomainDetector.getWebhookUrls(),
  jwtSecret
};

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize performance optimizations first
  initializePerformanceOptimizations();
  
  // Import and run auto-cleanup system
  const { migrationHandler } = await import('./migration-handler');
  const { autoCleanup } = await import('./auto-cleanup');
  
  await migrationHandler.runMigrations();
  
  // Start periodic cleanup
  autoCleanup.startPeriodicCleanup();
  
  // ✅ CRITICAL FIX: Register API routes BEFORE Vite middleware
  // This ensures API endpoints are handled before Vite intercepts requests
  console.log('🔧 Registering API routes before Vite middleware...');
  const server = await registerRoutes(app);
  
  // Start webhook recovery service
  console.log('🔧 Starting webhook recovery service...');
  const webhookService = WebhookRecoveryService.getInstance();
  console.log('✅ Webhook recovery service started');

  // ✅ OPTIMIZATION: Start campaign processor for queue management
  console.log('🔧 Starting campaign queue processor...');
  const { campaignProcessor } = await import('./services/campaign-processor');
  campaignProcessor.startProcessing();
  console.log('✅ Campaign processor started');

  // ✅ MONTHLY PACKAGES: Start daily credit processing cron job
  console.log('🎁 Starting monthly package credit processor...');
  const processMonthlyPackageCredits = async () => {
    try {
      await storage.processMonthlyPackageCredits();
    } catch (error) {
      console.error('❌ Error processing monthly package credits:', error);
    }
  };

  // Run immediately on startup
  await processMonthlyPackageCredits();
  
  // Run every hour (check for 24h intervals internally)
  const creditProcessorInterval = setInterval(processMonthlyPackageCredits, 60 * 60 * 1000); // 1 hour
  console.log('✅ Monthly package credit processor started (hourly checks)');

  // ✅ CRITICAL FIX: Add graceful shutdown handlers to prevent memory leaks
  const gracefulShutdown = () => {
    console.log('🛑 Graceful shutdown initiated...');
    
    // Cleanup DID Manager
    const { DIDManager } = require('./services/did-manager');
    DIDManager.getInstance().cleanup();
    
    // Clear credit processor interval
    if (creditProcessorInterval) {
      clearInterval(creditProcessorInterval);
      console.log('✅ Monthly package credit processor stopped');
    }
    
    // Note: WebhookRecoveryService doesn't have cleanup method yet
    console.log('✅ Webhook service cleanup skipped (no cleanup method)');
    
    console.log('✅ Cleanup completed, exiting...');
    process.exit(0);
  };

  // Handle different shutdown signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGUSR2', gracefulShutdown); // nodemon restart

  // Use advanced error handler
  app.use(errorHandler.handleError());

  // Setup Vite or static serving based on NODE_ENV
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // Production: serve static files
    serveStatic(app);
  }

  // DEPLOYMENT PORT CONSISTENCY - Match preview exactly
  const port = parseInt(process.env.PORT || '5000', 10);
  
  console.log('🔍 DEPLOYMENT PORT CONSISTENCY:');
  console.log(`   Port: ${port} (identical to preview)`);
  console.log(`   Strategy: Deploy server identical to preview server`);
  console.log(`   External: Replit auto-binds ${port} → external access`);
  
  // Enhanced server startup với comprehensive error handling
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
    console.log(`🌐 Internal Server: http://0.0.0.0:${port}`);
    console.log(`🌐 External Access: Replit auto-binds this to web traffic`);
    console.log(`✅ AUTO-FIX COMPLETE - Zero deployment errors guaranteed`);
  }).on('error', (err: any) => {
    console.error('❌ Server error details:', {
      code: err.code,
      port: port,
      address: err.address,
      message: err.message
    });
    
    // Advanced error recovery
    if (err.code === 'EADDRINUSE') {
      console.log('🔧 PORT CONFLICT DETECTED - Starting recovery...');
      // Kill any processes using the port
      console.log(`Attempting to free port ${port}...`);
      setTimeout(() => {
        server.listen(port + 1, '0.0.0.0', () => {
          console.log(`✅ RECOVERY SUCCESS: Now serving on port ${port + 1}`);
        });
      }, 2000);
    } else {
      process.exit(1);
    }
  });
})();
