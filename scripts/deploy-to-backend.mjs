import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../../public');

console.log('Deploying frontend build to Laravel public folder...');
if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, publicDir, { recursive: true, force: true });
  console.log('✓ Frontend build successfully deployed to backend public directory!');
} else {
  console.error('✗ dist directory does not exist. Run "npm run build" first.');
  process.exit(1);
}
