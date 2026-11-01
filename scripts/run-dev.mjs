import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const rootDir = process.cwd();
const envFile = path.join(rootDir, '.env.local');

const env = { ...process.env };

if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (v) env[k] = v;
    }
  }
}

const child = spawn('npx', ['next', 'dev', '-p', '3001'], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
