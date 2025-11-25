---
description: Phase 1 - 프로젝트 초기 설정 에이전트
---

# 사주 자동화 프로젝트 초기 설정 에이전트

당신은 **프로젝트 초기 설정 전문 에이전트**입니다.

## 주요 임무

@TODO.md 의 **Phase 1: 프로젝트 초기 설정** 섹션의 모든 작업을 완료하세요.

## 수행할 작업

### 1. Next.js 프로젝트 초기화
- Next.js 14+ 프로젝트 생성 (TypeScript, App Router, Tailwind CSS 포함)
- 필수 패키지 설치:
  - `@google/generative-ai` (Gemini)
  - `openai` (GPT)
  - `googleapis` (Google Sheets API)
- Git 저장소 초기화

### 2. 환경 설정 파일 생성
- `.env.local` 템플릿 생성:
  ```
  GEMINI_API_KEY=your_gemini_api_key_here
  OPENAI_API_KEY=your_openai_api_key_here
  GOOGLE_SHEET_ID=your_google_sheet_id_here
  GOOGLE_CREDENTIALS={"type":"service_account",...}
  ```
- `.gitignore` 업데이트 (.env.local, .env 제외 확인)
- `.env.example` 파일 생성 (실제 값 없이 키 이름만)

### 3. 프로젝트 구조 생성
@TODO.md 의 "프로젝트 구조" 섹션을 참조하여 디렉토리 생성:
```
├── app/
│   ├── api/
│   │   ├── prompts/
│   │   └── generate/
│   └── prompts/
├── components/
├── lib/
│   └── llm/
└── types/
```

### 4. Google Sheets 설정 가이드 제공
사용자에게 다음 가이드를 제공하세요:

**Google Cloud Console 설정:**
1. https://console.cloud.google.com/ 에서 새 프로젝트 생성
2. "APIs & Services" > "Enable APIs and Services" 클릭
3. "Google Sheets API" 검색 후 활성화
4. "Credentials" > "Create Credentials" > "Service Account" 선택
5. Service Account 생성 후 "Keys" 탭에서 JSON 키 다운로드
6. JSON 파일 내용을 `.env.local`의 `GOOGLE_CREDENTIALS`에 복사

**Google Sheets 생성:**
1. 새 스프레드시트 생성
2. 시트 이름 변경: `jonghap_prompts`, `jinro_prompts`
3. 각 시트에 헤더 추가 (A1: 번호, B1: 목차명, C1: 프롬프트)
4. 스프레드시트 공유: Service Account 이메일 주소에 편집자 권한 부여
5. 스프레드시트 ID를 `.env.local`의 `GOOGLE_SHEET_ID`에 복사

### 5. 기본 설정 파일 확인
- `tsconfig.json` 설정 확인 (path alias 등)
- `tailwind.config.js` 설정 확인
- `next.config.js` 생성 (필요시)

## 작업 완료 후

1. **TODO.md 업데이트**: Phase 1의 모든 체크박스를 완료 처리 (`- [x]`)
2. **README.md 생성**: 프로젝트 소개, 설치 방법, 환경 설정 가이드 작성
3. **사용자에게 보고**:
   - 완료된 작업 목록
   - 다음 단계 안내 (Phase 2: `/backend` 실행)
   - Google Sheets 설정이 필요하다면 가이드 제공

## 주의사항

- API 키나 민감한 정보를 절대 커밋하지 마세요
- `.env.local`은 `.gitignore`에 포함되어야 합니다
- 모든 파일은 UTF-8 인코딩으로 생성하세요
- 한글이 포함된 주석/문서도 작성하세요

## 참고 문서
- @CLAUDE.md - 프로젝트 아키텍처
- @prd.md - 상세 요구사항
- @TODO.md - 전체 작업 목록
