import { expect, test } from '@playwright/test'

/**
 * E2E 테스트 예제
 * - 실제 브라우저에서 페이지 탐색 및 상호작용 테스트
 */

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Home/i)

    // 특정 요소 존재 확인
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
  })

  test('should navigate to about page', async ({ page }) => {
    // 네비게이션 링크 클릭
    await page.getByRole('link', { name: /about/i }).click()

    // URL 확인
    await expect(page).toHaveURL(/.*about/)

    // 페이지 콘텐츠 확인
    await expect(page.getByText(/about us/i)).toBeVisible()
  })

  test('should submit contact form', async ({ page }) => {
    // 폼 입력
    await page.getByLabel(/name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/message/i).fill('This is a test message')

    // 폼 제출
    await page.getByRole('button', { name: /submit/i }).click()

    // 성공 메시지 확인
    await expect(page.getByText(/thank you/i)).toBeVisible()
  })

  test('should handle form validation', async ({ page }) => {
    // 빈 폼 제출 시도
    await page.getByRole('button', { name: /submit/i }).click()

    // 에러 메시지 확인
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })
})

test.describe('Responsive Design Tests', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 햄버거 메뉴 버튼 확인
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    await expect(mobileMenuButton).toBeVisible()

    // 메뉴 열기
    await mobileMenuButton.click()

    // 모바일 메뉴 콘텐츠 확인
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})

test.describe('Performance Tests', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    // 3초 이내 로딩 확인
    expect(loadTime).toBeLessThan(3000)
  })
})
