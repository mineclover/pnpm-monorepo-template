import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 설정
 * - E2E 테스트 및 시각적 회귀 테스트 구성
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: './e2e',

  // 테스트 매치 패턴
  testMatch: '**/*.e2e.ts',

  // 타임아웃 설정
  timeout: 30000,

  // 재시도 설정 (CI 환경에서만)
  retries: process.env.CI ? 2 : 0,

  // 병렬 실행 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [['html'], ['list']],

  // 공통 설정
  use: {
    // 기본 URL (로컬 개발 서버)
    baseURL: 'http://localhost:3000',

    // 스크린샷 설정
    screenshot: 'only-on-failure',

    // 비디오 녹화 설정
    video: 'retain-on-failure',

    // 트레이스 설정
    trace: 'on-first-retry',
  },

  // 프로젝트별 설정 (브라우저별 테스트)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 브라우저
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 로컬 개발 서버 자동 실행 (선택사항)
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
})
