# Hotfix: 배포 환경 JSON 파싱 에러 수정

**날짜**: 2025-11-26
**이슈**: "네트워크 오류: Unexpected token 'A', "An error o"... is not valid JSON"

## 문제 원인

Vercel 배포 환경에서 서버가 HTML 에러 페이지를 반환할 때, 프론트엔드가 무조건 `response.json()`을 호출하여 JSON 파싱 에러가 발생했습니다.

특히 Vercel 무료 플랜의 10초 타임아웃 제한으로 인해 사주 생성 API가 완료되지 못하고 504 Gateway Timeout 에러를 HTML 형식으로 반환했습니다.

## 적용된 수정사항

### 1. 강화된 에러 핸들링 (`app/page.tsx`)

**변경 전:**
```typescript
const data: GenerateResponse = await response.json();
```

**변경 후:**
```typescript
// Content-Type 확인
const contentType = response.headers.get('content-type');

if (!response.ok) {
  // HTTP 에러 응답 처리
  if (contentType && contentType.includes('application/json')) {
    const errorData = await response.json();
    setError(errorData.error || `서버 오류 (${response.status})`);
  } else {
    // HTML 에러 페이지인 경우
    const textError = await response.text();
    if (response.status === 504 || textError.includes('FUNCTION_INVOCATION_TIMEOUT')) {
      setError('타임아웃 발생: Vercel 무료 플랜의 10초 제한으로 인해 사주 생성이 완료되지 못했습니다. Vercel Pro 플랜 업그레이드를 고려해주세요.');
    } else {
      setError(`서버 오류 (${response.status}): ${textError.substring(0, 100)}`);
    }
  }
  return;
}

// 정상 응답인데 JSON이 아닌 경우
if (!contentType || !contentType.includes('application/json')) {
  setError('서버 응답 형식 오류: JSON이 아닌 응답을 받았습니다.');
  return;
}

const data: GenerateResponse = await response.json();
```

**개선 사항:**
- ✅ `response.ok` 체크 추가
- ✅ `content-type` 헤더 검증
- ✅ HTML 에러 페이지 처리
- ✅ 타임아웃 에러 감지 및 사용자 친화적 메시지
- ✅ JSON 파싱 에러 catch 추가

### 2. Vercel 타임아웃 경고 UI 추가

사용자에게 Vercel 무료 플랜의 제한사항을 미리 알려주는 경고 박스 추가:

```tsx
{!isGenerating && !result && (
  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <h4 className="text-sm font-semibold text-yellow-800 mb-2">
      ⚠️ 중요: Vercel 무료 플랜 제한사항
    </h4>
    <div className="text-xs text-yellow-700 space-y-1">
      <p>• Vercel 무료 플랜은 API 응답 시간이 <strong>10초로 제한</strong>됩니다.</p>
      <p>• 사주 생성은 LLM API 호출로 인해 <strong>1-5분 소요</strong>될 수 있습니다.</p>
      <p>• 타임아웃 발생 시 Vercel Pro 플랜 업그레이드가 필요합니다 (60초 제한).</p>
      <p className="mt-2 text-yellow-600">💡 로컬 환경(localhost:3000)에서는 제한 없이 테스트할 수 있습니다.</p>
    </div>
  </div>
)}
```

## 재배포 방법

### 옵션 1: Git Push (권장)

```bash
git add .
git commit -m "Hotfix: 배포 환경 JSON 파싱 에러 수정

- 강화된 에러 핸들링 추가 (response.ok, content-type 체크)
- HTML 에러 페이지 처리
- Vercel 타임아웃 에러 감지 및 사용자 친화적 메시지
- Vercel 무료 플랜 제한사항 경고 UI 추가"

git push
```

Vercel이 자동으로 재배포합니다 (약 2-3분 소요).

### 옵션 2: Vercel 대시보드에서 수동 재배포

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Deployments 탭
4. 최신 배포 > "Redeploy" 클릭

## 검증 방법

재배포 후 다음을 확인하세요:

1. **에러 메시지 개선 확인**:
   - 사주 생성 시도
   - 타임아웃 발생 시 명확한 메시지 표시

2. **경고 UI 확인**:
   - 메인 페이지에 노란색 경고 박스 표시
   - Vercel 제한사항 안내 확인

3. **로컬 환경 테스트**:
   ```bash
   npm run dev
   # localhost:3000에서 실제 사주 생성 테스트
   ```

## 근본적인 해결 방법

타임아웃 문제의 근본적인 해결을 위해서는:

### 옵션 1: Vercel Pro 플랜 업그레이드
- **비용**: $20/월
- **타임아웃**: 60초
- **장점**: 간단한 해결, 추가 개발 불필요
- **단점**: 60초도 부족할 수 있음 (8개 프롬프트 × 1분 = 8분)

### 옵션 2: Streaming 응답 구현 (Phase 6)
- **비용**: 무료
- **기술**: Server-Sent Events (SSE) 또는 WebSocket
- **장점**: 프롬프트별 실시간 진행 상황 표시
- **단점**: 추가 개발 필요

### 옵션 3: 클라이언트 폴링 방식
- 백그라운드 작업 큐 사용
- 클라이언트가 주기적으로 완료 상태 확인
- **장점**: 타임아웃 우회
- **단점**: 복잡한 아키텍처

### 옵션 4: 별도 백엔드 서버 (권장)
- AWS Lambda, Cloud Functions, 또는 장기 실행 서버
- **장점**: 타임아웃 제한 없음
- **단점**: 인프라 관리 필요

## 현재 권장 사항

**단기 해결책**:
1. ✅ 이번 Hotfix 적용 (에러 메시지 개선)
2. 로컬 환경(localhost:3000)에서 실제 사주 생성 테스트
3. 프롬프트 수를 줄여서 테스트 (예: 8개 → 2-3개)

**장기 해결책** (Phase 6):
- Streaming 응답 구현 고려
- 또는 Vercel Pro 플랜 업그레이드

## 영향 받는 파일

- ✅ `app/page.tsx` - 에러 핸들링 및 경고 UI 추가

## 관련 문서

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md) - 배포 검증 보고서
- [TODO.md](./TODO.md) - Phase 6 개선 사항

---

**수정 담당**: Claude Code
**수정 일시**: 2025-11-26
**배포 상태**: ⚠️ Git push 필요
