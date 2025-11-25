/**
 * 상품 타입 (종합 사주 / 진로 사주)
 */
export type Product = 'jonghap' | 'jinro';

/**
 * LLM 제공자 타입 (Gemini / GPT)
 */
export type LLMProvider = 'gemini' | 'gpt';

/**
 * 프롬프트 인터페이스
 */
export interface Prompt {
  /** 프롬프트 번호 (1-8) */
  index: number;
  /** 목차명 */
  title: string;
  /** 프롬프트 내용 (빈 문자열이면 건너뛰기) */
  prompt: string;
}

/**
 * 사주 생성 요청 인터페이스
 */
export interface GenerateRequest {
  /** 상품 선택 (종합/진로) */
  product: Product;
  /** LLM 선택 (Gemini/GPT) */
  llm: LLMProvider;
  /** 고객 이름 */
  name: string;
  /** 만세력 명식표 텍스트 */
  manseryeok: string;
  /** 추가 질문 (선택사항) */
  question?: string;
}

/**
 * 사주 생성 응답 인터페이스
 */
export interface GenerateResponse {
  /** 생성된 사주 풀이 텍스트 (마크다운) */
  result: string;
  /** 상태 ('success' | 'error') */
  status: string;
  /** 에러 메시지 (상태가 error인 경우) */
  error?: string;
}

/**
 * 프롬프트 업데이트 요청 인터페이스
 */
export interface UpdatePromptRequest {
  /** 상품 선택 */
  product: Product;
  /** 프롬프트 번호 */
  index: number;
  /** 업데이트할 프롬프트 내용 */
  prompt: string;
}

/**
 * API 응답 기본 인터페이스
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}
