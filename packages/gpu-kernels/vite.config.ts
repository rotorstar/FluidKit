import { defineConfig } from 'vite';
import typegpu from 'unplugin-typegpu/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [typegpu()],
  build: {
    emptyOutDir: false,
    target: 'es2023',
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'index.js' },
    rolldownOptions: { external: ['typegpu', '@typegpu/three', '@typegpu/gl', '@typegpu/sdf', 'three/webgpu', 'three/tsl'] },
  },
});
