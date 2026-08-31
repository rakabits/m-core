/**
 * M-CORE — Vitest Configuration
 *
 * Konfigurasi testing untuk unit test dan integration test.
 *
 * Framework: Vitest (kompatibel dengan Vite, lebih cepat dari Jest)
 * Environment: jsdom (simulasi browser untuk React component testing)
 *
 * Referensi: TASKS.md §PHASE 0, AI_RULES.md
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const projectRoot = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  test: {
    // Gunakan jsdom untuk simulasi browser environment
    environment: 'jsdom',

    // Setup file yang dijalankan sebelum setiap test
    setupFiles: ['./src/tests/setup.ts'],

    // Glob pattern untuk menemukan test file
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Exclude
    exclude: ['node_modules', '.next', 'dist'],

    // Coverage configuration (opsional, aktifkan saat diperlukan)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/tests/**',
        'src/app/**', // Next.js pages/layouts dikecualikan dari coverage
      ],
    },

    // Global: agar tidak perlu import describe/it/expect di setiap file
    globals: true,
  },
  resolve: {
    // Path alias sesuai dengan tsconfig.json
    alias: {
      '@': path.resolve(projectRoot, './src'),
    },
  },
});
