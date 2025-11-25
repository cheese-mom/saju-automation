'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import type { Prompt } from '@/types';

interface PromptEditorProps {
  prompt: Prompt;
  onSave: (index: number, text: string) => Promise<void>;
  onCancel: () => void;
}

export default function PromptEditor({ prompt, onSave, onCancel }: PromptEditorProps) {
  const [text, setText] = useState(prompt.prompt);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(prompt.prompt);
  }, [prompt]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(prompt.index, text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            프롬프트 {prompt.index}번 편집
          </h3>
          <p className="text-sm text-gray-600 mt-1">{prompt.title}</p>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프롬프트 내용
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={20}
              placeholder="프롬프트를 입력하세요. 비워두면 이 목차는 건너뜁니다."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* 변수 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              사용 가능한 변수
            </h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <code className="bg-blue-100 px-2 py-0.5 rounded">
                  {'{이름}'}
                </code>{' '}
                - 고객 이름
              </p>
              <p>
                <code className="bg-blue-100 px-2 py-0.5 rounded">
                  {'{명식표}'}
                </code>{' '}
                - 만세력 명식표 데이터
              </p>
              <p>
                <code className="bg-blue-100 px-2 py-0.5 rounded">
                  {'{추가질문}'}
                </code>{' '}
                - 추가 질문 (8번 목차에서 사용)
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button onClick={onCancel} variant="secondary" disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
