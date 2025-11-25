import { google } from 'googleapis';
import type { Product, Prompt } from '@/types';

/**
 * 프롬프트 관리 시스템
 * Google Sheets API를 사용하여 프롬프트를 로드하고 업데이트합니다.
 */
export class PromptManager {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const credentials = process.env.GOOGLE_CREDENTIALS;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID 환경 변수가 설정되지 않았습니다.');
    }

    if (!credentials) {
      throw new Error('GOOGLE_CREDENTIALS 환경 변수가 설정되지 않았습니다.');
    }

    this.spreadsheetId = spreadsheetId;

    try {
      // Service Account 인증
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
    } catch (error: any) {
      throw new Error(`Google Sheets 인증 실패: ${error.message}`);
    }
  }

  /**
   * 시트 이름 가져오기
   */
  private getSheetName(productType: Product): string {
    return `${productType}_prompts`;
  }

  /**
   * 구글 시트에서 프롬프트 로드
   * @param productType - 'jonghap' 또는 'jinro'
   * @returns 프롬프트 배열
   */
  async loadPrompts(productType: Product): Promise<Prompt[]> {
    try {
      const sheetName = this.getSheetName(productType);
      console.log(`[PromptManager] ${sheetName} 시트에서 프롬프트 로드 중...`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:C100`, // 헤더 제외, 최대 100행
      });

      const rows = response.data.values || [];
      const prompts: Prompt[] = [];

      for (const row of rows) {
        if (row.length >= 2) {
          // A열이 비어있으면 종료
          if (!row[0] || row[0].trim() === '') {
            break;
          }

          prompts.push({
            index: parseInt(row[0]) || 0,
            title: row[1] || '',
            prompt: row[2] || '', // C열이 없으면 빈 문자열
          });
        }
      }

      console.log(`[PromptManager] ${prompts.length}개 프롬프트 로드 완료`);
      return prompts;

    } catch (error: any) {
      console.error('[PromptManager] 프롬프트 로드 실패:', error.message);
      throw new Error(`프롬프트 로드 실패: ${error.message}`);
    }
  }

  /**
   * 특정 프롬프트 업데이트
   * @param productType - 'jonghap' 또는 'jinro'
   * @param index - 프롬프트 번호 (1-8)
   * @param promptText - 업데이트할 프롬프트 내용
   */
  async updatePrompt(
    productType: Product,
    index: number,
    promptText: string
  ): Promise<void> {
    try {
      const sheetName = this.getSheetName(productType);
      const rowNumber = index + 1; // 헤더 때문에 +1
      const cell = `${sheetName}!C${rowNumber}`;

      console.log(`[PromptManager] ${cell} 셀 업데이트 중...`);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: cell,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[promptText]],
        },
      });

      console.log(`[PromptManager] 프롬프트 ${index}번 업데이트 완료`);

    } catch (error: any) {
      console.error('[PromptManager] 프롬프트 업데이트 실패:', error.message);
      throw new Error(`프롬프트 업데이트 실패: ${error.message}`);
    }
  }

  /**
   * 시트 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      console.log(`[PromptManager] 연결 성공: "${response.data.properties?.title}"`);
      return true;

    } catch (error: any) {
      console.error('[PromptManager] 연결 실패:', error.message);
      return false;
    }
  }
}
