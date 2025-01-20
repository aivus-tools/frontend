'use client';

import dynamic from 'next/dynamic';

const ProjectDetails = dynamic(() => import('./Details'), { ssr: false });

export default function Page() {
	return <ProjectDetails />;
}
