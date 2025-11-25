import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm/client';
import { PromptManager } from '@/lib/prompt-manager';
import { SajuGenerator } from '@/lib/generator';
import type { GenerateRequest, GenerateResponse } from '@/types';

/**
 * POST /api/generate
 * 사주 생성 API
 *
 * Request body:
 * {
 *   product: 'jonghap' | 'jinro',
 *   llm: 'gemini' | 'gpt',
 *   name: string,
 *   manseryeok: string,
 *   question?: string
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GenerateRequest = await request.json();
    const { product, llm, name, manseryeok, question } = body;

    // 유효성 검증
    if (!product || (product !== 'jonghap' && product !== 'jinro')) {
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: 'product는 jonghap 또는 jinro여야 합니다.',
          result: '',
        },
        { status: 400 }
      );
    }

    if (!llm || (llm !== 'gemini' && llm !== 'gpt')) {
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: 'llm은 gemini 또는 gpt여야 합니다.',
          result: '',
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: '고객 이름을 입력해주세요.',
          result: '',
        },
        { status: 400 }
      );
    }

    if (!manseryeok || typeof manseryeok !== 'string' || manseryeok.trim() === '') {
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: '명식표를 입력해주세요.',
          result: '',
        },
        { status: 400 }
      );
    }

    console.log(`\n[API /generate] 사주 생성 요청`);
    console.log(`- 상품: ${product}`);
    console.log(`- LLM: ${llm}`);
    console.log(`- 고객: ${name}`);

    // LLM 클라이언트 생성
    let llmClient;
    try {
      llmClient = await createLLMClient(llm);
    } catch (error: any) {
      console.error('[API /generate] LLM 클라이언트 생성 실패:', error.message);
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: `LLM 클라이언트 생성 실패: ${error.message}`,
          result: '',
        },
        { status: 500 }
      );
    }

    // 프롬프트 매니저 생성
    let promptManager;
    try {
      promptManager = new PromptManager();
    } catch (error: any) {
      console.error('[API /generate] 프롬프트 매니저 생성 실패:', error.message);
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: `프롬프트 매니저 생성 실패: ${error.message}`,
          result: '',
        },
        { status: 500 }
      );
    }

    // 사주 생성기 생성
    const generator = new SajuGenerator(llmClient, promptManager);

    // 사주 생성 실행
    let result;
    try {
      result = await generator.generate(
        product,
        name,
        manseryeok,
        question
      );
    } catch (error: any) {
      console.error('[API /generate] 사주 생성 실패:', error.message);
      return NextResponse.json<GenerateResponse>(
        {
          status: 'error',
          error: `사주 생성 실패: ${error.message}`,
          result: '',
        },
        { status: 500 }
      );
    }

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[API /generate] 사주 생성 완료 (소요 시간: ${elapsedTime}초)\n`);

    return NextResponse.json<GenerateResponse>({
      status: 'success',
      result,
    });

  } catch (error: any) {
    console.error('[API /generate] 예상치 못한 에러:', error);
    return NextResponse.json<GenerateResponse>(
      {
        status: 'error',
        error: error.message || '사주 생성 중 오류가 발생했습니다.',
        result: '',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate
 * 메서드가 지원되지 않음을 알림
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'error',
      error: 'POST 메서드만 지원됩니다.',
    },
    { status: 405 }
  );
}
