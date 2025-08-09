#!/usr/bin/env node
/**
 * BOMBCALL - REPLIT START SCRIPT
 * Start server GIỐNG HỆT preview environment
 */

import { spawn } from 'child_process';

// REPLIT DEPLOYMENT PORT FIX
// .replit config có conflicting ports, force dùng port 5000 như preview
const deploymentPort = '5000'; // Match preview server port 5000
process.env.NODE_ENV = 'production';
process.env.PORT = deploymentPort;

console.log('🔍 DEPLOYMENT PORT FIX:');
console.log('   Issue: .replit config có multiple conflicting ports');  
console.log('   Solution: Force port 5000 giống hệt preview server');
console.log(`   Selected Port: ${deploymentPort} (production = preview)`);

console.log('🚀 BOMBCALL - PRODUCTION SERVER');
console.log('===============================');
console.log('🎯 Starting server IDENTICAL to preview...');
console.log('📁 Static assets: dist/public/');
console.log('🎨 CSS/JS: Fresh build assets');
console.log(`🔌 Port: ${deploymentPort} (Replit auto-assigned)`);

// Start server bằng tsx - GIỐNG HỆT preview với port handling
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '3000', // Use Replit's assigned port
    HOST: '0.0.0.0' // Bind to all interfaces for Replit
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
});