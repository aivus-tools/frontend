'use client';
import React from 'react';

import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Col, Flex, Row, Typography } from 'antd';
import { useBrief } from '@/hooks/useBrief';
import { GuidanceProvider } from '@/context/Guidance';
import Spinner from '@/components/Spinner';
import HouseIcon from '@/icons/house.svg';

interface Props {
	label: string;
	value?: string;
}

const Item = ({ label, value }: Props) => (
	<Flex gap={4} justify='center' vertical>
		<Typography.Text>{label}</Typography.Text>
		{value ? <Typography.Text>{value}</Typography.Text> : <Typography.Text type='secondary'>Empty</Typography.Text>}
	</Flex>
);

export default function Details() {
	const { data: brief, isLoading } = useBrief();

	if (isLoading) {
		return <Spinner />;
	}

	const details = brief?.details;

	if (!details) {
		return null;
	}

	return (
		<GuidanceProvider>
			<Wrapper>
				<Column style={{ flex: '1 1 70%' }}>
					<Section>
						<Header>Initial parameters</Header>
						<Content>
							<Row align='middle'>
								<Col span={12}>
									<Flex gap={20} align='center'>
										<HouseIcon />
										<Item label='CRM ID | Link' value={details.crmId} />
									</Flex>
								</Col>
								<Col span={12}>
									<Item label='Template' value={details.estimationTemplate} />
								</Col>
							</Row>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={24}>
									<Item label='Project Name' value={details.projectName} />
								</Col>
							</Row>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={24}>
									<Item label='Description' value={details.description} />
								</Col>
							</Row>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={12}>
									<Item label='Internal managers and producers' value={details.internalManagersAndProducers} />
								</Col>
								<Col span={12}>
									<Item label='Line producers and externals' value={details.lineProducersAndExternals} />
								</Col>
							</Row>
						</Content>
					</Section>
					<Section>
						<Header>the Client</Header>
						<Content>Not implemented</Content>
					</Section>
					<Section>
						<Header>the Client’s brief</Header>
						<Content>Not implemented</Content>
					</Section>
					<Section>
						<Header>Rights and Technical Specifications</Header>
						<Content>Not implemented</Content>
					</Section>
				</Column>
				<Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
					<GuidanceAndControls />
				</Column>
			</Wrapper>
		</GuidanceProvider>
	);
}
