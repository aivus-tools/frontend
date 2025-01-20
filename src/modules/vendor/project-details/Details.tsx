'use client';
import React from 'react';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';
import { GuidanceAndControls } from './GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content, Form } from './styled';
import { useBrief } from '@/hooks/useBrief';

const initialValues = {
	crmId: '',
	clientName: '',
	irsEin: '',
	brandName: '',
	managers: [{ manager: '', position: '' }],
	projectDescription: '',
	referenceVideos: [{ url: '', comment: '' }],
	distributionAndAdPlacements: '',
	territory: '',
	term: { length: '' },
	mainVideoDuration: { number: '', length: '', comment: '' },
	cuts: [{ url: '', comment: '', number: '', length: '' }],
	shootingDays: { number: '', length: '', comment: '' },
};

export default function Details() {
	const createBrief = useBrief();

	return (
		<Form
			layout='vertical'
			initialValues={initialValues}
			disabled={false}
			size='large'
			onFinish={(details) => createBrief(details as object)}
		>
			<Wrapper>
				<Column style={{ flex: '1 1 70%' }}>
					<Section>
						<Header>Initial parameters</Header>
						<Content>
							<InitialParameters />
						</Content>
					</Section>
					<Section>
						<Header>the Client</Header>
						<Content>
							<Client />
						</Content>
					</Section>
					<Section>
						<Header>the Client’s brief</Header>
						<Content>
							<Brief />
						</Content>
					</Section>
					<Section>
						<Header>Rights and Technical Specifications</Header>
						<Content>
							<Specifications />
						</Content>
					</Section>
				</Column>
				<Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
					<GuidanceAndControls />
				</Column>
			</Wrapper>
		</Form>
	);
}
