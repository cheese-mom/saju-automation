import { NextRequest, NextResponse } from 'next/server';
import { PromptManager } from '@/lib/prompt-manager';
import type { Product, UpdatePromptRequest } from '@/types';

/**
 * GET /api/prompts?product=jonghap|jinro
 * 프롬프트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const product = searchParams.get('product') as Product;

    // 유효성 검증
    if (!product || (product !== 'jonghap' && product !== 'jinro')) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'product 파라미터가 필요합니다 (jonghap 또는 jinro)',
        },
        { status: 400 }
      );
    }

    // 프롬프트 매니저 생성
    const promptManager = new PromptManager();

    // 프롬프트 로드
    const prompts = await promptManager.loadPrompts(product);

    return NextResponse.json({
      status: 'success',
      prompts,
    });

  } catch (error: any) {
    console.error('[API /prompts GET] 에러:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || '프롬프트 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prompts
 * 프롬프트 업데이트
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UpdatePromptRequest = await request.json();
    const { product, index, prompt } = body;

    // 유효성 검증
    if (!product || (product !== 'jonghap' && product !== 'jinro')) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'product는 jonghap 또는 jinro여야 합니다.',
        },
        { status: 400 }
      );
    }

    if (typeof index !== 'number' || index < 1 || index > 8) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'index는 1-8 사이의 숫자여야 합니다.',
        },
        { status: 400 }
      );
    }

    if (typeof prompt !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          error: 'prompt는 문자열이어야 합니다.',
        },
        { status: 400 }
      );
    }

    // 프롬프트 매니저 생성
    const promptManager = new PromptManager();

    // 프롬프트 업데이트
    await promptManager.updatePrompt(product, index, prompt);

    return NextResponse.json({
      status: 'success',
      message: `프롬프트 ${index}번이 업데이트되었습니다.`,
    });

  } catch (error: any) {
    console.error('[API /prompts PUT] 에러:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || '프롬프트 업데이트 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
