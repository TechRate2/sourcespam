/**
 * 🔐 JWT SECURITY MANAGER
 * Auto-generate và manage JWT secrets cho production
 */

import crypto from 'crypto';

export class JWTManager {
  private static generatedSecret: string | null = null;

  /**
   * Get JWT secret với fallback generation
   */
  static getJWTSecret(): string {
    // Priority 1: Environment variable
    if (process.env.JWT_SECRET) {
      return process.env.JWT_SECRET;
    }

    // Priority 2: Generated secret (cached)
    if (this.generatedSecret) {
      return this.generatedSecret;
    }

    // Priority 3: Generate new secure secret
    const secret = this.generateSecureSecret();
    this.generatedSecret = secret;

    console.log('⚠️  WARNING: Using auto-generated JWT secret');
    console.log('🔧 For production security, add JWT_SECRET to environment:');
    console.log(`   JWT_SECRET=${secret}`);

    return secret;
  }

  /**
   * Generate cryptographically secure JWT secret
   */
  private static generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Validate JWT secret strength
   */
  static validateSecret(secret: string): { valid: boolean; message: string } {
    if (!secret) {
      return { valid: false, message: 'JWT secret is required' };
    }

    if (secret.length < 32) {
      return { valid: false, message: 'JWT secret must be at least 32 characters' };
    }

    if (secret === 'your-secret-key' || secret === 'secret') {
      return { valid: false, message: 'JWT secret is too simple' };
    }

    return { valid: true, message: 'JWT secret is secure' };
  }

  /**
   * Check if using production-grade JWT
   */
  static isProductionReady(): boolean {
    return !!process.env.JWT_SECRET && this.validateSecret(process.env.JWT_SECRET).valid;
  }

  /**
   * Get security recommendations
   */
  static getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!process.env.JWT_SECRET) {
      recommendations.push('Add JWT_SECRET to environment variables');
      recommendations.push(`Recommended: JWT_SECRET=${this.generateSecureSecret()}`);
    }

    if (!process.env.DATABASE_URL) {
      recommendations.push('Add DATABASE_URL for persistent data storage');
    }

    return recommendations;
  }
}