'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import PromptEditor from '@/components/PromptEditor';
import type { Product, Prompt } from '@/types';

export default function PromptsPage() {
  const [product, setProduct] = useState<Product>('jonghap');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 에디터 상태
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // 프롬프트 로드
  const loadPrompts = async (productType: Product) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/prompts?product=${productType}`);
      const data = await response.json();

      if (data.status === 'success') {
        setPrompts(data.prompts);
      } else {
        setError(data.error || '프롬프트 로드 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(`네트워크 오류: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 프롬프트 저장
  const savePrompt = async (index: number, text: string) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          index,
          prompt: text,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMessage('프롬프트가 저장되었습니다.');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditingPrompt(null);
        loadPrompts(product); // 재로드
      } else {
        setError(data.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(`네트워크 오류: ${err.message}`);
    }
  };

  // 상품 변경 시 프롬프트 재로드
  useEffect(() => {
    loadPrompts(product);
  }, [product]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            프롬프트 관리
          </h2>
          <p className="text-sm text-gray-600">
            구글 시트의 프롬프트를 조회하고 편집할 수 있습니다.
          </p>
        </div>

        {/* 상품 선택 */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            상품 선택:
          </label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value as Product)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="jonghap">종합 사주</option>
            <option value="jinro">진로 사주</option>
          </select>

          <div className="flex-1" />

          <Button
            onClick={() => loadPrompts(product)}
            variant="secondary"
            disabled={isLoading}
          >
            새로고침
          </Button>
        </div>

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading ? (
          <LoadingSpinner message="프롬프트를 불러오는 중..." />
        ) : (
          /* 프롬프트 목록 */
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <div
                key={prompt.index}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {prompt.index}. {prompt.title}
                    </h3>

                    {prompt.prompt && prompt.prompt.trim() !== '' ? (
                      <p className="text-sm text-gray-600 line-clamp-2 font-mono">
                        {prompt.prompt.substring(0, 150)}
                        {prompt.prompt.length > 150 && '...'}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        (비어있음 - 건너뜀)
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => setEditingPrompt(prompt)}
                    variant="secondary"
                    className="ml-4 shrink-0"
                  >
                    편집
                  </Button>
                </div>
              </div>
            ))}

            {prompts.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                프롬프트가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 프롬프트 에디터 모달 */}
      {editingPrompt && (
        <PromptEditor
          prompt={editingPrompt}
          onSave={savePrompt}
          onCancel={() => setEditingPrompt(null)}
        />
      )}
    </div>
  );
}
