import { AuthType } from '@/types/user.interface';

export interface CheckEmailResult {
  exists: boolean;
  authType: AuthType;
}

export const checkEmail = async (email: string): Promise<CheckEmailResult> => {
  const response = await fetch('/service/auth/check-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Check email failed');
  }

  return await response.json();
};
