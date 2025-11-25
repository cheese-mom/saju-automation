---
description: Phase 2 - 백엔드 개발 에이전트
---

# 사주 자동화 백엔드 개발 에이전트

당신은 **백엔드 개발 전문 에이전트**입니다.

## 주요 임무

@TODO.md 의 **Phase 2: 백엔드 개발 (Next.js API Routes)** 섹션의 모든 작업을 완료하세요.

## 수행할 작업

### 1. 타입 정의 (`types/index.ts`)
먼저 타입을 정의하세요:
```typescript
export type Product = 'jonghap' | 'jinro';
export type LLMProvider = 'gemini' | 'gpt';

export interface Prompt {
  index: number;
  title: string;
  prompt: string;
}

export interface GenerateRequest {
  product: Product;
  llm: LLMProvider;
  name: string;
  manseryeok: string;
  question?: string;
}

export interface GenerateResponse {
  result: string;
  status: string;
}
```

### 2. LLM 클라이언트 구현 (`lib/llm/`)

**`lib/llm/client.ts`** - 인터페이스 정의:
```typescript
export interface LLMClient {
  generate(prompt: string): Promise<string>;
}

export function createLLMClient(provider: LLMProvider): LLMClient;
```

**`lib/llm/gemini.ts`** - Gemini 구현:
- `@google/generative-ai` 사용
- 에러 핸들링 및 retry 로직 포함
- 환경 변수 `GEMINI_API_KEY` 사용

**`lib/llm/openai.ts`** - GPT 구현:
- `openai` 패키지 사용
- GPT-4o 모델 사용
- 에러 핸들링 및 retry 로직 포함
- 환경 변수 `OPENAI_API_KEY` 사용

### 3. 프롬프트 관리 시스템 (`lib/prompt-manager.ts`)

**핵심 기능:**
- Google Sheets API 인증 (Service Account)
- `loadPrompts(productType)`: 시트에서 프롬프트 로드
- `updatePrompt(productType, index, promptText)`: 프롬프트 업데이트

**참고:** @prd.md 의 4.2절 "구글 시트 API 연동" 참조

**시트 이름:**
- 종합 사주: `jonghap_prompts`
- 진로 사주: `jinro_prompts`

**데이터 구조:**
- A열: 번호 (1-8)
- B열: 목차명
- C열: 프롬프트 (비어있으면 건너뛰기)

### 4. 사주 생성 엔진 (`lib/generator.ts`)

**`SajuGenerator` 클래스:**

```typescript
class SajuGenerator {
  constructor(llmClient: LLMClient, promptManager: PromptManager);

  async generate(
    productType: Product,
    customerName: string,
    manseryeokText: string,
    additionalQuestion?: string
  ): Promise<string>;

  private mergeResults(results: Array<{index, title, content}>, name: string): string;
}
```

**핵심 로직:**
1. 구글 시트에서 프롬프트 로드
2. **순차 실행**: 각 프롬프트를 순서대로 실행
3. **건너뛰기**: `prompt`가 비어있으면 건너뛰기 (콘솔에 "⏭ 프롬프트 N번 건너뛰기" 출력)
4. **변수 치환**: `{이름}`, `{명식표}`, `{추가질문}` 치환
5. **LLM 호출**: 각 프롬프트 실행
6. **결과 병합**: 마크다운 형식으로 병합

**참고:** @prd.md 의 4.3절 "프롬프트 실행 로직" 참조

### 5. API Routes 구현

**`app/api/prompts/route.ts`:**
- **GET**: 프롬프트 목록 조회
  - Query: `?product=jonghap|jinro`
  - Response: `{ prompts: Prompt[] }`
- **PUT**: 프롬프트 업데이트
  - Body: `{ product, index, prompt }`
  - Response: `{ status: 'success' }`

**`app/api/generate/route.ts`:**
- **POST**: 사주 생성
  - Body: `GenerateRequest`
  - Response: `GenerateResponse`
  - 타임아웃: 최대 5분 (Vercel 제한 고려)

### 6. 에러 핸들링

모든 API에서 처리해야 할 에러:
- API 키 누락/유효하지 않음
- Google Sheets 연결 실패
- LLM API 호출 실패
- 타임아웃
- 네트워크 오류

에러 메시지는 한글로 사용자에게 친절하게 전달하세요.

## 작업 완료 후

1. **TODO.md 업데이트**: Phase 2의 모든 체크박스를 완료 처리
2. **테스트 수행**:
   - 구글 시트 연동 확인
   - Gemini API 호출 테스트
   - GPT API 호출 테스트
   - 건너뛰기 로직 테스트
3. **사용자에게 보고**:
   - 완료된 작업 목록
   - API 엔드포인트 목록
   - 다음 단계 안내 (Phase 3: `/frontend` 실행)

## 주의사항

- 환경 변수 검증을 반드시 수행하세요
- LLM API 호출 시 retry 로직 포함 (최대 3회)
- 긴 텍스트 생성 시 타임아웃 고려
- 모든 에러는 로그에 기록하세요

## 참고 문서
- @CLAUDE.md - 아키텍처 및 데이터 플로우
- @prd.md - 4장 (프롬프트 관리), 6장 (백엔드 API)
- @TODO.md - Phase 2 상세 작업
