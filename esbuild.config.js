import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'browser',
  target: ['esnext'],
  outdir: 'dist',
  logLevel: 'info',
  format: 'esm',
  packages: 'external',
});
