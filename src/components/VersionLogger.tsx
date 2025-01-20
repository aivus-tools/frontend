'use client';
import { useEffect } from 'react';

export const VersionLogger = ({ creationDate }: { creationDate?: string }) => {
	useEffect(() => {
		console.log('Build date', creationDate);
	}, [creationDate]);
	return null;
};
