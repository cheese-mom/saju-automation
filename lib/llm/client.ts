import type { LLMProvider } from '@/types';

/**
 * LLM 클라이언트 인터페이스
 * Gemini와 GPT 클라이언트가 이 인터페이스를 구현합니다.
 */
export interface LLMClient {
  /**
   * 프롬프트를 실행하여 텍스트 생성
   * @param prompt - 실행할 프롬프트 텍스트
   * @returns 생성된 텍스트
   * @throws LLM API 호출 실패 시 에러
   */
  generate(prompt: string): Promise<string>;
}

/**
 * LLM 클라이언트 팩토리 함수
 * @param provider - 'gemini' 또는 'gpt'
 * @returns 해당 provider의 LLMClient 인스턴스
 * @throws API 키가 설정되지 않은 경우 에러
 */
export async function createLLMClient(provider: LLMProvider): Promise<LLMClient> {
  if (provider === 'gemini') {
    const { GeminiClient } = await import('./gemini');
    return new GeminiClient();
  } else if (provider === 'gpt') {
    const { OpenAIClient } = await import('./openai');
    return new OpenAIClient();
  } else {
    throw new Error(`지원하지 않는 LLM provider: ${provider}`);
  }
}
