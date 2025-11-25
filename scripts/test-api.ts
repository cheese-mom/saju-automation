#!/usr/bin/env tsx
/**
 * Phase 2 백엔드 API 테스트 스크립트
 */

const BASE_URL = 'http://localhost:3000';

// 색상 코드
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

async function testPromptsAPI() {
  console.log(`\n${colors.bold}=== 프롬프트 조회 API 테스트 ===${colors.reset}\n`);

  try {
    console.log('종합 사주 프롬프트 조회 중...');
    const response = await fetch(`${BASE_URL}/api/prompts?product=jonghap`);
    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.prompts)) {
      console.log(`${colors.green}✓ 성공${colors.reset}: ${data.prompts.length}개 프롬프트 로드됨`);

      // 첫 번째 프롬프트 정보 출력
      if (data.prompts.length > 0) {
        const first = data.prompts[0];
        console.log(`  - 첫 번째 프롬프트: ${first.index}. ${first.title}`);
        console.log(`  - 프롬프트 길이: ${first.prompt.length}자`);
      }
    } else {
      console.log(`${colors.red}✗ 실패${colors.reset}: 예상치 못한 응답 형식`);
      console.log(data);
    }
  } catch (error: any) {
    console.log(`${colors.red}✗ 에러${colors.reset}: ${error.message}`);
  }
}

async function testGenerateAPIValidation() {
  console.log(`\n${colors.bold}=== 사주 생성 API 유효성 검증 테스트 ===${colors.reset}\n`);

  try {
    console.log('잘못된 요청 테스트...');
    const response = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: 'invalid',
        llm: 'gemini',
        name: '테스트',
        manseryeok: '테스트 명식표',
      }),
    });

    const data = await response.json();

    if (data.status === 'error' && response.status === 400) {
      console.log(`${colors.green}✓ 성공${colors.reset}: 유효성 검증이 올바르게 작동함`);
      console.log(`  - 에러 메시지: ${data.error}`);
    } else {
      console.log(`${colors.red}✗ 실패${colors.reset}: 유효성 검증이 작동하지 않음`);
    }
  } catch (error: any) {
    console.log(`${colors.red}✗ 에러${colors.reset}: ${error.message}`);
  }
}

async function main() {
  console.log(`${colors.bold}Phase 2 백엔드 API 테스트${colors.reset}`);
  console.log(`Base URL: ${BASE_URL}`);

  await testPromptsAPI();
  await testGenerateAPIValidation();

  console.log(`\n${colors.bold}=== 테스트 완료 ===${colors.reset}\n`);
  console.log(`${colors.yellow}참고${colors.reset}: 실제 사주 생성 테스트는 프론트엔드에서 진행하세요.`);
  console.log(`      (LLM API 호출 시간이 오래 걸리고 비용이 발생할 수 있습니다)\n`);
}

main().catch(console.error);
