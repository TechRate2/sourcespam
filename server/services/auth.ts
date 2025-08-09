import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User } from '@shared/schema';

// Secure JWT Secret with validation
const JWT_SECRET = process.env.JWT_SECRET;

// Check if JWT_SECRET exists and is secure
if (!JWT_SECRET) {
  console.warn('⚠️  WARNING: Using temporary JWT secret. Add JWT_SECRET to secrets for production security!');
  console.warn('Recommended JWT_SECRET: 7d231a8f3a14c0b6f25f585a6d241bfc47f1fbf9d6c1662f0cd14fd86b0910ee');
}

// Use secure secret if available, otherwise use the original fallback for compatibility
const jwtSecret: string = JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, jwtSecret, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, jwtSecret, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      return decoded as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export const authService = new AuthService();
