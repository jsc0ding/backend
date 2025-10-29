#!/usr/bin/env node

// Script to verify build directory exists
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible paths for different environments
const possiblePaths = [
  path.join(__dirname, '../client/build'), // Render deployment structure
  path.join(__dirname, '../../client/build'), // Local development structure
  path.join(process.cwd(), '../client/build'), // Alternative Render structure
  path.join(process.cwd(), 'client/build') // Another possible structure
];

console.log('🔍 Checking build directory...');

// Try each possible path
for (const buildPath of possiblePaths) {
  console.log(`Checking path: ${buildPath}`);
  
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build directory found at:', buildPath);
    const indexPath = path.join(buildPath, 'index.html');
    
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
    }
  }
}

console.log('❌ Build directory does not exist at any of the expected locations:');
possiblePaths.forEach(p => console.log('  -', p));
process.exit(1);