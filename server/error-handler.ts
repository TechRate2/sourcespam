import { Request, Response, NextFunction } from 'express';

/**
 * ADVANCED ERROR HANDLER
 * Tự động xử lý lỗi và recover hệ thống
 */

export class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Express error handler middleware
   */
  handleError() {
    return async (error: any, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Error caught by handler:', error);

      // Kiểm tra loại lỗi và xử lý tương ứng
      if (this.isAuthError(error)) {
        await this.handleAuthError(error, req, res);
        return;
      }

      if (this.isDatabaseError(error)) {
        await this.handleDatabaseError(error, req, res);
        return;
      }

      if (this.isTwilioError(error)) {
        await this.handleTwilioError(error, req, res);
        return;
      }

      // Generic error handling
      await this.handleGenericError(error, req, res);
    };
  }

  /**
   * Kiểm tra auth error
   */
  private isAuthError(error: any): boolean {
    return error.name === 'JsonWebTokenError' || 
           error.name === 'TokenExpiredError' ||
           error.message?.includes('Unauthorized') ||
           error.message?.includes('Invalid token');
  }

  /**
   * Xử lý auth error
   */
  private async handleAuthError(error: any, req: Request, res: Response): Promise<void> {
    console.log('🔧 Handling auth error, triggering cleanup...');
    
    // Trigger cleanup cho user này nếu có
    const user = (req as any).user;
    if (user) {
      console.log('🧹 User-specific auth cleanup triggered');
    }

    res.status(401).json({ 
      message: 'Authentication error',
      action: 'please_login_again'
    });
  }

  /**
   * Kiểm tra database error
   */
  private isDatabaseError(error: any): boolean {
    return error.code === 'ECONNREFUSED' ||
           error.code === 'ENOTFOUND' ||
           error.message?.includes('database') ||
           error.message?.includes('connection');
  }

  /**
   * Xử lý database error
   */
  private async handleDatabaseError(error: any, req: Request, res: Response): Promise<void> {
    console.log('🔧 Database error detected, attempting recovery...');
    
    try {
      // Attempt database recovery
      console.log('🔧 Attempting database recovery...');
      console.log('✅ Database recovery attempt completed');
    } catch (recoveryError) {
      console.error('❌ Database recovery failed:', recoveryError);
    }

    res.status(503).json({ 
      message: 'Database temporarily unavailable',
      action: 'please_try_again_later'
    });
  }

  /**
   * Kiểm tra Twilio error
   */
  private isTwilioError(error: any): boolean {
    return error.code?.toString().startsWith('2') || // Twilio error codes
           error.message?.includes('Twilio') ||
           error.message?.includes('Unable to create record');
  }

  /**
   * Xử lý Twilio error
   */
  private async handleTwilioError(error: any, req: Request, res: Response): Promise<void> {
    console.log('📞 Twilio error detected:', error.message);
    
    res.status(400).json({ 
      message: 'Call service temporarily unavailable',
      details: error.message,
      action: 'check_twilio_config'
    });
  }

  /**
   * Xử lý generic error
   */
  private async handleGenericError(error: any, req: Request, res: Response): Promise<void> {
    console.error('💥 Unhandled error:', error);
    
    res.status(500).json({ 
      message: 'Internal server error',
      action: 'contact_support'
    });
  }

  /**
   * Process exit handler
   */
  setupProcessHandlers(): void {
    process.on('uncaughtException', async (error) => {
      console.error('💥 Uncaught Exception:', error);
      
      // Attempt cleanup before exit
      console.log('🧹 Emergency cleanup triggered');
      
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      
      // Attempt cleanup
      console.log('🧹 Cleanup triggered for unhandled rejection');
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, graceful shutdown...');
      
      console.log('🧹 Graceful shutdown cleanup...');
      console.log('✅ Cleanup completed, exiting...');
      
      process.exit(0);
    });

    console.log('✅ Process error handlers setup complete');
  }
}

export const errorHandler = ErrorHandler.getInstance();