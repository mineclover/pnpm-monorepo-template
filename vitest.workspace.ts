import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/common-utils/vitest.config.ts',
  'packages/example/vitest.config.ts',
  'packages/visual-diff/vitest.config.ts',
  'packages/web-e2e-template/vitest.config.ts',
])
