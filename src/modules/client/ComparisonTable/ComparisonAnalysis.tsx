'use client';

import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined, BulbOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useAnalyzeComparisonMutation } from '@/services/client/comparisonApi';
import { AnalysisResponse } from '@/types/chat.interface';
import {
  AnalysisPanel,
  AnalysisTabs,
  AnalysisTab,
  AnalysisContent,
  AnalysisTitle,
  AnalysisText,
  HighlightItem,
  AnalysisChatInput,
} from './styled';

interface ComparisonAnalysisProps {
  briefId: string;
}

export const ComparisonAnalysis: React.FC<ComparisonAnalysisProps> = ({ briefId }) => {
  const [activeTab, setActiveTab] = useState<'guidance' | 'comments'>('guidance');
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const [analyzeComparison, { isLoading }] = useAnalyzeComparisonMutation();

  const handleAskQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const historyForRequest = chatHistory;
    setChatHistory((prev) => [...prev, { role: 'user', content: trimmed }]);
    setQuestion('');

    try {
      const result = await analyzeComparison({
        briefId,
        question: trimmed,
        history: historyForRequest,
      }).unwrap();
      setAnalysis(result);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: result.analysis }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: t('UNEXPECTED_ERROR') }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <AnalysisPanel>
      <AnalysisTabs>
        <AnalysisTab $active={activeTab === 'guidance'} onClick={() => setActiveTab('guidance')}>
          {t('GUIDANCE')}
        </AnalysisTab>
        <AnalysisTab $active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>
          {t('AI_ANALYSIS')}
        </AnalysisTab>
      </AnalysisTabs>

      <AnalysisContent>
        {activeTab === 'guidance' ? (
          <>
            <AnalysisTitle>{t('GUIDANCE')}</AnalysisTitle>
            <AnalysisText>{t('COMPARISON_GUIDANCE_TEXT')}</AnalysisText>
            <AnalysisText>{t('COMPARISON_COLOR_HINT')}</AnalysisText>
          </>
        ) : (
          <>
            <AnalysisTitle>{t('AI_ANALYSIS')}</AnalysisTitle>

            {analysis?.highlights && analysis.highlights.length > 0 && (
              <>
                <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 12, color: '#4b5675' }}>
                  {t('HIGHLIGHTS')}
                </div>
                {analysis.highlights.map((highlight, index) => (
                  <HighlightItem key={index}>
                    <BulbOutlined style={{ color: '#FFC107', flexShrink: 0, marginTop: 2 }} />
                    {highlight}
                  </HighlightItem>
                ))}
              </>
            )}

            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f4f5f8',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: msg.role === 'user' ? '#2288FF' : '#4CAF50',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  {msg.role === 'user' ? t('YOU') : t('AI_ASSISTANT')}
                </div>
                <AnalysisText>{msg.content}</AnalysisText>
              </div>
            ))}

            {chatHistory.length === 0 && !analysis && (
              <AnalysisText style={{ color: '#99a1b7', fontStyle: 'italic' }}>{t('ASK_ABOUT_OFFERS')}</AnalysisText>
            )}
          </>
        )}
      </AnalysisContent>

      {activeTab === 'comments' && (
        <AnalysisChatInput>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ASK_ABOUT_OFFERS')}
            disabled={isLoading}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 13,
              borderRadius: 8,
            }}
          />
          <Button
            type='primary'
            icon={<SendOutlined />}
            onClick={handleAskQuestion}
            disabled={!question.trim() || isLoading}
            loading={isLoading}
            style={{
              background: '#FD8258',
              borderColor: '#FD8258',
              borderRadius: 8,
            }}
          />
        </AnalysisChatInput>
      )}
    </AnalysisPanel>
  );
};
