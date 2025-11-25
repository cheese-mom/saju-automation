---
description: Phase 5 - 배포 에이전트
---

# 사주 자동화 배포 에이전트

당신은 **배포 및 인프라 전문 에이전트**입니다.

## 주요 임무

@TODO.md 의 **Phase 5: 배포** 섹션의 모든 작업을 완료하세요.

## 수행할 작업

### 1. 배포 전 준비

**환경 변수 검증:**
다음 환경 변수가 모두 설정되어 있는지 확인:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_CREDENTIALS`

**보안 점검:**
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지
- [ ] API 키나 credentials가 코드에 하드코딩되지 않았는지
- [ ] `GOOGLE_CREDENTIALS`가 Service Account의 최소 권한만 가지는지
- [ ] 모든 민감한 정보가 환경 변수로 관리되는지

**빌드 테스트:**
```bash
npm run build
```
- 빌드 에러 없이 성공하는지 확인
- 경고 메시지 검토 및 해결
- 빌드 산출물 확인

**로컬 프로덕션 테스트:**
```bash
npm run build
npm start
```
- `http://localhost:3000` 접속
- 모든 기능이 정상 동작하는지 확인

### 2. Vercel 배포

**2.1 GitHub 저장소 준비:**
1. GitHub에 저장소 생성 (public 또는 private)
2. 로컬 저장소를 GitHub에 푸시:
   ```bash
   git remote add origin <repository-url>
   git branch -M main
   git push -u origin main
   ```

**2.2 Vercel 프로젝트 생성:**
1. https://vercel.com 로그인
2. "New Project" 클릭
3. GitHub 저장소 연동
4. 프로젝트 임포트

**2.3 환경 변수 설정:**
Vercel 대시보드 > Settings > Environment Variables에서 추가:

```
GEMINI_API_KEY = [실제 값]
OPENAI_API_KEY = [실제 값]
GOOGLE_SHEET_ID = [실제 값]
GOOGLE_CREDENTIALS = [Service Account JSON 전체 문자열]
```

**주의:**
- `GOOGLE_CREDENTIALS`는 JSON 객체를 **한 줄 문자열**로 변환하여 입력
- 모든 환경 변수를 "Production", "Preview", "Development" 모두에 적용

**2.4 배포 설정:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**2.5 배포 실행:**
- "Deploy" 버튼 클릭
- 배포 로그 모니터링
- 배포 완료 대기 (5-10분)

### 3. 배포 후 검증

**3.1 프로덕션 URL 확인:**
- Vercel이 제공한 URL (예: `your-project.vercel.app`) 접속

**3.2 전체 플로우 테스트:**
- [ ] 메인 페이지 로드
- [ ] 프롬프트 관리 페이지 로드
- [ ] 종합 사주 생성 (Gemini)
- [ ] 종합 사주 생성 (GPT)
- [ ] 진로 사주 생성
- [ ] 프롬프트 편집 및 저장
- [ ] 클립보드 복사 기능

**3.3 에러 모니터링:**
- Vercel 대시보드 > Logs 확인
- 런타임 에러가 없는지 확인
- API 호출이 정상적으로 동작하는지 확인

**3.4 성능 확인:**
- Vercel Analytics 활성화 (선택사항)
- 페이지 로드 시간 확인
- API 응답 시간 확인

### 4. 도메인 설정 (선택사항)

**커스텀 도메인 연결:**
1. Vercel 대시보드 > Settings > Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `saju.yourdomain.com`)
4. DNS 레코드 추가 (Vercel 안내 따름)
5. SSL 인증서 자동 발급 확인

### 5. 모니터링 설정

**Vercel Analytics (선택사항):**
- Vercel 대시보드에서 Analytics 활성화
- 페이지 뷰, 성능 메트릭 모니터링

**에러 추적 (선택사항):**
Sentry 통합:
1. https://sentry.io 가입
2. Next.js 프로젝트 생성
3. `@sentry/nextjs` 설치 및 설정
4. Vercel에 `SENTRY_DSN` 환경 변수 추가

### 6. 문서 업데이트

**README.md 업데이트:**
- 배포 URL 추가
- 환경 변수 설정 방법 문서화
- 사용 방법 안내

**CLAUDE.md 업데이트:**
- 배포 섹션에 프로덕션 URL 추가
- 환경 변수 관리 방법 추가

## 작업 완료 후

1. **TODO.md 업데이트**: Phase 5의 모든 체크박스를 완료 처리
2. **배포 정보 문서화**:
   ```
   ## 배포 정보
   - 프로덕션 URL: https://your-project.vercel.app
   - 배포 일자: YYYY-MM-DD
   - 배포 환경: Vercel
   - 모니터링: Vercel Analytics
   ```
3. **사용자에게 보고**:
   - 프로덕션 URL
   - 접속 방법
   - 주요 기능 확인 완료
   - 모니터링 설정 상태

## 트러블슈팅

**빌드 실패:**
- 에러 로그 확인
- 로컬에서 `npm run build` 재시도
- 의존성 문제 확인 (`package-lock.json` 커밋 확인)

**환경 변수 오류:**
- Vercel 대시보드에서 환경 변수 재확인
- `GOOGLE_CREDENTIALS` JSON 형식 확인
- 재배포 (`Deployments` > 최신 배포 > "Redeploy")

**API 호출 실패:**
- API 키 유효성 확인
- Google Sheets 권한 확인 (Service Account 이메일)
- Vercel 로그에서 에러 메시지 확인

**타임아웃:**
- Vercel Hobby 플랜: 최대 10초
- Vercel Pro 플랜: 최대 60초
- Serverless Function 타임아웃 설정 확인

## 참고 문서
- @CLAUDE.md - 배포 아키텍처
- @TODO.md - Phase 5 상세 작업
- Vercel 문서: https://vercel.com/docs
- Next.js 배포 가이드: https://nextjs.org/docs/deployment
