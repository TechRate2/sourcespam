#!/usr/bin/env node
/**
 * BOMBCALL - CREATE DEFAULT ADMIN USER
 * Tạo admin user mặc định cho hệ thống
 */

import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const DEFAULT_ADMIN = {
  email: 'admin@twiliopro.com',
  username: 'admin',
  password: 'admin123',
  fullName: 'System Administrator',
  role: 'admin',
  balance: '1000000', // 1 triệu VNĐ cho admin
  callsRemaining: 1000,
  plan: 'enterprise',
  isActive: true
};

async function createDefaultAdmin() {
  try {
    console.log('🔧 Creating default admin user...');
    
    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, DEFAULT_ADMIN.email))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      console.log(`📧 Email: ${DEFAULT_ADMIN.email}`);
      console.log(`🔑 Password: ${DEFAULT_ADMIN.password}`);
      return;
    }
    
    // Hash password
    console.log('🔐 Hashing admin password...');
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
    
    // Create admin user
    console.log('👤 Creating admin user in database...');
    const admin = await db.insert(users).values({
      email: DEFAULT_ADMIN.email,
      username: DEFAULT_ADMIN.username,
      password: hashedPassword,
      fullName: DEFAULT_ADMIN.fullName,
      role: DEFAULT_ADMIN.role,
      balance: DEFAULT_ADMIN.balance,
      callsRemaining: DEFAULT_ADMIN.callsRemaining,
      plan: DEFAULT_ADMIN.plan,
      isActive: DEFAULT_ADMIN.isActive
    }).returning();
    
    console.log('✅ Default admin user created successfully!');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log(`📧 Email: ${DEFAULT_ADMIN.email}`);
    console.log(`🔑 Password: ${DEFAULT_ADMIN.password}`);
    console.log(`👤 Username: ${DEFAULT_ADMIN.username}`);
    console.log(`💰 Balance: ${DEFAULT_ADMIN.balance} VNĐ`);
    console.log(`📞 Calls: ${DEFAULT_ADMIN.callsRemaining} calls`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createDefaultAdmin();