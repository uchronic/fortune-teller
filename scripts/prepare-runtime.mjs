import { cp, mkdir } from 'node:fs/promises';
const target = new URL('../public/runtime/', import.meta.url);
await mkdir(target, { recursive: true });
for (const name of ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
  await cp(new URL(`../node_modules/pyodide/${name}`, import.meta.url), new URL(name, target));
}
console.log('Prepared self-hosted Python runtime.');
