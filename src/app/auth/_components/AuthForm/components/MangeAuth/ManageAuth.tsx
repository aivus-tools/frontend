'use client';
import { useState } from 'react';
import { EmailForm } from './components/EmailForm/EmailForm';
import { PasswordForm } from './components/PasswordForm/PasswordForm';
import { RegisterForm } from './components/RegisterForm/RegisterForm';
import { Steps } from '@/types/auth.interface';

export function ManageAuth() {
  const [step, setStep] = useState<Steps | null>(null);
  const [email, setEmail] = useState<string>('');

  const prevStep = () => {
    setStep(null);
  };

  const nextAction = (step: Steps, email: string) => {
    setStep(step);
    setEmail(email);
  };

  switch (step) {
    case 'register':
      return <RegisterForm prevStepAction={prevStep} email={email} />;
    case 'signin':
      return <PasswordForm prevStepAction={prevStep} email={email} />;
    default:
      return <EmailForm nextAction={nextAction} />;
  }
}
