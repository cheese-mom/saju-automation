# PRD: 사주 자동화 프로그램

## 1. 프로젝트 개요
### 목적
사주 상담 프로세스를 자동화하여 텍스트 형식의 만세력 명식표와 준비된 프롬프트를 활용해 종합 사주와 진로 사주 두 가지 상품을 구글 독스용 텍스트로 자동 생성하는 시스템 구축

### 핵심 가치
사주 풀이 작성 시간 대폭 단축 (수작업 대비 80% 단축)
일관된 품질의 사주 해석 제공
수작업 오류 최소화
상품별 맞춤형 프롬프트 관리 (DB 없이 가볍게 운영, 구글 스프레드시트로 관리)
LLM 선택 가능 (Gemini / GPT)

## 2. 상품 구성
### 상품 A: 종합 사주
목차 (8개 항목)
1. 사주 전체 해석
2. 올해부터 5년 간의 운세
3. 내가 가진 '살'
4. 재물운과 직업운
5. 애정운과 이혼수
6. 내 인생의 귀인 & 날 망치는 사람
7. 건강운
8. 따로 질문 주신 부분 답변

### 상품 B: 진로 사주
목차 (8개 항목)
1. 사주 전체 해석과 직업적 기질 분석
2. 커리어 운세 (2026-2030년)
3. 내가 가장 발휘할 수 있는 "능력"의 핵심
4. 재물운과 직업의 연관성 분석
5. 직장 내 인간관계와 파트너십
6. 자립할 수 있는 시기 & 이직 타이밍 분석
7. 직업 건강 및 스트레스 관리
8. 따로 질문 주신 부분 답변

## 3. 개발 범위
### 핵심 기능
1. 웹 인터페이스
메인 페이지: 사주 생성
- 상품 선택 (종합/진로)
- LLM 선택 (Gemini/GPT)
- 고객 정보 입력
- 명식표 텍스트 입력
- 추가 질문 입력
- 순자 실행 (빈 프롬프트는 건너뛰기)
- 결과 병합 및 출력
프롬프트 관리 페이지 (구글 시트 연동)
- 구글 스프레드시트에서 프롬프트 읽기/쓰기
- 웹에서 프롬프트 편집 UI
- 실시간 동기화
- 상품별 프롬프트 세트 관리

2. 백엔드 API
- LLM API 통합 (Gemini Pro / GPT-4o)
- 프롬프트 관리 시스템
- 순차 실행 로직

3. 프롬프트 실행
- 상품별 1~8번 프롬프트 순차 실행
- 각 프롬프트 결과 수집

4. 결과 출력
- 구글 독스 삽입 가능한 형태
- 웹 화면에 표시
- 클립보드 복사 기능

## 4. 프롬프트 관리 시스템
### 4.1 구글 스프레드시트 구조
시트 1: 종합 사주 프롬프트
A (번호) |  B (목차명)  | C (프롬프트)
    1   | 사주 전체 해석 | 당신은 30년 경력의...{이름}{명식표}...

규칙:
- C열이 비어있으면 → 해당 목차 건너뛰기
- C열에 내용이 있으면 → 실행

시트 2: 진로 사주 프롬프트
(동일한 구조)

### 4.2 구글 시트 API 연동
```
import gspread
from oauth2client.service_account import ServiceAccountCredentials

class PromptManager:
    def __init__(self, credentials_path: str, sheet_id: str):
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            credentials_path, scope
        )
        self.client = gspread.authorize(creds)
        self.sheet = self.client.open_by_key(sheet_id)
    
    def load_prompts(self, product_type: str) -> list:
        """
        구글 시트에서 프롬프트 로드
        
        Returns:
            [
                {'index': 1, 'title': '...', 'prompt': '...'},
                {'index': 2, 'title': '...', 'prompt': '...'},
                ...
            ]
        """
        worksheet_name = f"{product_type}_prompts"
        worksheet = self.sheet.worksheet(worksheet_name)
        
        # 모든 행 가져오기 (헤더 제외)
        rows = worksheet.get_all_values()[1:]
        
        prompts = []
        for row in rows:
            if len(row) >= 3:
                prompts.append({
                    'index': int(row[0]),
                    'title': row[1],
                    'prompt': row[2]
                })
        
        return prompts
    
    def update_prompt(
        self, 
        product_type: str, 
        index: int, 
        prompt_text: str
    ):
        """프롬프트 업데이트"""
        worksheet_name = f"{product_type}_prompts"
        worksheet = self.sheet.worksheet(worksheet_name)
        
        # index+1 (헤더 때문에)
        cell = f"C{index + 1}"
        worksheet.update(cell, prompt_text)
```

### 4.3 프롬프트 실행 로직
```
class SajuGenerator:
    def __init__(self, llm_client: LLMClient, prompt_manager: PromptManager):
        self.llm = llm_client
        self.prompt_manager = prompt_manager
    
    def generate(
        self, 
        product_type: str,
        customer_name: str,
        manseryeok_text: str,
        additional_question: str = ""
    ) -> str:
        # 1. 구글 시트에서 프롬프트 로드
        prompts = self.prompt_manager.load_prompts(product_type)
        
        # 2. 순차 실행
        results = []
        
        for prompt_data in prompts:
            index = prompt_data['index']
            title = prompt_data['title']
            template = prompt_data['prompt']
            
            # 비어있으면 건너뛰기
            if not template or not template.strip():
                print(f"⏭ 프롬프트 {index}번 ({title}) 건너뛰기 (비어있음)")
                continue
            
            # 변수 치환
            prompt = template.format(
                이름=customer_name,
                명식표=manseryeok_text,
                추가질문=additional_question or "없음"
            )
            
            # LLM 실행
            print(f"⏳ 프롬프트 {index}번 ({title}) 실행 중...")
            result = self.llm.generate(prompt)
            
            results.append({
                'index': index,
                'title': title,
                'content': result
            })
            print(f"✓ 프롬프트 {index}번 완료")
        
        # 3. 결과 병합
        return self._merge_results(results, customer_name)
    
    def _merge_results(self, results: list, name: str) -> str:
        """마크다운 형식으로 병합"""
        from datetime import datetime
        
        output = f"""# 사주 풀이

**고객명**: {name}
**생성일자**: {datetime.now().strftime('%Y-%m-%d')}

---

목차
    # 목차 추가
    for r in results:
        output += f"{r['index']}. {r['title']}\n"
    
    output += "\n---\n\n"
    
    # 본문
    for r in results:
        output += f"## {r['index']}. {r['title']}\n\n"
        output += r['content']
        output += "\n\n---\n\n"
    
    output += "*본 사주 풀이는 AI를 활용하여 생성되었습니다.*\n"
    
    return output
```

## 5. 웹 인터페이스 설계

### 5.1 페이지 구성

#### 페이지 1: 사주 생성 (메인)
```
┌─────────────────────────────────────────────┐
│  [사주 생성]  [프롬프트 관리]                    │
├─────────────────────────────────────────────┤
│                                             │
│  사주 자동 생성                                │
│                                             │
│  1. 상품 선택                                 │
│  ○ 종합 사주  ○ 진로 사주                       │
│                                             │
│  2. LLM 선택                                 │
│  ○ Gemini  ○ GPT                            │
│                                             │
│  3. 고객 정보                                 │
│  이름: [________________]                    │
│                                             │
│  4. 명식표 입력                                │
│  [텍스트 영역]                                 │
│                                             │
│  5. 추가 질문 (선택)                           │
│  [________________]                         │
│                                             │
│  [생성 시작]                                  │
│                                             │
└─────────────────────────────────────────────┘
```

#### 페이지 2: 프롬프트 관리
```
┌─────────────────────────────────────────────┐
│  [사주 생성]  [프롬프트 관리]                     │
├─────────────────────────────────────────────┤
│                                             │
│  프롬프트 관리                                 │
│                                             │
│  상품: [종합 사주 ▼]                           │
│                                            │
│  ┌─────────────────────────────────────┐  │
│  │ 목차 1: 사주 전체 해석                  │  │
│  │ ┌───────────────────────────────┐  │  │
│  │ │ 당신은 30년 경력의 사주...         │  │  │
│  │ │ {이름}                         │  │  │
│  │ │ {명식표}                        │  │  │
│  │ │ ...                           │  │  │
│  │ └───────────────────────────────┘  │  │
│  │ [저장] [취소]                         │  │
│  ├─────────────────────────────────────┤  │
│  │ 목차 2: 올해부터 5년간의 운세             │  │
│  │ [편집]                               │  │
│  ├─────────────────────────────────────┤  │
│  │ 목차 3: 내가 가진 살                    │  │
│  │ [편집]                               │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  [구글 시트에서 새로고침]                       │
│                                            │
└─────────────────────────────────────────────┘
```

### 5.2 React 컴포넌트
```
// 프롬프트 관리 페이지
interface Prompt {
  index: number;
  title: string;
  prompt: string;
}

function PromptManagementPage() {
  const [product, setProduct] = useState<'jonghap' | 'jinro'>('jonghap');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // 구글 시트에서 프롬프트 로드
  const loadPrompts = async () => {
    const response = await fetch(`/api/prompts?product=${product}`);
    const data = await response.json();
    setPrompts(data.prompts);
  };
  
  // 프롬프트 저장
  const savePrompt = async (index: number, text: string) => {
    await fetch('/api/prompts', {
      method: 'PUT',
      body: JSON.stringify({
        product,
        index,
        prompt: text
      })
    });
    
    loadPrompts();
  };
  
  return (
    <div>
      <ProductSelector value={product} onChange={setProduct} />
      
      <PromptList 
        prompts={prompts}
        onEdit={setEditingIndex}
      />
      
      {editingIndex && (
        <PromptEditor
          prompt={prompts.find(p => p.index === editingIndex)}
          onSave={savePrompt}
          onCancel={() => setEditingIndex(null)}
        />
      )}
      
      <button onClick={loadPrompts}>
        구글 시트에서 새로고침
      </button>
    </div>
  );
}

// 프롬프트 에디터
function PromptEditor({ prompt, onSave, onCancel }) {
  const [text, setText] = useState(prompt.prompt);
  
  return (
    <div className="modal">
      <h3>목차 {prompt.index}: {prompt.title}</h3>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
        className="w-full font-mono"
        placeholder="프롬프트를 입력하세요. 비워두면 이 목차는 건너뜁니다."
      />
      
      <div className="help-text">
        사용 가능한 변수: {'{이름}'}, {'{명식표}'}, {'{추가질문}'}
      </div>
      
      <button onClick={() => onSave(prompt.index, text)}>저장</button>
      <button onClick={onCancel}>취소</button>
    </div>
  );
}
```

## 6. 백엔드 API
### 6.1 프롬프트 관리 API
```
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# 글로벌 PromptManager
prompt_manager = PromptManager(
    credentials_path="config/google_credentials.json",
    sheet_id=os.getenv("GOOGLE_SHEET_ID")
)

class PromptUpdate(BaseModel):
    product: str
    index: int
    prompt: str

# 프롬프트 목록 조회
@app.get("/api/prompts")
async def get_prompts(product: str):
    """
    구글 시트에서 프롬프트 목록 가져오기
    """
    try:
        prompts = prompt_manager.load_prompts(product)
        return {"prompts": prompts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 프롬프트 업데이트
@app.put("/api/prompts")
async def update_prompt(data: PromptUpdate):
    """
    특정 프롬프트 업데이트
    """
    try:
        prompt_manager.update_prompt(
            data.product,
            data.index,
            data.prompt
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 6.2 사주 생성 API
```
class GenerateRequest(BaseModel):
    product: str        # "jonghap" or "jinro"
    llm: str           # "gemini" or "gpt"
    name: str
    manseryeok: str
    question: str = ""

class GenerateResponse(BaseModel):
    result: str
    status: str

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_saju(request: GenerateRequest):
    try:
        # LLM 클라이언트 생성
        llm_client = LLMFactory.create(
            provider=request.llm,
            api_key=get_api_key(request.llm)
        )
        
        # 생성기 실행
        generator = SajuGenerator(llm_client, prompt_manager)
        result = generator.generate(
            product_type=request.product,
            customer_name=request.name,
            manseryeok_text=request.manseryeok,
            additional_question=request.question
        )
        
        return GenerateResponse(
            result=result,
            status="success"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 7. 실행 흐름

### 7.1 전체 프로세스
```
[웹 UI - 사주 생성]
├─ 상품 선택
├─ LLM 선택
├─ 고객 정보 입력
├─ 명식표 텍스트 입력
├─ 추가 질문 입력
└─ 생성 시작
    ↓
[백엔드 API]
    ↓
[구글 시트에서 프롬프트 로드]
├─ 종합 사주 또는 진로 사주 시트 선택
└─ 모든 프롬프트 정보 가져오기
    ↓
[순차 실행 (건너뛰기 로직)]
├─ 프롬프트 1: 내용 있음 → 실행
├─ 프롬프트 2: 내용 있음 → 실행
├─ 프롬프트 3: 내용 비어있음 → **건너뛰기**
├─ 프롬프트 4: 내용 있음 → 실행
└─ ...
    ↓
[실행된 프롬프트 결과만 병합]
    ↓
[출력]
```

### 7.2 건너뛰기 예시
```
# 입력 프롬프트 상태
prompts = [
    {'index': 1, 'title': '사주 전체 해석', 'prompt': '당신은...'},
    {'index': 2, 'title': '올해부터 5년간의 운세', 'prompt': '아래 고객의...'},
    {'index': 3, 'title': '내가 가진 살', 'prompt': ''},  # 건너뛰기
    {'index': 4, 'title': '재물운과 직업운', 'prompt': '재물운을...'},
    {'index': 5, 'title': '애정운과 이혼수', 'prompt': '애정운을...'},
]

# 실행 로그
"""
⏳ 프롬프트 1번 (사주 전체 해석) 실행 중...
✓ 프롬프트 1번 완료

⏳ 프롬프트 2번 (올해부터 5년간의 운세) 실행 중...
✓ 프롬프트 2번 완료

⏭ 프롬프트 3번 (내가 가진 살) 건너뛰기 (비어있음)

⏳ 프롬프트 4번 (재물운과 직업운) 실행 중...
✓ 프롬프트 4번 완료

⏳ 프롬프트 5번 (애정운과 이혼수) 실행 중...
✓ 프롬프트 5번 완료
"""

# 최종 결과물
"""
# 사주 풀이

## 목차
1. 사주 전체 해석
2. 올해부터 5년간의 운세
4. 재물운과 직업운
5. 애정운과 이혼수

---

## 1. 사주 전체 해석
(내용)

## 2. 올해부터 5년간의 운세
(내용)

## 4. 재물운과 직업운
(내용)

## 5. 애정운과 이혼수
(내용)
"""
```

## 8. 구글 시트 설정

### 8.1 시트 생성

1. 새 구글 스프레드시트 생성
2. 두 개의 시트 추가:
   - `jonghap_prompts` (종합 사주)
   - `jinro_prompts` (진로 사주)

### 8.2 시트 구조 (예시)

**jonghap_prompts 시트**

| A | B | C |
|---|---|---|
| 번호 | 목차명 | 프롬프트 |
| 1 | 사주 전체 해석 | 당신은 30년 경력의...<br>{이름}<br>{명식표} |
| 2 | 올해부터 5년간의 운세 | 아래 고객의 만세력...<br>{명식표} |
| 3 | 내가 가진 살 | 살(煞)을 분석...<br>{명식표} |
| 4 | 재물운과 직업운 | 재물운을 분석...<br>{명식표} |
| 5 | 애정운과 이혼수 | 애정운을...<br>{명식표} |
| 6 | 내 인생의 귀인 & 날 망치는 사람 | 귀인을...<br>{명식표} |
| 7 | 건강운 | 건강을...<br>{명식표} |
| 8 | 따로 질문 주신 부분 답변 | {추가질문}에 대해...<br>{명식표} |

**팁**: C열을 비워두면 해당 목차는 건너뜁니다.

## 9. 프로젝트 구조
```
saju-automation/
│
├── frontend/                    # Next.js
│   ├── app/
│   │   ├── page.tsx            # 사주 생성 페이지
│   │   ├── prompts/
│   │   │   └── page.tsx        # 프롬프트 관리 페이지
│   │   └── api/
│   │
│   └── components/
│       ├── SajuGenerator.tsx
│       ├── PromptManager.tsx
│       └── PromptEditor.tsx
│
├── backend/                     # FastAPI
│   ├── main.py
│   ├── generator.py
│   ├── llm_client.py
│   └── prompt_manager.py       # 구글 시트 연동
│
├── config/
│   └── google_credentials.json # Service Account 키
│
├── .env
├── requirements.txt
└── README.md
```

## 10. 개발 일정
Week 1: 프롬프트 관리 시스템
[] 구글 시트 API 연동
[] PromptManager 구현
[] 프롬프트 CRUD API

Week 2: 웹 UI
[] 프롬프트 관리 페이지
[] 프롬프트 편집기
[] 사주 생성 페이지

Week 3: 통합 및 테스트
[] 건너뛰기 로직 테스트
[] 에러 처리
[] 통합 테스트

Week 4: 배포
[] Vercel 배포
[] 문서화

## 11. 환경 설정
### .env
```
# LLM API Keys
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Google Sheets
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_CREDENTIALS_PATH=./config/google_credentials.json
```

### requirements.txt
```
fastapi==0.109.0
uvicorn==0.27.0
google-generativeai==0.3.2
openai==1.12.0
python-dotenv==1.0.0
gspread==5.12.0
oauth2client==4.1.3
tenacity==8.2.3
```

## 12. 주요 고려사항
### 12.1 구글 시트 동기화
캐싱 전략:
```
from functools import lru_cache
import time

@lru_cache(maxsize=2)
def get_prompts_cached(product_type: str, timestamp: int):
    return prompt_manager.load_prompts(product_type)

# 5분마다 새로운 timestamp
def get_prompts(product_type: str):
    timestamp = int(time.time() / 300)  # 5분 단위
    return get_prompts_cached(product_type, timestamp)

### 12.2 건너뛰기 로직 장점

**유연성:**
- 일부 목차만 생성 가능
- 테스트 시 특정 목차만 실행
- 비용 절감

**사용 예:**
프롬프트 3, 6을 비워두기
→ 1, 2, 4, 5, 7, 8만 실행
→ 3, 6은 출력물에 나타나지 않음
```

## 13. 체크리스트
### 출시 전
[] 구글 시트 템플릿 준비 (3열 구조)
[] Service Account 설정
[] 프롬프트 관리 UI 테스트
[] 건너뛰기 로직 테스트
[] API 연동 테스트
[] 사용자 매뉴얼