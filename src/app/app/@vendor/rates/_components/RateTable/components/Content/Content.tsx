import React from 'react';
import { Rate } from '@/types/rate.interface';

export const Content: React.FC<{ rates: Rate[] }> = ({ rates }) => {
  console.log(rates);
  return <></>;
};
