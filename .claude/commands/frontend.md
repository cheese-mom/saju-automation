---
description: Phase 3 - 프론트엔드 개발 에이전트
---

# 사주 자동화 프론트엔드 개발 에이전트

당신은 **프론트엔드 개발 전문 에이전트**입니다.

## 주요 임무

@TODO.md 의 **Phase 3: 프론트엔드 개발** 섹션의 모든 작업을 완료하세요.

## 수행할 작업

### 1. 레이아웃 및 네비게이션

**`app/layout.tsx`:**
- 루트 레이아웃 구성
- Tailwind CSS 임포트
- 메타데이터 설정 (제목: "사주 자동화")
- 한글 폰트 설정

**`components/Navigation.tsx`:**
- 두 개의 페이지 링크:
  - "사주 생성" (/)
  - "프롬프트 관리" (/prompts)
- 반응형 네비게이션 바

### 2. 공통 컴포넌트

**`components/LoadingSpinner.tsx`:**
- 로딩 인디케이터 컴포넌트
- Tailwind CSS로 스타일링

**`components/Button.tsx`:**
- 재사용 가능한 버튼 컴포넌트
- variants: primary, secondary, danger

**`components/Input.tsx`:**
- 재사용 가능한 입력 필드
- label, placeholder, error 상태 지원

### 3. 사주 생성 페이지 (`app/page.tsx`)

**UI 구성 (@prd.md 5.1절 참조):**

1. **상품 선택**: 라디오 버튼
   - ○ 종합 사주 (jonghap)
   - ○ 진로 사주 (jinro)

2. **LLM 선택**: 라디오 버튼
   - ○ Gemini
   - ○ GPT

3. **고객 정보**:
   - 이름 입력 필드

4. **명식표 입력**:
   - 큰 텍스트 영역 (10줄 이상)
   - placeholder: "만세력 명식표를 입력하세요..."

5. **추가 질문** (선택):
   - 텍스트 입력 필드
   - placeholder: "추가 질문이 있다면 입력하세요..."

6. **생성 버튼**:
   - "사주 생성 시작" 버튼
   - 로딩 중에는 비활성화

7. **결과 표시**:
   - 마크다운 형식으로 결과 표시
   - "클립보드 복사" 버튼

**API 연동:**
```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product,
    llm,
    name,
    manseryeok,
    question
  })
});
```

**에러 처리:**
- API 호출 실패 시 에러 메시지 표시
- 필수 필드 검증
- 로딩 상태 표시

### 4. 프롬프트 관리 페이지 (`app/prompts/page.tsx`)

**UI 구성 (@prd.md 5.1절 참조):**

1. **상품 선택 드롭다운**:
   - 종합 사주 / 진로 사주 선택

2. **프롬프트 목록**:
   - 1번부터 8번까지 각 프롬프트 카드 표시
   - 각 카드:
     - 번호와 목차명
     - 프롬프트 미리보기 (축약)
     - "편집" 버튼
     - 비어있으면 "(비어있음 - 건너뜀)" 표시

3. **새로고침 버튼**:
   - "구글 시트에서 새로고침"

**`components/PromptEditor.tsx`:**
- 모달 형태의 에디터
- 큰 텍스트 영역 (monospace 폰트)
- 변수 안내 표시: `{이름}`, `{명식표}`, `{추가질문}`
- "저장" / "취소" 버튼

**API 연동:**
```typescript
// 프롬프트 로드
const response = await fetch(`/api/prompts?product=${product}`);
const { prompts } = await response.json();

// 프롬프트 업데이트
await fetch('/api/prompts', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ product, index, prompt })
});
```

### 5. 스타일링

**Tailwind CSS 사용:**
- 반응형 디자인 (mobile-first)
- 일관된 색상 팔레트
- 적절한 spacing 및 typography
- hover, focus 상태 스타일링

**접근성:**
- 적절한 aria-label
- 키보드 네비게이션 지원
- 포커스 표시

### 6. 사용자 경험

**로딩 상태:**
- 사주 생성 중: 로딩 스피너 + "사주를 생성하는 중입니다... (최대 5분 소요)"
- 프롬프트 로드 중: 스켈레톤 UI

**피드백:**
- 성공 시: 토스트 알림 (녹색)
- 에러 시: 토스트 알림 (빨간색)
- 클립보드 복사 시: "복사되었습니다!" 알림

**에러 메시지 (한글):**
- "API 키가 설정되지 않았습니다."
- "구글 시트에 연결할 수 없습니다."
- "LLM API 호출에 실패했습니다."
- "필수 항목을 입력해주세요."

## 작업 완료 후

1. **TODO.md 업데이트**: Phase 3의 모든 체크박스를 완료 처리
2. **테스트**:
   - 두 페이지 간 네비게이션 확인
   - 폼 제출 및 유효성 검증
   - 프롬프트 편집 및 저장
   - 반응형 디자인 확인
3. **사용자에게 보고**:
   - 완료된 컴포넌트 목록
   - 스크린샷 (선택사항)
   - 다음 단계 안내 (Phase 4: `/test` 실행)

## 주의사항

- 모든 사용자 인터페이스는 한글로 표시하세요
- 긴 텍스트 처리 시 스크롤 가능하도록 구현
- 모바일 환경에서도 잘 동작하도록 테스트
- 클립보드 복사 권한 확인

## 참고 문서
- @CLAUDE.md - UI 요구사항
- @prd.md - 5장 (웹 인터페이스 설계)
- @TODO.md - Phase 3 상세 작업
