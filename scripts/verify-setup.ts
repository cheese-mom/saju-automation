#!/usr/bin/env tsx
/**
 * Phase 1 설정 검증 스크립트
 *
 * 이 스크립트는 다음을 확인합니다:
 * 1. 환경 변수가 모두 설정되어 있는지
 * 2. GOOGLE_CREDENTIALS가 유효한 JSON인지
 * 3. Google Sheets API 연결이 가능한지
 * 4. jonghap_prompts와 jinro_prompts 시트가 존재하는지
 */

import { config } from 'dotenv';
import { google } from 'googleapis';
import path from 'path';

// .env.local 파일 로드
config({ path: path.join(process.cwd(), '.env.local') });

interface CheckResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

const results: CheckResult[] = [];

// 색상 코드
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(result: CheckResult) {
  const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
  const color = result.status === 'success' ? colors.green : result.status === 'warning' ? colors.yellow : colors.red;
  console.log(`${icon} ${color}${result.name}${colors.reset}: ${result.message}`);
  results.push(result);
}

async function main() {
  console.log(`${colors.bold}=== Phase 1 설정 검증 ===${colors.reset}\n`);

  // 1. 환경 변수 확인
  console.log(`${colors.bold}1. 환경 변수 확인${colors.reset}`);

  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'OPENAI_API_KEY',
    'GOOGLE_SHEET_ID',
    'GOOGLE_CREDENTIALS'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log({
        name: envVar,
        status: 'success',
        message: '설정됨'
      });
    } else {
      log({
        name: envVar,
        status: 'error',
        message: '설정되지 않음'
      });
    }
  }

  console.log('');

  // 2. GOOGLE_CREDENTIALS 유효성 검사
  console.log(`${colors.bold}2. GOOGLE_CREDENTIALS 검증${colors.reset}`);

  let credentials: any = null;
  try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

    const requiredFields = [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
      'auth_uri',
      'token_uri',
      'auth_provider_x509_cert_url',
      'client_x509_cert_url'
    ];

    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length === 0) {
      log({
        name: 'GOOGLE_CREDENTIALS',
        status: 'success',
        message: '모든 필수 필드 존재'
      });
      log({
        name: 'Service Account Email',
        status: 'success',
        message: credentials.client_email
      });
    } else {
      log({
        name: 'GOOGLE_CREDENTIALS',
        status: 'error',
        message: `누락된 필드: ${missingFields.join(', ')}`
      });
    }
  } catch (error) {
    log({
      name: 'GOOGLE_CREDENTIALS',
      status: 'error',
      message: `유효하지 않은 JSON: ${error}`
    });
  }

  console.log('');

  // 3. Google Sheets API 연결 테스트
  console.log(`${colors.bold}3. Google Sheets API 연결 테스트${colors.reset}`);

  if (!credentials || !credentials.private_key) {
    log({
      name: 'Google Sheets API',
      status: 'error',
      message: 'GOOGLE_CREDENTIALS가 불완전하여 테스트 불가'
    });
  } else {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;

      if (!spreadsheetId) {
        log({
          name: 'Google Sheets API',
          status: 'error',
          message: 'GOOGLE_SHEET_ID가 설정되지 않음'
        });
      } else {
        // 스프레드시트 메타데이터 가져오기
        const response = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        log({
          name: 'Google Sheets 연결',
          status: 'success',
          message: `스프레드시트 연결 성공: "${response.data.properties?.title}"`
        });

        console.log('');
        console.log(`${colors.bold}4. 시트 구조 확인${colors.reset}`);

        // 시트 목록 확인
        const sheetNames = response.data.sheets?.map(sheet => sheet.properties?.title) || [];

        const requiredSheets = ['jonghap_prompts', 'jinro_prompts'];

        for (const sheetName of requiredSheets) {
          if (sheetNames.includes(sheetName)) {
            // 헤더 확인
            try {
              const headerResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A1:C1`,
              });

              const headers = headerResponse.data.values?.[0] || [];
              const expectedHeaders = ['번호', '목차명', '프롬프트'];

              if (headers.length === 3 &&
                  headers[0] === expectedHeaders[0] &&
                  headers[1] === expectedHeaders[1] &&
                  headers[2] === expectedHeaders[2]) {
                log({
                  name: sheetName,
                  status: 'success',
                  message: '시트 존재 및 헤더 올바름'
                });
              } else {
                log({
                  name: sheetName,
                  status: 'warning',
                  message: `시트 존재하나 헤더가 올바르지 않음. 현재: [${headers.join(', ')}], 예상: [${expectedHeaders.join(', ')}]`
                });
              }
            } catch (error) {
              log({
                name: sheetName,
                status: 'warning',
                message: `시트 존재하나 헤더 읽기 실패: ${error}`
              });
            }
          } else {
            log({
              name: sheetName,
              status: 'error',
              message: '시트가 존재하지 않음'
            });
          }
        }

        // 추가 시트 확인
        const extraSheets = sheetNames.filter(name => !requiredSheets.includes(name || ''));
        if (extraSheets.length > 0) {
          log({
            name: '추가 시트',
            status: 'warning',
            message: `예상하지 않은 시트 발견: ${extraSheets.join(', ')}`
          });
        }
      }
    } catch (error: any) {
      log({
        name: 'Google Sheets API',
        status: 'error',
        message: `연결 실패: ${error.message}`
      });
    }
  }

  // 요약
  console.log('');
  console.log(`${colors.bold}=== 검증 요약 ===${colors.reset}`);

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`✅ 성공: ${successCount}`);
  console.log(`⚠️  경고: ${warningCount}`);
  console.log(`❌ 오류: ${errorCount}`);

  if (errorCount > 0) {
    console.log(`\n${colors.red}${colors.bold}⚠️  Phase 2로 진행하기 전에 오류를 해결해야 합니다.${colors.reset}`);
    process.exit(1);
  } else if (warningCount > 0) {
    console.log(`\n${colors.yellow}${colors.bold}⚠️  경고가 있지만 Phase 2로 진행할 수 있습니다.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}${colors.bold}✅ 모든 설정이 완료되었습니다! Phase 2로 진행하세요.${colors.reset}`);
  }
}

main().catch(console.error);
