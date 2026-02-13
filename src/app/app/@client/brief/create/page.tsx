'use client';

import React, { useState } from 'react';
import { BriefChat } from '@/modules/client/BriefChat/BriefChat';
import { BriefForm } from '@/modules/client/BriefForm/BriefForm';
import { Details } from '@/types/brief.interface';

type Step = 'chat' | 'form';

export default function CreateBriefPage() {
  const [step, setStep] = useState<Step>('chat');
  const [briefData, setBriefData] = useState<Partial<Details> | undefined>(undefined);

  const handleChatComplete = (data: Partial<Details>) => {
    setBriefData(data);
    setStep('form');
  };

  const handleSkipChat = () => {
    setStep('form');
  };

  if (step === 'chat') {
    return <BriefChat onComplete={handleChatComplete} onSkip={handleSkipChat} />;
  }

  return <BriefForm initialData={briefData} />;
}
