'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, message } from 'antd';
import { styled } from 'styled-components';
import { t } from '@/lib/i18n';
import { useStartPublicBriefMutation, savePublicBriefToken } from '@/services/client/publicBriefApi';
import { AppRoute } from '@/constants/appRoute';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fb 0%, #eef0f4 100%);
  padding: 40px 20px;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 48px 40px;
  max-width: 640px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: #1f2937;
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  text-align: center;
  line-height: 1.6;
  max-width: 480px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2288ff;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Logo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #2288ff;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
`;

const Example = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #9ca3af;
  margin: -12px 0 0;
  line-height: 1.5;
  font-style: italic;
  text-align: center;
`;

export default function PublicBriefPage() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [startPublicBrief] = useStartPublicBriefMutation();

  const handleCreate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await startPublicBrief({ message: trimmed }).unwrap();
      savePublicBriefToken(result.briefId, result.token);
      router.push(`${AppRoute.PUBLIC_BRIEF_DETAIL(result.briefId)}?taskId=${result.taskId}`);
    } catch {
      message.error(t('BRIEF_V2_GENERATION_FAILED'));
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Logo>AIVUS</Logo>
        <Title>{t('BRIEF_V2_PUBLIC_TITLE')}</Title>
        <Subtitle>{t('BRIEF_V2_PUBLIC_SUBTITLE')}</Subtitle>
        <Textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={t('BRIEF_V2_DESCRIBE_PROJECT')}
          disabled={isLoading}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && inputValue.trim()) {
              event.preventDefault();
              handleCreate();
            }
          }}
        />
        <Example>{t('BRIEF_V2_START_EXAMPLE')}</Example>
        <Button
          type='primary'
          size='large'
          onClick={handleCreate}
          loading={isLoading}
          disabled={!inputValue.trim()}
          style={{
            background: '#FD8258',
            borderColor: '#FD8258',
            fontWeight: 600,
            minWidth: 220,
            height: 48,
            fontSize: 16,
          }}
        >
          {t('BRIEF_V2_CREATE_BUTTON')}
        </Button>
      </Card>
    </PageWrapper>
  );
}
