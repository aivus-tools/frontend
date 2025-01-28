'use client';
import React, { useCallback, useEffect } from 'react';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';
import { GuidanceAndControls } from './GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from './styled';
import { Form } from 'antd';
import { useMutateBrief } from '@/hooks/useMutateBrief';
import { Details as DetailsType } from '@/types/brief';
import { useBrief } from '@/hooks/useBrief';

export default function Details() {
	const { create, update } = useMutateBrief();
	const { data: brief, isLoading } = useBrief();
	const [form] = Form.useForm<DetailsType>();

	useEffect(() => {
		if (!isLoading && brief && typeof brief.details === 'object') {
			form.setFieldsValue(brief.details);
		}
	}, [brief, form, isLoading]);

	const handleSubmit = useCallback(
		(details: DetailsType) => {
			if (brief) {
				update({ ...brief, details });
			} else {
				create(details);
			}
		},
		[brief, create, update]
	);

	return (
		<Form<DetailsType> form={form} layout='vertical' disabled={false} size='large' onFinish={handleSubmit}>
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
