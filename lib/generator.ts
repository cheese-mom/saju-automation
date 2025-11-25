import type { LLMClient } from './llm/client';
import type { PromptManager } from './prompt-manager';
import type { Product } from '@/types';

/**
 * 사주 생성 결과 인터페이스
 */
interface GenerationResult {
  index: number;
  title: string;
  content: string;
}

/**
 * 사주 생성 엔진
 * 프롬프트를 순차적으로 실행하고 결과를 마크다운으로 병합합니다.
 */
export class SajuGenerator {
  constructor(
    private llmClient: LLMClient,
    private promptManager: PromptManager
  ) {}

  /**
   * 사주 생성 메인 로직
   * @param productType - 상품 타입 (jonghap/jinro)
   * @param customerName - 고객 이름
   * @param manseryeokText - 명식표 텍스트
   * @param additionalQuestion - 추가 질문 (선택)
   * @returns 생성된 사주 풀이 텍스트 (마크다운)
   */
  async generate(
    productType: Product,
    customerName: string,
    manseryeokText: string,
    additionalQuestion?: string
  ): Promise<string> {
    console.log(`\n=== 사주 생성 시작 ===`);
    console.log(`상품: ${productType === 'jonghap' ? '종합 사주' : '진로 사주'}`);
    console.log(`고객: ${customerName}`);
    console.log(`===================\n`);

    // 1. 구글 시트에서 프롬프트 로드
    const prompts = await this.promptManager.loadPrompts(productType);
    console.log(`총 ${prompts.length}개 프롬프트 로드됨\n`);

    // 2. 순차 실행
    const results: GenerationResult[] = [];

    for (const promptData of prompts) {
      const { index, title, prompt: template } = promptData;

      // 비어있으면 건너뛰기
      if (!template || template.trim() === '') {
        console.log(`⏭ 프롬프트 ${index}번 (${title}) 건너뛰기 (비어있음)\n`);
        continue;
      }

      // 변수 치환
      const prompt = this.substituteVariables(
        template,
        customerName,
        manseryeokText,
        additionalQuestion
      );

      // LLM 실행
      try {
        console.log(`⏳ 프롬프트 ${index}번 (${title}) 실행 중...`);
        const content = await this.llmClient.generate(prompt);

        results.push({
          index,
          title,
          content,
        });

        console.log(`✓ 프롬프트 ${index}번 완료\n`);

      } catch (error: any) {
        console.error(`❌ 프롬프트 ${index}번 실패:`, error.message);
        throw new Error(`프롬프트 ${index}번 (${title}) 실행 실패: ${error.message}`);
      }
    }

    // 3. 결과 병합
    console.log(`\n=== 결과 병합 중 ===`);
    const mergedResult = this.mergeResults(results, customerName);
    console.log(`✓ 사주 생성 완료 (총 ${mergedResult.length}자)\n`);

    return mergedResult;
  }

  /**
   * 변수 치환
   * {이름}, {명식표}, {추가질문} 변수를 실제 값으로 치환
   */
  private substituteVariables(
    template: string,
    name: string,
    manseryeok: string,
    question?: string
  ): string {
    return template
      .replace(/\{이름\}/g, name)
      .replace(/\{명식표\}/g, manseryeok)
      .replace(/\{추가질문\}/g, question || '없음');
  }

  /**
   * 결과를 마크다운 형식으로 병합
   */
  private mergeResults(results: GenerationResult[], customerName: string): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let output = `# 사주 풀이\n\n`;
    output += `**고객명**: ${customerName}\n`;
    output += `**생성일자**: ${dateStr}\n\n`;
    output += `---\n\n`;

    // 목차
    output += `## 목차\n\n`;
    for (const r of results) {
      output += `${r.index}. ${r.title}\n`;
    }
    output += `\n---\n\n`;

    // 본문
    for (const r of results) {
      output += `## ${r.index}. ${r.title}\n\n`;
      output += r.content;
      output += `\n\n---\n\n`;
    }

    return output;
  }
}
