import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMClient } from './client';

/**
 * Gemini API 클라이언트
 * Google의 Gemini 3 Pro Preview 모델을 사용하여 텍스트 생성
 */
export class GeminiClient implements LLMClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private maxRetries = 3;
  private retryDelay = 2000; // 2초

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });
  }

  /**
   * 프롬프트를 실행하여 텍스트 생성
   * 실패 시 최대 3회까지 재시도
   */
  async generate(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[Gemini] 프롬프트 실행 중... (시도 ${attempt}/${this.maxRetries})`);

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
          throw new Error('Gemini API가 빈 응답을 반환했습니다.');
        }

        console.log(`[Gemini] 생성 완료 (${text.length}자)`);
        return text;

      } catch (error: any) {
        lastError = error;
        console.error(`[Gemini] 에러 발생 (시도 ${attempt}/${this.maxRetries}):`, error.message);

        // 마지막 시도가 아니면 재시도
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt; // 점진적으로 지연 시간 증가
          console.log(`[Gemini] ${delay}ms 후 재시도...`);
          await this.sleep(delay);
        }
      }
    }

    // 모든 재시도 실패
    throw new Error(
      `Gemini API 호출이 ${this.maxRetries}회 실패했습니다: ${lastError?.message || '알 수 없는 오류'}`
    );
  }

  /**
   * 지연 함수 (재시도 대기용)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
