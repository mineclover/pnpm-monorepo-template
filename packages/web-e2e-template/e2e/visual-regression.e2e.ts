import { expect, test } from '@playwright/test'

/**
 * 시각적 회귀 테스트 예제
 * - 스크린샷 비교를 통한 UI 변경 감지
 * - 첫 실행 시 기준 이미지(baseline) 생성
 * - 이후 실행 시 기준 이미지와 비교
 */

test.describe('Visual Regression Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage full page screenshot', async ({ page }) => {
    // 전체 페이지 스크린샷
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      // 애니메이션 비활성화
      animations: 'disabled',
    })
  })

  test('homepage viewport screenshot', async ({ page }) => {
    // 뷰포트 영역만 스크린샷
    await expect(page).toHaveScreenshot('homepage-viewport.png', {
      animations: 'disabled',
    })
  })

  test('specific component screenshot', async ({ page }) => {
    // 특정 컴포넌트만 스크린샷
    const header = page.locator('header')
    await expect(header).toHaveScreenshot('header-component.png')

    const footer = page.locator('footer')
    await expect(footer).toHaveScreenshot('footer-component.png')
  })

  test('button hover state', async ({ page }) => {
    const button = page.getByRole('button', { name: /submit/i })

    // 일반 상태
    await expect(button).toHaveScreenshot('button-normal.png')

    // hover 상태
    await button.hover()
    await expect(button).toHaveScreenshot('button-hover.png')
  })

  test('modal dialog appearance', async ({ page }) => {
    // 모달 열기
    await page.getByRole('button', { name: /open modal/i }).click()

    // 모달 렌더링 대기
    await page.waitForSelector('[role="dialog"]')

    // 모달 스크린샷
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toHaveScreenshot('modal-dialog.png')
  })

  test('form validation states', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i)

    // 빈 상태
    await expect(emailInput).toHaveScreenshot('email-empty.png')

    // 유효하지 않은 입력
    await emailInput.fill('invalid-email')
    await emailInput.blur()
    await expect(emailInput).toHaveScreenshot('email-invalid.png')

    // 유효한 입력
    await emailInput.fill('valid@example.com')
    await emailInput.blur()
    await expect(emailInput).toHaveScreenshot('email-valid.png')
  })

  test('responsive design - mobile', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('responsive design - tablet', async ({ page }) => {
    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dark mode theme', async ({ page }) => {
    // 다크 모드로 전환
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')

    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('loading state', async ({ page }) => {
    // 네트워크 지연 시뮬레이션
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.goto('/')

    // 로딩 스피너 스크린샷
    const loadingIndicator = page.locator('[data-testid="loading"]')
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toHaveScreenshot('loading-spinner.png')
    }
  })
})

test.describe('Visual Regression - Cross Browser @visual', () => {
  test('homepage consistency across browsers', async ({ page }) => {
    await page.goto('/')

    // 브라우저별 스크린샷 (프로젝트 이름이 자동으로 포함됨)
    await expect(page).toHaveScreenshot('homepage-cross-browser.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Visual Regression - Accessibility @visual', () => {
  test('high contrast mode', async ({ page }) => {
    // 고대비 모드 활성화
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto('/')

    await expect(page).toHaveScreenshot('homepage-high-contrast.png', {
      fullPage: true,
    })
  })

  test('font scaling', async ({ page }) => {
    await page.goto('/')

    // 폰트 크기 증가 시뮬레이션
    await page.addStyleTag({
      content: '* { font-size: 1.5em !important; }',
    })

    await expect(page).toHaveScreenshot('homepage-font-scaled.png', {
      fullPage: true,
    })
  })
})
