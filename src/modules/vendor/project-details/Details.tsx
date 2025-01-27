'use client';
import React, { useEffect, useRef, useState } from 'react';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';
import { GuidanceAndControls } from './GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from './styled';
import { Form } from 'antd';
import { useMutateBrief } from '@/hooks/useMutateBrief';
import { useAppSelector } from '@/lib/hooks';
import { selectProjectId } from '@/store/slices/project';
import { useBriefs } from '@/hooks/useBriefs';
import { Brief as BriefType, Details as DetailsType } from '@/types/brief';

export default function Details() {
	const { create, update } = useMutateBrief();
	const projectId = useAppSelector(selectProjectId);
	const { data: briefs } = useBriefs();
	const [form] = Form.useForm<DetailsType>();
	const initialized = useRef(false);
	const [brief, setBrief] = useState<BriefType | null>(null);

	useEffect(() => {
		if (initialized.current) return;

		try {
			const brief = briefs?.find((brief) => brief.id === projectId);
			if (brief) {
				form.setFieldsValue(JSON.parse(brief.details));
				setBrief(brief);
				initialized.current = true;
			}
		} catch (error) {
			console.warn('Failed to parse brief data', error);
		}
	}, [projectId, briefs, form]);

	return (
		<Form<DetailsType>
			form={form}
			layout='vertical'
			disabled={false}
			size='large'
			onFinish={(details) => {
				if (brief) {
					update({ ...brief, details: JSON.stringify(details) });
				} else {
					create(details as object);
				}
			}}
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
