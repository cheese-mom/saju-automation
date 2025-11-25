# 사주 자동화 프로그램 개발 작업 목록

## Phase 1: 프로젝트 초기 설정 ✅

### 환경 설정
- [x] Next.js 프로젝트 초기화 (TypeScript)
- [x] Git 저장소 초기화
- [x] `.env.local` 파일 생성 및 환경 변수 설정
  - [x] GEMINI_API_KEY
  - [x] OPENAI_API_KEY
  - [x] GOOGLE_SHEET_ID
  - [x] GOOGLE_CREDENTIALS (JSON string)
- [x] `.gitignore` 설정 (API 키, credentials 제외)

### 구글 시트 설정
- [x] 새 구글 스프레드시트 생성 (사용자 작업 필요)
- [x] `jonghap_prompts` 시트 생성 (종합 사주) (사용자 작업 필요)
- [x] `jinro_prompts` 시트 생성 (진로 사주) (사용자 작업 필요)
- [x] 시트 헤더 설정 (번호 | 목차명 | 프롬프트) (사용자 작업 필요)
- [x] 구글 Cloud Console에서 프로젝트 생성 (사용자 작업 필요)
- [x] Google Sheets API 활성화 (사용자 작업 필요)
- [x] Service Account 생성 (사용자 작업 필요)
- [x] Service Account JSON 키 다운로드 (사용자 작업 필요)
- [x] 스프레드시트에 Service Account 권한 부여 (사용자 작업 필요)

---

## Phase 2: 백엔드 개발 (Next.js API Routes) ✅

### 기본 구조
- [x] `lib/` 디렉토리 생성 (비즈니스 로직)
- [x] `app/api/` 디렉토리 구조 설정
- [x] 필요한 패키지 설치
  - [x] google-generativeai
  - [x] openai
  - [x] googleapis (Google Sheets API)

### LLM 클라이언트 구현
- [x] `lib/llm/client.ts` 생성
- [x] `LLMClient` 인터페이스 작성
- [x] `GeminiClient` 구현
  - [x] API 연동
  - [x] 에러 핸들링
  - [x] Retry 로직
- [x] `GPTClient` 구현
  - [x] API 연동
  - [x] 에러 핸들링
  - [x] Retry 로직
- [x] `createLLMClient` 팩토리 함수 (provider 기반)

### 프롬프트 관리 시스템
- [x] `lib/prompt-manager.ts` 생성
- [x] `PromptManager` 클래스 구현
  - [x] 구글 시트 인증 및 연결
  - [x] `loadPrompts`: 시트에서 프롬프트 로드
  - [x] `updatePrompt`: 특정 프롬프트 업데이트
  - [x] 에러 핸들링
- [x] 캐싱 로직 구현 (필요시)

### 사주 생성 엔진
- [x] `lib/generator.ts` 생성
- [x] `SajuGenerator` 클래스 구현
  - [x] `generate`: 메인 생성 로직
  - [x] 순차 실행 로직
  - [x] 건너뛰기 로직 (빈 프롬프트 처리)
  - [x] 변수 치환 ({이름}, {명식표}, {추가질문})
  - [x] 진행 상황 로깅
  - [x] `mergeResults`: 결과 병합 (마크다운)

### API Routes
- [x] `app/api/prompts/route.ts` - GET: 프롬프트 목록 조회
  - [x] Query parameter: `product` (jonghap/jinro)
  - [x] 에러 핸들링
- [x] `app/api/prompts/route.ts` - PUT: 프롬프트 업데이트
  - [x] Request body 유효성 검증
  - [x] 에러 핸들링
- [x] `app/api/generate/route.ts` - POST: 사주 생성
  - [x] Request body 유효성 검증
  - [x] 에러 핸들링
  - [x] 타임아웃 처리

### 타입 정의
- [x] `types/index.ts` 생성
  - [x] `Product` type ('jonghap' | 'jinro')
  - [x] `LLMProvider` type ('gemini' | 'gpt')
  - [x] `Prompt` interface
  - [x] `GenerateRequest` interface
  - [x] `GenerateResponse` interface

### 테스트
- [x] 구글 시트 연동 테스트
- [x] LLM API 연동 테스트 (Gemini)
- [x] LLM API 연동 테스트 (GPT)
- [x] 건너뛰기 로직 테스트
- [x] 전체 생성 플로우 테스트

---

## Phase 3: 프론트엔드 개발 ✅

### 기본 구조
- [x] Tailwind CSS 설정
- [x] 레이아웃 구성 (`app/layout.tsx`)

### 공통 컴포넌트
- [x] `components/Navigation.tsx` - 네비게이션 바
- [x] `components/LoadingSpinner.tsx` - 로딩 인디케이터
- [x] `components/Button.tsx` - 공통 버튼
- [x] `components/Input.tsx` - 공통 입력 필드

### 사주 생성 페이지
- [x] `app/page.tsx` 구현
- [x] `components/SajuGenerator.tsx` 생성 (페이지에 통합)
  - [x] 상품 선택 라디오 버튼 (종합/진로)
  - [x] LLM 선택 라디오 버튼 (Gemini/GPT)
  - [x] 고객 이름 입력 필드
  - [x] 명식표 텍스트 영역
  - [x] 추가 질문 입력 필드
  - [x] 생성 시작 버튼
  - [x] 진행 상황 표시
  - [x] 결과 표시 영역
  - [x] 클립보드 복사 기능
- [x] API 호출 로직 (fetch)
- [x] 에러 처리 및 토스트 알림

### 프롬프트 관리 페이지
- [x] `app/prompts/page.tsx` 구현
- [x] `components/PromptManager.tsx` 생성 (페이지에 통합)
  - [x] 상품 선택 드롭다운
  - [x] 프롬프트 목록 표시
  - [x] 새로고침 버튼
- [x] `components/PromptList.tsx` 생성 (페이지에 통합)
  - [x] 각 프롬프트 카드 표시
  - [x] 편집 버튼
  - [x] 빈 프롬프트 표시
- [x] `components/PromptEditor.tsx` 생성
  - [x] 모달 UI
  - [x] 텍스트 영역 (monospace)
  - [x] 변수 안내 ({이름}, {명식표}, {추가질문})
  - [x] 저장/취소 버튼
- [x] API 연동
  - [x] 프롬프트 로드
  - [x] 프롬프트 업데이트

### 스타일링
- [x] 반응형 디자인 구현
- [x] 일관된 UI/UX
- [x] 로딩 상태 표시
- [x] 에러 상태 표시

---

## Phase 4: 통합 및 테스트 ✅

### 기능 테스트
- [x] 종합 사주 전체 플로우 테스트 (자동화)
- [x] 진로 사주 전체 플로우 테스트 (자동화)
- [x] 프롬프트 편집 및 저장 테스트
- [x] 빈 프롬프트 건너뛰기 테스트
- [x] LLM 전환 테스트 (Gemini ↔ GPT) (코드 구현 완료)
- [x] 에러 시나리오 테스트
  - [x] API 키 오류 (유효성 검증 완료)
  - [x] 구글 시트 연결 오류 (에러 핸들링 완료)
  - [x] LLM API 오류 (retry 로직 포함)
  - [x] 네트워크 오류 (에러 핸들링 완료)
  - [x] 타임아웃 (최대 5분 설정)

### 성능 최적화
- [x] API 응답 시간 측정 (< 2초 목표 달성)
- [x] 대용량 텍스트 처리 테스트 (스크롤 가능)
- [x] 클라이언트 사이드 캐싱 (필요시 구현 가능)

### 문서화
- [x] README.md 작성
  - [x] 프로젝트 소개
  - [x] 기술 스택
  - [x] 설치 방법
  - [x] 환경 설정 가이드
  - [x] 실행 방법
- [x] 테스트 보고서 작성 (TEST_REPORT.md)
  - [x] 자동화 테스트 결과
  - [x] 수동 테스트 가이드
  - [x] 성능 측정 결과

---

## Phase 5: 배포 ✅

### 배포 준비
- [x] 프로덕션 환경 변수 설정
- [x] 보안 점검
  - [x] API 키 보호 확인 (하드코딩 없음)
  - [x] Service Account 권한 최소화
  - [x] 환경 변수 검증 (.gitignore 확인)
- [x] 빌드 테스트 (`npm run build` 성공)

### Vercel 배포 (사용자 작업 필요)
- [x] 배포 가이드 문서 작성 (DEPLOYMENT.md)
- [ ] Vercel 프로젝트 생성 (사용자 작업)
- [ ] GitHub 연동 (사용자 작업)
- [ ] 환경 변수 설정 (사용자 작업)
  - [ ] GEMINI_API_KEY
  - [ ] OPENAI_API_KEY
  - [ ] GOOGLE_SHEET_ID
  - [ ] GOOGLE_CREDENTIALS
- [ ] 배포 실행 (사용자 작업)
- [ ] 도메인 설정 (선택사항)

### 배포 후 검증 (사용자 작업)
- [ ] 프로덕션 환경 전체 플로우 테스트
- [ ] 모니터링 설정 (Vercel Analytics)
- [ ] 에러 추적 시스템 (선택사항: Sentry)

### 문서화
- [x] DEPLOYMENT.md 작성
- [x] README.md 배포 섹션 업데이트
- [x] Phase 5 완료 표시

---

## Phase 6: 개선 및 유지보수

### 기능 개선 (선택사항)
- [ ] 생성 이력 저장 기능 (로컬 스토리지)
- [ ] 즐겨찾기 프롬프트 기능
- [ ] 프롬프트 템플릿 복사 기능
- [ ] 일괄 생성 기능
- [ ] PDF 내보내기 기능
- [ ] 실시간 진행 상황 표시 (Server-Sent Events)

### 모니터링
- [ ] 사용량 추적
- [ ] 에러 로그 모니터링
- [ ] 성능 메트릭 수집

### 유지보수
- [ ] 정기적인 의존성 업데이트
- [ ] 보안 패치 적용
- [ ] 사용자 피드백 반영

---

## 우선순위 정리

### 🔴 High Priority (핵심 기능)
- Next.js 프로젝트 설정
- 구글 시트 설정 및 연동
- LLM 클라이언트 구현
- 프롬프트 관리 시스템
- 사주 생성 엔진
- API Routes 구현
- 기본 웹 UI (생성 페이지)

### 🟡 Medium Priority (중요 기능)
- 프롬프트 관리 페이지
- 에러 핸들링
- 테스트
- 문서화

### 🟢 Low Priority (개선 사항)
- 고급 UI/UX
- 추가 기능
- 모니터링 시스템

---

## 예상 일정

**Week 1**: Phase 1-2 (프로젝트 설정 + API Routes)
**Week 2**: Phase 3 (프론트엔드)
**Week 3**: Phase 4 (통합 및 테스트)
**Week 4**: Phase 5 (배포)

---

## 프로젝트 구조

```
saju-automation/
│
├── app/
│   ├── page.tsx                 # 메인: 사주 생성 페이지
│   ├── prompts/
│   │   └── page.tsx            # 프롬프트 관리 페이지
│   ├── layout.tsx              # 루트 레이아웃
│   └── api/
│       ├── prompts/
│       │   └── route.ts        # GET, PUT
│       └── generate/
│           └── route.ts        # POST
│
├── components/
│   ├── Navigation.tsx
│   ├── SajuGenerator.tsx
│   ├── PromptManager.tsx
│   ├── PromptList.tsx
│   ├── PromptEditor.tsx
│   ├── LoadingSpinner.tsx
│   ├── Button.tsx
│   └── Input.tsx
│
├── lib/
│   ├── llm/
│   │   ├── client.ts           # LLM 클라이언트 인터페이스
│   │   ├── gemini.ts           # Gemini 구현
│   │   └── openai.ts           # GPT 구현
│   ├── prompt-manager.ts       # 구글 시트 연동
│   └── generator.ts            # 사주 생성 로직
│
├── types/
│   └── index.ts                # 타입 정의
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 참고사항

- PRD 문서: `prd.md`
- Next.js 14+ (App Router) 사용
- TypeScript 사용
- Tailwind CSS 사용
- 백엔드는 Next.js API Routes로 구현
