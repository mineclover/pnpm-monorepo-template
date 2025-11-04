import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 브라우저 모드 활성화 - 실제 브라우저 환경에서 DOM 테스트
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
    // 테스트 파일 패턴
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.spec.ts'],
    // 전역 설정
    globals: true,
  },
})
