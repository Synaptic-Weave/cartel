import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('Reading Terraform outputs...');
  const output = execSync('terraform output -json', { cwd: path.join(__dirname, '../terraform') }).toString();
  const outputs = JSON.parse(output);

  if (!outputs.firebase_config || !outputs.firebase_config.value) {
    throw new Error('No firebase_config found in Terraform outputs. Please run terraform apply first.');
  }

  const config = outputs.firebase_config.value;
  const envContent = `VITE_FIREBASE_API_KEY=${config.apiKey || ''}
VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain || ''}
VITE_FIREBASE_PROJECT_ID=${config.projectId || ''}
VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket || ''}
VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId || ''}
VITE_FIREBASE_APP_ID=${config.appId || ''}
`;

  // Write to both .env.production and .env to ensure local builds/previews work seamlessly
  fs.writeFileSync(path.join(__dirname, '../.env.production'), envContent);
  fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
  console.log('Successfully generated .env.production and .env files!');
} catch (error) {
  console.error('Error generating .env file:', error.message);
  process.exit(1);
}
