/**
 * Pre-deployment test script
 * Run this before deploying to production to check for common issues
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');

console.log('🔍 Running pre-deployment checks...');

// Check essential production files
const essentialFiles = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/manifest.json'
];

console.log('\n📄 Checking essential files...');
essentialFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} is missing`);
  }
});

// Check for large files in public directory
console.log('\n📦 Checking for large files in public directory...');
const MAX_FILE_SIZE_MB = 1; // 1MB threshold
const checkDirForLargeFiles = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      checkDirForLargeFiles(filePath);
    } else {
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        console.warn(`⚠️ Large file detected: ${filePath} (${fileSizeMB.toFixed(2)}MB)`);
      }
    }
  });
};

try {
  checkDirForLargeFiles(publicDir);
} catch (err) {
  console.error('Error checking file sizes:', err);
}

// Check for correct meta tags in layout.tsx
console.log('\n🔍 Checking for SEO meta tags...');
const layoutPath = path.join(srcDir, 'app', 'layout.tsx');
try {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasMetadata = layoutContent.includes('export const metadata');
  const hasTitle = layoutContent.includes('title:');
  const hasDescription = layoutContent.includes('description:');
  
  if (hasMetadata && hasTitle && hasDescription) {
    console.log('✅ layout.tsx contains required metadata');
  } else {
    console.warn('⚠️ layout.tsx may be missing required metadata');
  }
} catch (err) {
  console.error('Error checking layout.tsx:', err);
}

// Check for lighthouse optimization hints
console.log('\n💡 Optimization hints:');
console.log('- Run Lighthouse tests in Chrome DevTools');
console.log('- Ensure all images are properly compressed');
console.log('- Verify mobile responsiveness on all pages');
console.log('- Test with slow network conditions');

console.log('\n✅ Pre-deployment checks complete!');
