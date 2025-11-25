# 배포 가이드

사주 자동화 시스템을 Vercel에 배포하는 방법을 안내합니다.

## 배포 전 체크리스트

- [x] 프로덕션 빌드 테스트 완료 (`npm run build` 성공)
- [x] 환경 변수 파일 `.gitignore`에 포함 확인
- [x] API 키 하드코딩 제거 확인
- [ ] Google Sheets Service Account 권한 확인
- [ ] GitHub 저장소 준비

## 1. GitHub 저장소 준비

### 1.1 저장소 생성

GitHub에서 새 저장소를 생성합니다:
- 저장소명: `saju-automation` (원하는 이름 사용 가능)
- Public 또는 Private 선택
- README, .gitignore, License는 건너뛰기 (이미 로컬에 존재)

### 1.2 Git 초기화 및 푸시

```bash
# Git 저장소 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 초기 커밋
git commit -m "Initial commit: 사주 자동화 시스템 Phase 1-4 완료"

# GitHub 저장소 연결 (URL은 실제 저장소 URL로 변경)
git remote add origin https://github.com/your-username/saju-automation.git

# 메인 브랜치로 변경
git branch -M main

# 푸시
git push -u origin main
```

## 2. Vercel 배포

### 2.1 Vercel 계정 준비

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Continue with GitHub" 클릭

### 2.2 새 프로젝트 생성

1. Vercel 대시보드에서 "Add New..." > "Project" 클릭
2. GitHub 저장소 연동:
   - "Import Git Repository" 섹션에서 저장소 검색
   - `saju-automation` 저장소 선택
   - "Import" 클릭

### 2.3 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)

**Root Directory**: `./` (기본값)

**Build and Output Settings**:
- Build Command: `npm run build` (기본값)
- Output Directory: `.next` (기본값)
- Install Command: `npm install` (기본값)

### 2.4 환경 변수 설정

**중요**: "Environment Variables" 섹션에서 다음 변수들을 추가합니다.

#### 환경 변수 목록

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini API 키 |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API 키 |
| `GOOGLE_SHEET_ID` | `1ABC...` | 구글 스프레드시트 ID |
| `GOOGLE_CREDENTIALS` | `{"type":"service_account",...}` | Service Account JSON (전체 문자열) |

#### GOOGLE_CREDENTIALS 입력 방법

`GOOGLE_CREDENTIALS`는 Service Account JSON 파일의 **전체 내용을 한 줄 문자열**로 입력합니다.

**예시:**
```json
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**환경 적용 범위**: 모든 환경에 적용
- Production: ✓
- Preview: ✓
- Development: ✓

### 2.5 배포 실행

1. "Deploy" 버튼 클릭
2. 배포 로그 모니터링 (5-10분 소요)
3. 배포 완료 대기

**배포 성공 시:**
```
✓ Build completed successfully
✓ Deployment ready
```

배포 URL: `https://saju-automation-251126.vercel.app`

## 3. 배포 후 검증

### 3.1 기본 접속 확인

1. Vercel이 제공한 URL 접속
2. 메인 페이지 로드 확인
3. 프롬프트 관리 페이지 로드 확인

### 3.2 기능 테스트

아래 기능들을 순서대로 테스트합니다:

**프롬프트 관리:**
- [ ] 프롬프트 목록 조회 (종합 사주)
- [ ] 프롬프트 목록 조회 (진로 사주)
- [ ] 프롬프트 편집 및 저장

**사주 생성:**
- [ ] 종합 사주 생성 (Gemini)
- [ ] 종합 사주 생성 (GPT)
- [ ] 진로 사주 생성
- [ ] 클립보드 복사 기능

**에러 처리:**
- [ ] 빈 입력 필드 검증
- [ ] API 에러 메시지 표시

### 3.3 로그 확인

Vercel 대시보드 > Deployments > 최신 배포 > "Logs" 탭에서:
- 런타임 에러 확인
- API 호출 성공 여부 확인
- 콘솔 로그 확인

## 4. 도메인 설정 (선택사항)

### 커스텀 도메인 연결

1. Vercel 대시보드 > Settings > Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `saju.yourdomain.com`)
4. DNS 레코드 추가:
   - Type: `CNAME`
   - Name: `saju` (또는 원하는 서브도메인)
   - Value: `cname.vercel-dns.com`
5. SSL 인증서 자동 발급 대기 (최대 24시간)

## 5. 모니터링 설정

### 5.1 Vercel Analytics (선택사항)

1. Vercel 대시보드 > Analytics 탭
2. "Enable Analytics" 클릭
3. 페이지 뷰, 성능 메트릭 모니터링 가능

### 5.2 에러 추적 - Sentry (선택사항)

**Sentry 통합 방법:**

1. https://sentry.io 가입
2. Next.js 프로젝트 생성
3. 패키지 설치:
   ```bash
   npm install @sentry/nextjs
   ```
4. Sentry 설정 파일 생성
5. Vercel 환경 변수에 `SENTRY_DSN` 추가
6. 재배포

## 6. 트러블슈팅

### 빌드 실패

**증상**: 배포 중 "Build failed" 에러

**해결 방법:**
1. 로컬에서 `npm run build` 재시도
2. 에러 로그 확인
3. `package-lock.json` 커밋 확인
4. Node.js 버전 확인 (Vercel은 Node 20 사용)

### 환경 변수 오류

**증상**: "GEMINI_API_KEY is not defined" 에러

**해결 방법:**
1. Vercel 대시보드 > Settings > Environment Variables 확인
2. 모든 변수가 "Production", "Preview", "Development"에 적용되었는지 확인
3. 변수명 오타 확인 (대소문자 구분)
4. 재배포: Deployments > 최신 배포 > "Redeploy"

### Google Sheets 권한 오류

**증상**: "Error: 403 Forbidden" 또는 "The caller does not have permission"

**해결 방법:**
1. Google Sheets에 Service Account 이메일 공유 확인:
   - 스프레드시트 우측 상단 "공유" 클릭
   - Service Account 이메일 추가 (`.iam.gserviceaccount.com`로 끝남)
   - 권한: "편집자"
2. `GOOGLE_CREDENTIALS` 환경 변수 JSON 형식 확인
3. Google Cloud Console에서 Google Sheets API 활성화 확인

### API 타임아웃

**증상**: "Function execution timed out"

**해결 방법:**
- Vercel Hobby 플랜: 최대 10초 제한
- Vercel Pro 플랜: 최대 60초 제한
- 사주 생성은 LLM API 호출로 인해 1-5분 소요 가능
- **해결책**: Vercel Pro 플랜 업그레이드 또는 Streaming 응답 구현

### 404 Not Found

**증상**: 특정 페이지 접속 시 404 에러

**해결 방법:**
1. 페이지 파일 경로 확인 (`app/page.tsx`, `app/prompts/page.tsx`)
2. Vercel 빌드 로그에서 "Route (app)" 섹션 확인
3. 재배포

## 7. 유지보수

### 정기 업데이트

```bash
# 의존성 업데이트
npm update

# 보안 취약점 확인
npm audit

# 보안 패치 적용
npm audit fix
```

### 재배포

코드 변경 후:
```bash
git add .
git commit -m "Update: [변경 사항 설명]"
git push
```

Vercel이 자동으로 재배포합니다.

### 롤백

문제 발생 시:
1. Vercel 대시보드 > Deployments
2. 이전 배포 선택
3. "..." 메뉴 > "Promote to Production"

## 8. 추가 참고 자료

- Vercel 문서: https://vercel.com/docs
- Next.js 배포 가이드: https://nextjs.org/docs/deployment
- Google Sheets API: https://developers.google.com/sheets/api
- Gemini API: https://ai.google.dev/gemini-api/docs
- OpenAI API: https://platform.openai.com/docs

---

**배포 완료 후 반드시 확인:**
- ✓ 프로덕션 URL 접속 가능
- ✓ 모든 페이지 로드 정상
- ✓ 사주 생성 기능 작동
- ✓ 프롬프트 편집 기능 작동
- ✓ 에러 없음

배포 성공을 축하합니다! 🎉
