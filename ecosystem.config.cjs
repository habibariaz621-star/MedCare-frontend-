const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error(
    '[PM2] Missing .env at',
    envPath,
    '— copy .env.example to .env and set NEXT_PUBLIC_API_URL.',
  );
  process.exit(1);
}

dotenv.config({ path: envPath, override: true });

function cleanEnv(value) {
  if (value === undefined || value === null) return undefined;
  return String(value)
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .split(/\r?\n/)[0]
    .split(/\s+#/)[0]
    .trim();
}

function requireEnv(name) {
  const value = cleanEnv(process.env[name]);
  if (!value) {
    console.error(`[PM2] Required env var missing: ${name}`);
    process.exit(1);
  }
  return value;
}

const port = cleanEnv(process.env.PORT) || '3000';
const apiUrl = requireEnv('NEXT_PUBLIC_API_URL').replace(/\/+$/, '');

const productionEnv = {
  NODE_ENV: 'production',
  PORT: port,
  NEXT_PUBLIC_API_URL: apiUrl,
  NEXT_PUBLIC_USE_MOCK_AUTH: cleanEnv(process.env.NEXT_PUBLIC_USE_MOCK_AUTH) || 'false',
};

module.exports = {
  apps: [
    {
      name: 'medcare-web',
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${port}`,
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      time: true,
      merge_logs: true,
      kill_timeout: 5000,
      env: productionEnv,
    },
  ],
};
