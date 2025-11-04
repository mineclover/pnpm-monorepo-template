# pnpm-monorepo-template

> TypeScript 기반 모노레포 템플릿 - [`pnpm`](https://pnpm.io), [`turborepo`](https://turborepo.org), [`vitest`](https://vitest.dev), [`zod`](https://zod.dev)

Tested with:
- **Node.js v20.17.0**
- **pnpm v9.15.0**
- **vitest v2.1.8**

---------------------------------------------

## 개요

이 템플릿은 독립적이고 작은 단위의 라이브러리를 구성하기 위한 모노레포입니다.
각 패키지는 Git 서브모듈로 관리되어 독립적인 GitHub 저장소를 가질 수 있습니다.

### 핵심 원칙

1. **기능의 명확한 정의**: 각 라이브러리는 작고 직관적인 단일 목적을 가집니다
2. **환경별 구분**: API, CLI, Browser, Cross Platform으로 명확히 분리
3. **독립적인 컨텍스트 관리**: 각 패키지는 자체 인터페이스와 버전을 Git으로 관리
4. **타입 시스템 통합**: Zod를 통한 런타임 타입 검증 및 TypeScript 타입 통합
5. **최소한의 진입점**: 깊이 있는 계층 구조를 지양하고 명확한 진입점 제공

---------------------------------------------

## Table of Contents

- [개요](#개요)
- [아키텍처](#아키텍처)
- [포함된 도구](#포함된-도구)
- [템플릿 패키지](#템플릿-패키지)
- [사용 가능한 스크립트](#사용-가능한-스크립트)
- [테스트 구조](#테스트-구조)
- [FAQ](#faq)
- [라이선스](#-라이선스)

## 아키텍처

### 계층 구조

```
1. 환경 레이어 (Environment Layer)
   - API (Node.js 서버 환경)
   - CLI (Command Line Interface)
   - Browser (브라우저 환경)
   - Cross Platform (범용)

2. 기능 레이어 (Feature Layer)
   - 각 환경 위에서 동작하는 구체적인 기능 구현
```

### 패키지 구성 원칙

- **환경 인식**: 각 패키지는 자신이 동작하는 환경(Node.js, Browser, 또는 둘 다)을 명확히 정의
- **최소 책임**: 하나의 패키지는 하나의 명확한 책임만 가짐
- **버전 관리**: Git 서브모듈을 통한 독립적인 버전 관리
- **공유 의존성**: pnpm workspace를 통한 효율적인 node_modules 공유

## 포함된 도구

- `pnpm` workspace ([`pnpm-workspace.yaml`](/pnpm-workspace.yaml))
- `tsup` 번들러 ([`tsup.config.ts`](./tsup.config.ts))
- `turborepo` ([`turbo.json`](./turbo.json))
- `vitest` 테스트 엔진 ([`vitest.workspace.ts`](./vitest.workspace.ts))
- `biome` 린터 ([`biome.jsonc`](./biome.jsonc))
- `zod` 타입 시스템 (런타임 검증 + TypeScript 타입 추론)
- `playwright` E2E 및 시각적 회귀 테스트

## 템플릿 패키지

### 1. Web E2E Template ([`packages/web-e2e-template`](packages/web-e2e-template))

**환경**: Browser
**목적**: 웹 애플리케이션 E2E 및 시각적 회귀 테스트

**포함 기능**:
- Vitest 브라우저 모드 - 빠른 DOM 단위 테스트
- Playwright E2E - 실제 사용자 시나리오 테스트
- 시각적 회귀 테스트 - 스크린샷 비교를 통한 UI 변경 감지
- 크로스 브라우저 테스트 (Chromium, Firefox, WebKit)
- 모바일 브라우저 테스트

**사용 사례**:
- 웹 애플리케이션의 전체 사용자 플로우 검증
- UI 컴포넌트 시각적 일관성 검증
- 반응형 디자인 테스트
- 다크 모드 등 테마 변경 검증
- 접근성 기능 테스트

**시작하기**:
```bash
cd packages/web-e2e-template
pnpm install
pnpm run playwright:install
pnpm test
```

자세한 내용은 [Web E2E Template README](packages/web-e2e-template/README.md)를 참고하세요.

### 2. 추가 템플릿 (계획 중)

- **API Template**: Node.js API 서버를 위한 통합 테스트 템플릿
- **CLI Template**: CLI 도구를 위한 테스트 템플릿
- **Cross Platform Template**: 범용 유틸리티 라이브러리 템플릿

## 사용 가능한 스크립트

- `pnpm install`: 각 패키지에 필요한 의존성 설치
- `pnpm build`: TypeScript 패키지를 JavaScript로 트랜스파일
- `pnpm build:watch`: TypeScript 패키지를 JavaScript로 트랜스파일하고 변경 감지
- `pnpm check:exports`: [`@arethetypeswrong/cli`](https://www.npmjs.com/package/@arethetypeswrong/cli)를 사용하여 `package.json`의 `exports` 필드 검증
- `pnpm lint:ci`: `biome` 가이드라인 준수 여부 확인
- `pnpm lint`: `biome` 가이드라인 준수 여부 확인 및 자동 수정
- `pnpm test:unit`: 단위 테스트 실행
- `pnpm test:integration`: 통합 테스트 실행
- `pnpm test`: 모든 테스트 실행

## 테스트 구조

테스트는 다음과 같은 컨벤션을 따릅니다:

- 모든 테스트는 각 패키지의 `__tests__` 디렉토리에 작성
- 단위 테스트: `__tests__/unit` 폴더
- 통합 테스트: `__tests__/integration` 폴더

이 구조를 통해 로컬에서는 단위 테스트만 실행하고, CI에서는 외부 서비스(Docker 등)가 필요한 통합 테스트를 실행하는 등의 유연한 테스트 전략을 구사할 수 있습니다.

## FAQ

### 1. 새로운 패키지를 workspace에 추가하려면?

1. [`packages/`](packages/) 폴더에 `$packageName` 생성
2. `tsconfig.json` 파일 생성 (루트의 [`tsconfig.base.node.json`](./tsconfig.base.node.json) 참조)
3. `package.json` 파일 생성 ([`common-utils`](packages/common-utils) 참고)
4. 패키지의 환경(Node.js, Browser, Cross Platform)을 명확히 정의
5. Zod 스키마를 사용하여 타입 정의

### 2. 모든 패키지에서 사용할 의존성을 추가하려면?

```bash
pnpm add -w $dependencyName
```

### 3. Git 서브모듈로 패키지를 관리하려면?

```bash
# 기존 패키지를 서브모듈로 변환
git submodule add <repository-url> packages/$packageName

# 서브모듈 업데이트
git submodule update --remote packages/$packageName
```

### 4. Zod를 사용한 타입 시스템 구성은?

각 패키지에서 Zod 스키마를 정의하고 `z.infer`를 통해 TypeScript 타입을 추론합니다:

```typescript
import { z } from 'zod';

export const ConfigSchema = z.object({
  apiUrl: z.string().url(),
  timeout: z.number().positive(),
});

export type Config = z.infer<typeof ConfigSchema>;
```

## 📝 라이선스

[MIT](LICENSE) Licensed.
