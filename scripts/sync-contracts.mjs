// Copies the API contracts from the backend repo, which is their source of
// truth. Run after the backend changes a DTO:
//   node scripts/sync-contracts.mjs [path-to-polaris-be]
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const backendRoot = resolve(process.argv[2] ?? '../polaris-be');
const source = resolve(backendRoot, 'packages/contracts/src/index.ts');
const target = resolve(import.meta.dirname, '../src/contracts/index.ts');

const header =
  '// AUTO-SYNCED from polaris-be/packages/contracts/src/index.ts.\n' +
  '// Do not edit by hand — run `pnpm sync:contracts` instead.\n\n';

writeFileSync(target, header + readFileSync(source, 'utf8'));
console.log(`Synced contracts: ${source} -> ${target}`);
