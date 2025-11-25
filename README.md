# 사주 자동화 시스템

AI 기반 사주 풀이 자동 생성 시스템입니다. Google Sheets에 저장된 프롬프트를 사용하여 Gemini 또는 GPT를 통해 종합 사주와 진로 사주를 자동으로 생성합니다.

## 기술 스택

- **Frontend & Backend**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **LLM APIs**: Google Gemini, OpenAI GPT
- **Data Source**: Google Sheets API

## 주요 기능

### 1. 사주 생성
- **종합 사주**: 전체 운세, 5년 운세, 살 분석, 재물/직업운, 애정운, 인간관계, 건강운, 맞춤 질문
- **진로 사주**: 직업 기질, 커리어 운세, 핵심 능력, 재물/직업 연관성, 직장 관계, 이직 타이밍, 스트레스 관리, 맞춤 질문

### 2. 프롬프트 관리
- Google Sheets 기반 프롬프트 저장 및 관리
- 웹 인터페이스를 통한 프롬프트 편집
- 빈 프롬프트 자동 건너뛰기 로직

### 3. 변수 치환 시스템
- `{이름}`: 고객 이름
- `{명식표}`: 만세력 명식표 데이터
- `{추가질문}`: 맞춤 질문 내용

## 설치 방법

### 1. 프로젝트 클론 및 의존성 설치

\`\`\`bash
git clone <repository-url>
cd saju-automation
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env.local\` 파일을 생성하고 아래 정보를 입력하세요:

\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_CREDENTIALS={"type":"service_account",...}
\`\`\`

### 3. Google Cloud Console 설정

#### Service Account 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** > **Enable APIs and Services** 클릭
4. **Google Sheets API** 검색 후 활성화
5. **Credentials** > **Create Credentials** > **Service Account** 선택
6. Service Account 정보 입력 후 생성
7. Service Account 상세 페이지 > **Keys** 탭 > **Add Key** > **Create new key** > **JSON** 선택
8. 다운로드된 JSON 파일 내용을 `.env.local`의 `GOOGLE_CREDENTIALS`에 복사

### 4. Google Sheets 설정

#### 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com/) 에서 새 스프레드시트 생성
2. 두 개의 시트 생성:
   - `jonghap_prompts` (종합 사주)
   - `jinro_prompts` (진로 사주)

#### 시트 구조 설정
각 시트에 아래와 같은 헤더와 데이터를 입력하세요:

| A (번호) | B (목차명) | C (프롬프트) |
|---------|----------|------------|
| 1 | 사주 전체 해석 | 당신은 30년 경력의...<br>{이름}<br>{명식표}... |
| 2 | 올해부터 5년 간의 운세 | 아래 고객의...<br>{명식표}... |
| 3 | 내가 가진 '살' | 살(煞)을...<br>{명식표}... |
| ... | ... | ... |

**중요**: C열이 비어있으면 해당 프롬프트는 자동으로 건너뜁니다.

#### 권한 부여
1. 스프레드시트 **공유** 버튼 클릭
2. Service Account 이메일 주소 입력 (JSON 파일의 `client_email` 값)
3. **편집자** 권한 부여
4. 스프레드시트 URL에서 ID 복사 (예: `https://docs.google.com/spreadsheets/d/{GOOGLE_SHEET_ID}/edit`)
5. `.env.local`의 `GOOGLE_SHEET_ID`에 입력

### 5. API Keys 발급

#### Gemini API Key
1. [Google AI Studio](https://ai.google.dev/) 접속
2. **Get API Key** 클릭
3. 발급된 키를 `.env.local`의 `GEMINI_API_KEY`에 입력

#### OpenAI API Key
1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. **Create new secret key** 클릭
3. 발급된 키를 `.env.local`의 `OPENAI_API_KEY`에 입력

## 실행 방법

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 프로덕션 빌드

\`\`\`bash
npm run build
npm start
\`\`\`

### 린트 실행

\`\`\`bash
npm run lint
\`\`\`

## 프로젝트 구조

\`\`\`
saju-automation/
├── app/
│   ├── page.tsx                 # 메인: 사주 생성 페이지
│   ├── prompts/
│   │   └── page.tsx            # 프롬프트 관리 페이지
│   ├── layout.tsx              # 루트 레이아웃
│   ├── globals.css             # 전역 스타일
│   └── api/
│       ├── prompts/
│       │   └── route.ts        # GET, PUT - 프롬프트 조회/수정
│       └── generate/
│           └── route.ts        # POST - 사주 생성
│
├── components/
│   ├── Navigation.tsx          # 네비게이션 바
│   ├── SajuGenerator.tsx       # 사주 생성 컴포넌트
│   ├── PromptManager.tsx       # 프롬프트 관리 컴포넌트
│   ├── PromptList.tsx          # 프롬프트 목록
│   ├── PromptEditor.tsx        # 프롬프트 편집기
│   └── ...
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
│   └── index.ts                # TypeScript 타입 정의
│
├── .env.local                  # 환경 변수 (git 제외)
├── .env.example                # 환경 변수 템플릿
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
\`\`\`

## 사용 방법

### 1. 사주 생성
1. 메인 페이지에서 상품 선택 (종합 사주 / 진로 사주)
2. LLM 선택 (Gemini / GPT)
3. 고객 정보 입력
4. 명식표 텍스트 입력
5. 추가 질문 입력 (선택)
6. **생성 시작** 버튼 클릭
7. 결과 확인 및 복사

### 2. 프롬프트 관리
1. 프롬프트 관리 페이지 접속
2. 상품 선택 (종합 사주 / 진로 사주)
3. 편집할 프롬프트 선택
4. 프롬프트 수정 (변수: `{이름}`, `{명식표}`, `{추가질문}` 사용 가능)
5. 저장

**팁**: 프롬프트를 비워두면 해당 목차는 자동으로 건너뜁니다.

## 개발 단계

프로젝트는 5개의 Phase로 나뉘어 개발됩니다:

- ✅ **Phase 1**: 프로젝트 초기 설정
- ✅ **Phase 2**: 백엔드 개발 (LLM 클라이언트, 프롬프트 관리, API Routes)
- ✅ **Phase 3**: 프론트엔드 개발 (사주 생성 페이지, 프롬프트 관리 페이지)
- ✅ **Phase 4**: 테스트 및 통합 (자동화 테스트, 성능 테스트, 빌드 검증)
- ✅ **Phase 5**: 배포 (Vercel 배포 준비, 문서화)

상세 작업 내역은 [TODO.md](./TODO.md) 참조

## 배포

### 배포 준비 완료

- ✅ 프로덕션 빌드 테스트 완료
- ✅ 환경 변수 보안 점검 완료
- ✅ 배포 가이드 문서 작성 완료

### Vercel 배포

이 프로젝트는 Vercel에 최적화되어 있습니다.

**빠른 배포:**
1. [Vercel](https://vercel.com/) 계정 생성
2. GitHub 저장소 연동
3. 프로젝트 Import
4. Environment Variables 설정:
   - `GEMINI_API_KEY` - Google Gemini API 키
   - `OPENAI_API_KEY` - OpenAI API 키
   - `GOOGLE_SHEET_ID` - 구글 스프레드시트 ID
   - `GOOGLE_CREDENTIALS` - Service Account JSON 전체 문자열
5. Deploy 버튼 클릭

**상세 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md) 참조

**배포 후 확인:**
- 프로덕션 URL에서 모든 기능 테스트
- Vercel Logs에서 에러 확인
- 사주 생성 및 프롬프트 편집 기능 검증

## 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- Service Account JSON 키는 안전하게 보관하세요
- API 키는 주기적으로 교체하세요
- Google Sheets의 Service Account 권한은 최소한으로 유지하세요

## 라이선스

Private Project

## 문의

프로젝트 관련 문의사항은 이슈를 등록해주세요.
