import { copy } from 'fs-extra';
import { join } from 'path';

async function main() {
  const root = process.cwd();
  const srcDir  = join(root, 'apps', 'game-server', 'src', 'grpc', 'proto');
  const outDir  = join(root, 'dist', 'apps', 'game-server', 'grpc', 'proto');

  await copy(srcDir, outDir);
  console.log(`Copied proto files from\n  ${srcDir}\n→ ${outDir}`);
}

main().catch(err => {
  console.error('proto-copy failed:', err);
  process.exit(1);
});
