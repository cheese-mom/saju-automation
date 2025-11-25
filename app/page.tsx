'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Product, LLMProvider, GenerateResponse } from '@/types';

export default function Home() {
  // Form state
  const [product, setProduct] = useState<Product>('jonghap');
  const [llm, setLlm] = useState<LLMProvider>('gemini');
  const [name, setName] = useState('');
  const [manseryeok, setManseryeok] = useState('');
  const [question, setQuestion] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult('');
    setCopyMessage('');

    // Validation
    if (!name.trim()) {
      setError('고객 이름을 입력해주세요.');
      return;
    }

    if (!manseryeok.trim()) {
      setError('명식표를 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          llm,
          name: name.trim(),
          manseryeok: manseryeok.trim(),
          question: question.trim() || undefined,
        }),
      });

      const data: GenerateResponse = await response.json();

      if (data.status === 'success') {
        setResult(data.result);
      } else {
        setError(data.error || '사주 생성 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(`네트워크 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopyMessage('클립보드에 복사되었습니다!');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (err) {
      setCopyMessage('복사 실패: 클립보드 권한을 확인해주세요.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          사주 자동 생성
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 상품 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. 상품 선택 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="product"
                  value="jonghap"
                  checked={product === 'jonghap'}
                  onChange={(e) => setProduct(e.target.value as Product)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">종합 사주</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="product"
                  value="jinro"
                  checked={product === 'jinro'}
                  onChange={(e) => setProduct(e.target.value as Product)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">진로 사주</span>
              </label>
            </div>
          </div>

          {/* LLM 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. LLM 선택 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="llm"
                  value="gemini"
                  checked={llm === 'gemini'}
                  onChange={(e) => setLlm(e.target.value as LLMProvider)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Gemini</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="llm"
                  value="gpt"
                  checked={llm === 'gpt'}
                  onChange={(e) => setLlm(e.target.value as LLMProvider)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">GPT</span>
              </label>
            </div>
          </div>

          {/* 고객 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. 고객 정보
            </label>
            <Input
              label="이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>

          {/* 명식표 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4. 명식표 입력 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={manseryeok}
              onChange={(e) => setManseryeok(e.target.value)}
              placeholder="만세력 명식표를 입력하세요...&#10;&#10;예시:&#10;시 일 월 년&#10;갑 을 병 정&#10;자 축 인 묘"
              rows={12}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* 추가 질문 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              5. 추가 질문 (선택)
            </label>
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="추가 질문이 있다면 입력하세요..."
              helperText="8번 목차 '따로 질문 주신 부분 답변' 으로 사용됩니다"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 생성 버튼 */}
          <Button
            type="submit"
            isLoading={isGenerating}
            fullWidth
            disabled={isGenerating}
          >
            {isGenerating ? '사주 생성 중...' : '사주 생성 시작'}
          </Button>
        </form>

        {/* 로딩 상태 */}
        {isGenerating && (
          <div className="mt-8">
            <LoadingSpinner
              size="lg"
              message="사주를 생성하는 중입니다... (최대 5분 소요)"
            />
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                진행 상황
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>⏳ 8개 프롬프트를 순차적으로 실행하고 있습니다</p>
                <p className="text-xs text-gray-500">
                  • 각 프롬프트는 30초~1분 정도 소요됩니다<br />
                  • 빈 프롬프트는 자동으로 건너뜁니다<br />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {result && !isGenerating && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">생성 결과</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handleCopy} variant="secondary">
                  클립보드 복사
                </Button>
              </div>
            </div>

            {copyMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{copyMessage}</p>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
