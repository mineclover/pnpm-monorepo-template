# CLI Development Guidelines

모노레포 내 CLI 개발 시 따라야 할 가이드라인입니다.

## 핵심 원칙

### 단일 기능 명확성
- CLI는 **작은 기능 단위**로 명확하게 정의
- 확장성보다는 **단일 기능의 명확한 표현**에 집중
- 하나의 커맨드는 하나의 명확한 목적

### 커맨드 설계
- 옵션(flag)으로 기능을 분기하지 말고 **별도 커맨드로 분리**
- 예시:
  - ❌ `tool compare --only-differences`
  - ✅ `tool compare` / `tool compare-diff`

## 프로젝트 구조

```
packages/your-package/
├── src/           # 핵심 기능 구현
├── cli/           # CLI 레이어
│   ├── cli.js    # Node entry (tsx loader)
│   └── index.ts  # CLI 구현 (commander.js)
└── package.json
```

## 설정

### package.json
```json
{
  "type": "module",
  "files": ["build", "cli"],
  "bin": {
    "cli-name": "./cli/cli.js"
  }
}
```

### 의존성
- workspace 공유: `commander`, `tsx`, `@types/node`
- src 모듈 import 시 `.js` 확장자 필수

## 출력 규칙
- 파일 출력: 지정된 경로
- 결과 리포트: 동일 이름의 `.txt` 자동 생성

## 체크리스트
- [ ] `type: "module"` 설정
- [ ] `bin` 필드 설정
- [ ] `cli/cli.js` 실행 권한
- [ ] 각 기능을 별도 커맨드로 분리
- [ ] README에 CLI 문서 작성
- [ ] `pnpm link --global`로 테스트
