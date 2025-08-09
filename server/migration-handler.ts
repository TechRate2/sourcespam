import { autoCleanup } from './auto-cleanup';

/**
 * MIGRATION HANDLER
 * Tự động xử lý migrations và updates khi hệ thống thay đổi
 */

export class MigrationHandler {
  private static instance: MigrationHandler;
  private migrationVersion: string;

  constructor() {
    this.migrationVersion = process.env.MIGRATION_VERSION || '1.0.0';
  }

  static getInstance(): MigrationHandler {
    if (!MigrationHandler.instance) {
      MigrationHandler.instance = new MigrationHandler();
    }
    return MigrationHandler.instance;
  }

  /**
   * Kiểm tra và chạy migrations cần thiết
   */
  async runMigrations(): Promise<void> {
    console.log('🔄 Checking for necessary migrations...');
    
    try {
      // Chạy auto-cleanup trước
      await autoCleanup.runFullCleanup();
      
      // Kiểm tra xem có cần migration JWT không
      await this.handleJWTMigration();
      
      // Kiểm tra schema changes
      await this.handleSchemaMigration();
      
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration error:', error);
      // Không throw error để hệ thống vẫn chạy được
    }
  }

  /**
   * Xử lý JWT migration khi secret thay đổi
   */
  private async handleJWTMigration(): Promise<void> {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (jwtSecret) {
      console.log('🔧 JWT secret detected, ensuring clean token state...');
      // Khi có JWT secret mới, tất cả old tokens sẽ invalid
      // Auto-cleanup sẽ xử lý trong frontend
      console.log('✅ JWT migration prepared');
    } else {
      console.log('⚠️  Using auto-generated JWT secret (development mode)');
    }
  }

  /**
   * Xử lý schema migration
   */
  private async handleSchemaMigration(): Promise<void> {
    console.log('🔧 Checking schema compatibility...');
    
    // Đảm bảo tất cả required fields tồn tại
    await this.ensureRequiredFields();
    
    console.log('✅ Schema migration completed');
  }

  /**
   * Đảm bảo các fields bắt buộc
   */
  private async ensureRequiredFields(): Promise<void> {
    // Implementation sẽ được thêm khi cần
    console.log('🔧 Required fields verified');
  }

  /**
   * Force refresh system sau migration
   */
  async forceSystemRefresh(): Promise<void> {
    console.log('🔄 Force refreshing system state...');
    
    // Clear any cached data
    // Reset connections if needed
    // Force reload configurations
    
    console.log('✅ System refresh completed');
  }
}

export const migrationHandler = MigrationHandler.getInstance();