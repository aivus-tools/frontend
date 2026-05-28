'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spin, message } from 'antd';
import { EmailForm } from './components/EmailForm/EmailForm';
import { PasswordForm } from './components/PasswordForm/PasswordForm';
import { RegisterForm } from './components/RegisterForm/RegisterForm';
import { Steps } from '@/types/auth.interface';
import { AUTH_TYPES } from '@/constants/constants';
import { checkEmail } from '@/helpers/checkEmail';
import { t } from '@/lib/i18n';
import logger from '@/lib/logger';

export function ManageAuth() {
  const [step, setStep] = useState<Steps | null>(null);
  const [email, setEmail] = useState<string>('');
  const [detecting, setDetecting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');
  const autoDetectedRef = useRef(false);

  useEffect(() => {
    if (!emailFromQuery || autoDetectedRef.current) {
      return;
    }
    autoDetectedRef.current = true;
    setDetecting(true);
    checkEmail(emailFromQuery)
      .then((result) => {
        if (result.exists && result.authType === AUTH_TYPES.credentials) {
          setEmail(emailFromQuery);
          setStep('signin');
        } else if (!result.exists) {
          setEmail(emailFromQuery);
          setStep('register');
        } else {
          messageApi.info(t('PLEASE_SIGN_IN_WITH_GOOGLE'));
        }
      })
      .catch((error) => {
        logger.error('Error detecting email from query:', error);
      })
      .finally(() => {
        setDetecting(false);
      });
  }, [emailFromQuery, messageApi]);

  const prevStep = () => {
    setStep(null);
  };

  const nextAction = (nextStep: Steps, nextEmail: string) => {
    setStep(nextStep);
    setEmail(nextEmail);
  };

  if (detecting) {
    return (
      <>
        {contextHolder}
        <Spin spinning />
      </>
    );
  }

  switch (step) {
    case 'register':
      return (
        <>
          {contextHolder}
          <RegisterForm prevStepAction={prevStep} email={email} />
        </>
      );
    case 'signin':
      return (
        <>
          {contextHolder}
          <PasswordForm prevStepAction={prevStep} email={email} />
        </>
      );
    default:
      return (
        <>
          {contextHolder}
          <EmailForm nextAction={nextAction} />
        </>
      );
  }
}
