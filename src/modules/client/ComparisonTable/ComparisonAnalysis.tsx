'use client';

import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined, BulbOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useAnalyzeComparisonMutation } from '@/services/client/comparisonApi';
import { AnalysisResponse } from '@/types/chat.interface';

import styles from './ComparisonAnalysis.module.css';

interface ComparisonAnalysisProps {
  briefId: string;
}

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

export const ComparisonAnalysis = (props: ComparisonAnalysisProps) => {
  const [activeTab, setActiveTab] = useState<'guidance' | 'comments'>('guidance');
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);

  const [analyzeComparison, { isLoading }] = useAnalyzeComparisonMutation();

  const handleAskQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const historyForRequest = chatHistory;
    setChatHistory((prev) => [...prev, { role: 'user', content: trimmed }]);
    setQuestion('');

    try {
      const result = await analyzeComparison({
        briefId: props.briefId,
        question: trimmed,
        history: historyForRequest,
      }).unwrap();
      setAnalysis(result);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: result.analysis }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: t('UNEXPECTED_ERROR') }]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAskQuestion();
    }
  };

  const tabClass = (active: boolean): string => {
    return active ? `${styles.analysisTab} ${styles.analysisTabActive}` : styles.analysisTab;
  };

  return (
    <div className={styles.analysisPanel}>
      <div className={styles.analysisTabs}>
        <button type='button' className={tabClass(activeTab === 'guidance')} onClick={() => setActiveTab('guidance')}>
          {t('GUIDANCE')}
        </button>
        <button type='button' className={tabClass(activeTab === 'comments')} onClick={() => setActiveTab('comments')}>
          {t('AI_ANALYSIS')}
        </button>
      </div>

      <div className={styles.analysisContent}>
        {activeTab === 'guidance' ? (
          <>
            <h3 className={styles.analysisTitle}>{t('GUIDANCE')}</h3>
            <p className={styles.analysisText}>{t('COMPARISON_GUIDANCE_TEXT')}</p>
            <p className={styles.analysisText}>{t('COMPARISON_COLOR_HINT')}</p>
          </>
        ) : (
          <>
            <h3 className={styles.analysisTitle}>{t('AI_ANALYSIS')}</h3>

            {analysis?.highlights && analysis.highlights.length > 0 && (
              <>
                <div className={styles.highlightsHeader}>{t('HIGHLIGHTS')}</div>
                {analysis.highlights.map((highlight, index) => (
                  <div key={index} className={styles.highlightItem}>
                    <BulbOutlined className={styles.highlightIcon} />
                    {highlight}
                  </div>
                ))}
              </>
            )}

            {chatHistory.map((msg, index) => (
              <div key={index} className={styles.chatMessage}>
                <div
                  className={
                    msg.role === 'user'
                      ? `${styles.chatRole} ${styles.chatRoleUser}`
                      : `${styles.chatRole} ${styles.chatRoleAssistant}`
                  }
                >
                  {msg.role === 'user' ? t('YOU') : t('AI_ASSISTANT')}
                </div>
                <p className={styles.analysisText}>{msg.content}</p>
              </div>
            ))}

            {chatHistory.length === 0 && !analysis && (
              <p className={`${styles.analysisText} ${styles.analysisPlaceholder}`}>{t('ASK_ABOUT_OFFERS')}</p>
            )}
          </>
        )}
      </div>

      {activeTab === 'comments' && (
        <div className={styles.analysisChatInput}>
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ASK_ABOUT_OFFERS')}
            disabled={isLoading}
            className={styles.questionInput}
          />
          <Button
            type='primary'
            icon={<SendOutlined />}
            onClick={handleAskQuestion}
            disabled={!question.trim() || isLoading}
            loading={isLoading}
            className={styles.sendButton}
          />
        </div>
      )}
    </div>
  );
};
