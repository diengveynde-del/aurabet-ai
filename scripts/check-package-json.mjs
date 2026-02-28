import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

try {
  JSON.parse(raw);
  console.log('package.json is valid JSON');
} catch (error) {
  console.error('Invalid package.json JSON syntax');
  console.error(error.message);
  process.exit(1);
}
