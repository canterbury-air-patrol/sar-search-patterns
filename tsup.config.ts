import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['sar-search-patterns.ts', 'react.tsx'],
  format: ['cjs', 'esm'], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true
})
