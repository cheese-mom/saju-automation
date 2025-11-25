# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Saju (사주) automation system** that generates Korean fortune-telling readings using LLMs (Gemini or GPT). The system loads prompts from Google Sheets, executes them sequentially with variable substitution, and outputs formatted results ready for Google Docs.

**Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Google Sheets API, Gemini/OpenAI APIs

## Development Workflow

### TODO Management
**CRITICAL**: Always check and update `TODO.md` when working on tasks. This file tracks all development phases and must be kept current with completed items.

### Specialized Sub-Agents
This project uses specialized slash commands for each development phase. Use these commands to execute phase-specific tasks:

- `/setup` - **Phase 1: 프로젝트 초기 설정**
  - Next.js 프로젝트 초기화
  - 환경 변수 설정
  - Google Sheets 설정 가이드
  - 프로젝트 구조 생성

- `/backend` - **Phase 2: 백엔드 개발**
  - LLM 클라이언트 구현 (Gemini, GPT)
  - 프롬프트 관리 시스템 (Google Sheets 연동)
  - 사주 생성 엔진 (순차 실행, 건너뛰기 로직)
  - API Routes 구현

- `/frontend` - **Phase 3: 프론트엔드 개발**
  - 사주 생성 페이지
  - 프롬프트 관리 페이지
  - 공통 컴포넌트
  - Tailwind CSS 스타일링

- `/test` - **Phase 4: 테스트 및 통합**
  - 기능 테스트 (종합/진로 사주)
  - 건너뛰기 로직 검증
  - 에러 시나리오 테스트
  - 성능 및 UI/UX 테스트

- `/deploy` - **Phase 5: 배포**
  - Vercel 배포 설정
  - 환경 변수 구성
  - 프로덕션 검증
  - 모니터링 설정

**Usage**: Each agent automatically updates `TODO.md` upon completion of their phase.

### Setup Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check  # (if configured)

# Linting
npm run lint
```

### Environment Variables Required
Create `.env.local` with:
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI GPT API key
- `GOOGLE_SHEET_ID` - Google Spreadsheet ID containing prompts
- `GOOGLE_CREDENTIALS` - Service Account JSON (as string)

## Architecture

### Core Data Flow
1. **Prompt Management**: Google Sheets stores two product types (`jonghap_prompts`, `jinro_prompts`), each with 8 prompts (번호 | 목차명 | 프롬프트)
2. **Skip Logic**: Empty prompts (C column) are automatically skipped during generation
3. **Variable Substitution**: Three template variables: `{이름}`, `{명식표}`, `{추가질문}`
4. **Sequential Execution**: Prompts execute in order, collecting results
5. **Markdown Merge**: Results combine into structured document with table of contents

### Key Components

**lib/prompt-manager.ts**
- Authenticates with Google Sheets using Service Account
- `loadPrompts(productType)`: Fetches prompt array from sheet
- `updatePrompt(productType, index, text)`: Updates specific prompt

**lib/generator.ts**
- `SajuGenerator.generate()`: Main orchestration
  - Loads prompts via PromptManager
  - Skips empty prompts (logs "건너뛰기")
  - Substitutes `{이름}`, `{명식표}`, `{추가질문}` in templates
  - Calls LLM for each non-empty prompt
  - Merges results with `mergeResults()`

**lib/llm/client.ts**
- Defines `LLMClient` interface
- `createLLMClient(provider)`: Factory returns GeminiClient or GPTClient
- Both implementations include retry logic and error handling

### API Routes

**GET /api/prompts?product=jonghap|jinro**
- Returns array of prompts from Google Sheet
- Response: `{ prompts: Array<{index, title, prompt}> }`

**PUT /api/prompts**
- Body: `{ product, index, prompt }`
- Updates single prompt in Google Sheet

**POST /api/generate**
- Body: `{ product, llm, name, manseryeok, question }`
- Returns: `{ result: string, status: string }`
- Executes full generation pipeline with skip logic

## Google Sheets Structure

Two sheets required in spreadsheet:
- `jonghap_prompts`: 종합 사주 (comprehensive reading) - 8 sections
- `jinro_prompts`: 진로 사주 (career reading) - 8 sections

Column structure (A-C):
```
A (번호) | B (목차명) | C (프롬프트)
   1    | 사주 전체 해석 | 당신은 30년 경력의...{이름}...{명식표}...
   2    | 올해부터 5년 간의 운세 | ...
   3    | 내가 가진 '살' | [empty = skip]
```

**Service Account Setup**:
1. Create project in Google Cloud Console
2. Enable Google Sheets API
3. Create Service Account, download JSON key
4. Share spreadsheet with Service Account email

## Product Types

- `jonghap` (종합 사주): General fortune reading with 8 sections covering overall interpretation, 5-year forecast, 살(煞) analysis, wealth/career, romance, relationships, health, custom questions
- `jinro` (진로 사주): Career-focused reading with professional skills analysis, career forecast, abilities, job timing, workplace relationships

## Important Development Notes

### Skip Logic Example
If prompts 3 and 6 have empty C column:
- Only prompts 1, 2, 4, 5, 7, 8 execute
- Final output skips missing sections (no gaps in numbering)
- Console logs: `⏭ 프롬프트 3번 (목차명) 건너뛰기 (비어있음)`

### Template Variable Substitution
All prompts support three variables:
- `{이름}`: Customer name
- `{명식표}`: Manseryeok text (birth chart data)
- `{추가질문}`: Additional questions (defaults to "없음" if empty)

### Error Handling Priorities
- API key validation before LLM calls
- Google Sheets connection errors should be graceful
- Timeout handling for long-running LLM requests
- Clear user-facing error messages in Korean

## Type System

Core types in `types/index.ts`:
```typescript
type Product = 'jonghap' | 'jinro'
type LLMProvider = 'gemini' | 'gpt'

interface Prompt {
  index: number
  title: string
  prompt: string
}

interface GenerateRequest {
  product: Product
  llm: LLMProvider
  name: string
  manseryeok: string
  question?: string
}
```

## Deployment

Target: Vercel (single deployment for frontend + API Routes)
- All environment variables must be set in Vercel dashboard
- `GOOGLE_CREDENTIALS` stored as JSON string
- No separate backend deployment needed (Next.js handles both)
