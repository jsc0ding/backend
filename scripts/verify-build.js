#!/usr/bin/env node

// Script to verify build directory exists
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path for server context - look in parent directory
const buildPath = path.join(__dirname, '../../client/build');
const indexPath = path.join(buildPath, 'index.html');

console.log('🔍 Checking build directory...');

if (fs.existsSync(buildPath)) {
  console.log('✅ Build directory exists');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found');
    console.log('🎉 Build verification successful!');
    process.exit(0);
  } else {
    console.log('❌ index.html not found in build directory');
    console.log('Contents of build directory:');
    try {
      const files = fs.readdirSync(buildPath);
      console.log(files);
    } catch (err) {
      console.log('Error reading build directory:', err.message);
    }
    process.exit(1);
  }
} else {
  console.log('❌ Build directory does not exist at:', buildPath);
  process.exit(1);
}