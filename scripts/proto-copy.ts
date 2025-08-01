import { copy } from 'fs-extra';
import { join } from 'path';

async function main(packageName: string) {
  const root = process.cwd();
  const srcDir  = join(root, 'packages', packageName, 'src', 'grpc', 'proto');
  const outDir  = join(root, 'dist', 'packages', packageName, 'grpc', 'proto');

  await copy(srcDir, outDir);
  console.log(`Copied proto files from\n  ${srcDir}\n→ ${outDir}`);
}

main(process.argv[2]).catch(err => {
  console.error('proto-copy failed:', err);
  process.exit(1);
});
