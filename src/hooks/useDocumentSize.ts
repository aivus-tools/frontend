'use client';
import { useEffect, useRef, useState } from 'react';

export const useDocumentSize = () => {
	const [size, setSize] = useState({ width: 0, height: 0 });
	const body = useRef(document.body);
	const html = useRef(document.documentElement);

	useEffect(() => {
		const updateSize = () => {
			setSize({
				width: html.current.clientWidth,
				height: Math.max(
					body.current.scrollHeight,
					body.current.offsetHeight,
					html.current.clientHeight,
					html.current.scrollHeight,
					html.current.offsetHeight
				),
			});
		};
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, []);

	return size;
};
