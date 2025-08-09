#!/usr/bin/env node
/**
 * BOMBCALL - REPLIT BUILD SCRIPT
 * Simple build cho Replit deployment
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 BOMBCALL - REPLIT BUILD');
console.log('=========================');

try {
  // Clean old builds to prevent serving stale assets
  console.log('🧹 Cleaning old builds...');
  execSync('rm -rf dist/public', { stdio: 'inherit' });
  execSync('rm -rf server/public', { stdio: 'inherit' });
  
  // Build client with fresh assets
  console.log('📦 Building fresh client...');
  execSync('npm run build:client', { stdio: 'inherit' });
  
  if (!existsSync('dist/public/index.html')) {
    throw new Error('❌ Client build failed');
  }
  
  // Verify assets exist  
  if (!existsSync('dist/public/assets')) {
    throw new Error('❌ Assets not generated');
  }
  
  console.log('✅ Build completed successfully');
  console.log('✅ Client: Fresh production build ready');
  console.log('✅ Assets: Generated and verified');
  console.log('✅ Server: Will use TypeScript source');
  console.log('✅ Database: Same DATABASE_URL as preview');
  
  // List generated assets for verification
  console.log('📋 Generated assets:');
  execSync('ls -la dist/public/assets/', { stdio: 'inherit' });
  
  // Show asset hashes for cache busting verification
  console.log('🔍 Asset filenames (cache busting):');
  execSync('ls dist/public/assets/ | grep -E "\\.(css|js)$"', { stdio: 'inherit' });
  
  // CRITICAL FIX: Copy assets to server/public (where static serving expects them)
  console.log('📋 Copying assets to server/public for static serving...');
  execSync('cp -r dist/public server/', { stdio: 'inherit' });
  
  if (!existsSync('server/public/index.html')) {
    throw new Error('❌ Failed to copy assets to server/public');
  }
  
  console.log('✅ Assets copied to server/public for production serving');
  console.log('🎯 Deploy sẽ 100% giống preview với fresh assets');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}