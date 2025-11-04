import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'visual-diff',
    include: ['**/__tests__/**/*.test.ts', '**/unit/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
})
