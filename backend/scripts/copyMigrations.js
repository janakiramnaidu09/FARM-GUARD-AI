import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.resolve(__dirname, '../src/db/migrations'),
  path.resolve(__dirname, '../../database/migrations'),
];

const target = path.resolve(__dirname, '../dist/db/migrations');

let source = candidates.find((dir) => fs.existsSync(dir));

if (source) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const files = fs.readdirSync(source).filter((f) => f.endsWith('.sql'));
  for (const file of files) {
    fs.copyFileSync(path.join(source, file), path.join(target, file));
  }
  console.log(`[Build] Copied ${files.length} migration files from ${source} to ${target}`);
} else {
  console.warn('[Build] Warning: No migrations directory found to copy.');
}
