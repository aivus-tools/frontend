'use client';
import dynamic from 'next/dynamic';

export const AppNoSSR = dynamic(() => import('./app'), {
	ssr: false,
});
