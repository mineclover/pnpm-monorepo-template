import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '**/*.config.{js,ts,mjs,mts}',
        '**/*.d.ts',
        '**/dist/**',
        '**/build/**',
        '**/__tests__/**',
        '**/test/**',
        '**/tests/**',
        '**/.turbo/**',
      ],
    },
  },
})
