import OpenAI from 'openai';
import type { LLMClient } from './client';

/**
 * OpenAI GPT API 클라이언트
 * GPT-4o 모델을 사용하여 텍스트 생성
 */
export class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private maxRetries = 3;
  private retryDelay = 2000; // 2초

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * 프롬프트를 실행하여 텍스트 생성
   * 실패 시 최대 3회까지 재시도
   */
  async generate(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[GPT] 프롬프트 실행 중... (시도 ${attempt}/${this.maxRetries})`);

        const completion = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const text = completion.choices[0]?.message?.content;

        if (!text || text.trim().length === 0) {
          throw new Error('OpenAI API가 빈 응답을 반환했습니다.');
        }

        console.log(`[GPT] 생성 완료 (${text.length}자)`);
        return text;

      } catch (error: any) {
        lastError = error;
        console.error(`[GPT] 에러 발생 (시도 ${attempt}/${this.maxRetries}):`, error.message);

        // API 레이트 리밋 에러인지 확인
        if (error.status === 429) {
          console.error('[GPT] Rate limit 에러 - 더 긴 대기 시간 적용');
        }

        // 마지막 시도가 아니면 재시도
        if (attempt < this.maxRetries) {
          const delay = error.status === 429
            ? this.retryDelay * attempt * 2  // Rate limit 시 더 긴 대기
            : this.retryDelay * attempt;

          console.log(`[GPT] ${delay}ms 후 재시도...`);
          await this.sleep(delay);
        }
      }
    }

    // 모든 재시도 실패
    throw new Error(
      `OpenAI API 호출이 ${this.maxRetries}회 실패했습니다: ${lastError?.message || '알 수 없는 오류'}`
    );
  }

  /**
   * 지연 함수 (재시도 대기용)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
