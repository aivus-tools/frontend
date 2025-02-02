'use client';
import React, { useCallback, useEffect } from 'react';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';
import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Form } from 'antd';
import { useMutateBrief } from '@/hooks/useMutateBrief';
import { Details as DetailsType } from '@/types/brief';
import { useBrief } from '@/hooks/useBrief';
import { GuidanceProvider } from '@/context/Guidance';
import { useAppDispatch } from '@/lib/hooks';
import { setMode } from '@/store/slices/project';

export default function Details() {
	const dispatch = useAppDispatch();
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
			dispatch(setMode('view'));
		},
		[brief, create, dispatch, update]
	);

	return (
		<GuidanceProvider>
			<Form<DetailsType>
				form={form}
				layout='vertical'
				disabled={false}
				size='large'
				onFinish={handleSubmit}
				scrollToFirstError
				clearOnDestroy
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
		</GuidanceProvider>
	);
}
