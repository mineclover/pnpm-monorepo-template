# Web E2E Template

> Vitest 브라우저 모드와 Playwright를 조합한 E2E 및 시각적 회귀 테스트 템플릿

## 개요

이 패키지는 웹 애플리케이션을 위한 종합적인 테스트 환경을 제공합니다:

- **Vitest 브라우저 모드**: 빠른 단위/통합 테스트를 실제 브라우저 환경에서 실행
- **Playwright E2E**: 실제 사용자 시나리오를 시뮬레이션하는 엔드투엔드 테스트
- **시각적 회귀 테스트**: 스크린샷 비교를 통한 UI 변경 감지

## 환경

- **타입**: Browser
- **테스트 도구**: Vitest (browser mode), Playwright
- **지원 브라우저**: Chromium, Firefox, WebKit

## 설치

```bash
pnpm install
pnpm run playwright:install
```

## 사용 가능한 스크립트

```bash
# 모든 테스트 실행 (Vitest + Playwright)
pnpm test

# Vitest 단위 테스트만 실행
pnpm test:unit

# Vitest 감시 모드
pnpm test:watch

# Playwright E2E 테스트 실행
pnpm test:e2e

# Playwright UI 모드로 실행 (디버깅)
pnpm test:e2e:ui

# 헤드리스 모드 비활성화 (브라우저 표시)
pnpm test:e2e:headed

# 시각적 회귀 테스트만 실행
pnpm test:visual
```

## 디렉토리 구조

```
web-e2e-template/
├── __tests__/          # Vitest 테스트
│   └── unit/           # 단위 테스트
├── e2e/                # Playwright E2E 테스트
│   ├── example.e2e.ts           # E2E 테스트 예제
│   └── visual-regression.e2e.ts # 시각적 회귀 테스트
├── playwright.config.ts         # Playwright 설정
├── vitest.config.ts             # Vitest 설정
└── package.json
```

## Vitest 브라우저 모드

### 특징

- 실제 브라우저 환경에서 테스트 실행 (jsdom이 아닌)
- DOM API 완전 지원
- LocalStorage, SessionStorage 등 브라우저 API 테스트
- 빠른 실행 속도 및 HMR 지원

### 예제

```typescript
import { describe, it, expect } from 'vitest';

describe('DOM Tests', () => {
  it('should manipulate DOM', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    expect(div.textContent).toBe('Hello');
  });

  it('should use localStorage', () => {
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
  });
});
```

## Playwright E2E 테스트

### 특징

- 실제 브라우저 자동화 (사용자 시나리오 시뮬레이션)
- 크로스 브라우저 테스트 (Chromium, Firefox, WebKit)
- 네트워크 모킹, 스크린샷, 비디오 녹화
- 병렬 실행 및 재시도 지원

### 예제

```typescript
import { test, expect } from '@playwright/test';

test('should navigate and interact', async ({ page }) => {
  await page.goto('/');

  // 요소 클릭
  await page.getByRole('button', { name: /submit/i }).click();

  // 결과 확인
  await expect(page.getByText(/success/i)).toBeVisible();
});
```

## 시각적 회귀 테스트

### 특징

- 스크린샷 자동 비교
- 기준 이미지(baseline) 관리
- 픽셀 단위 차이 감지
- 브라우저별, 뷰포트별 비교

### 첫 실행 (기준 이미지 생성)

```bash
pnpm test:visual
```

첫 실행 시 `e2e/__screenshots__/` 디렉토리에 기준 이미지가 생성됩니다.

### 이후 실행 (비교)

동일한 명령어로 실행하면 현재 스크린샷과 기준 이미지를 비교합니다:

```bash
pnpm test:visual
```

차이가 발견되면 테스트가 실패하고 diff 이미지가 생성됩니다.

### 예제

```typescript
import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  await page.goto('/');

  // 전체 페이지 스크린샷 비교
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    animations: 'disabled',
  });
});

test('component screenshot', async ({ page }) => {
  await page.goto('/');

  // 특정 컴포넌트만 스크린샷
  const header = page.locator('header');
  await expect(header).toHaveScreenshot('header.png');
});
```

### 기준 이미지 업데이트

UI 변경이 의도적일 경우 기준 이미지를 업데이트:

```bash
pnpm test:visual -- --update-snapshots
```

## 디버깅

### Playwright UI 모드

대화형 UI로 테스트 실행 및 디버깅:

```bash
pnpm test:e2e:ui
```

### 브라우저 표시 모드

테스트 실행 중 브라우저를 표시:

```bash
pnpm test:e2e:headed
```

### 특정 테스트만 실행

```bash
# 파일 이름으로 필터링
pnpm test:e2e example.e2e.ts

# 테스트 이름으로 필터링
pnpm test:e2e --grep "should load homepage"
```

## CI/CD 통합

### GitHub Actions 예제

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm --filter @template/web-e2e-template run playwright:install

      - name: Run tests
        run: pnpm --filter @template/web-e2e-template test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: packages/web-e2e-template/playwright-report/
```

## 모범 사례

### 1. 역할 분리

- **Vitest**: 빠른 단위/통합 테스트, DOM 로직 검증
- **Playwright E2E**: 사용자 시나리오, 페이지 간 네비게이션
- **시각적 회귀**: UI 변경 감지, 스타일 검증

### 2. 테스트 작성 팁

```typescript
// ✅ Good: 역할과 이름으로 요소 선택
await page.getByRole('button', { name: /submit/i });

// ❌ Bad: CSS 셀렉터 직접 사용
await page.locator('.btn-submit');
```

### 3. 안정적인 테스트

```typescript
// 애니메이션 비활성화
await expect(page).toHaveScreenshot('page.png', {
  animations: 'disabled',
});

// 동적 콘텐츠 마스킹
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('.timestamp')],
});
```

### 4. 성능 최적화

- 병렬 실행 활용 (`workers` 설정)
- 필요한 브라우저만 테스트
- 시각적 회귀 테스트는 중요한 페이지만 선택적으로

## 문제 해결

### 스크린샷 차이 발생 시

1. `playwright-report/` 디렉토리에서 diff 이미지 확인
2. 의도적인 변경이면 `--update-snapshots`로 업데이트
3. 의도하지 않은 변경이면 코드 수정

### CI에서 실패 시

- 브라우저 버전 차이: Playwright 버전 통일
- 폰트 차이: CI 환경에 폰트 설치
- 타이밍 이슈: `waitForLoadState()` 추가

## 참고 자료

- [Vitest Browser Mode](https://vitest.dev/guide/browser.html)
- [Playwright Documentation](https://playwright.dev/)
- [Visual Regression Testing Guide](https://playwright.dev/docs/test-snapshots)
