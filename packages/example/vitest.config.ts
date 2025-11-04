import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'example',
    include: ['**/__tests__/**/*.test.ts', '**/unit/**/*.test.ts', '**/integration/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
})
