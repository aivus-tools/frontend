'use client';
import React from 'react';

import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Col, Flex, Row, Typography } from 'antd';
import { useBrief } from '@/hooks/useBrief';
import { GuidanceProvider } from '@/context/Guidance';
import Spinner from '@/components/Spinner';
import HouseIcon from '@/icons/house.svg';
import styled from 'styled-components';

interface Props {
	label?: string;
	value?: string;
}

const Label = styled(Typography.Text)`
	font-weight: 400;
	font-size: 14px;
	line-height: 17.07px;
`;

const Text = styled(Typography.Text)`
	font-weight: 600;
	font-size: 14px;
	line-height: 17.07px;
`;

const TextEmpty = styled(Typography.Text)`
	font-weight: 600;
	font-size: 14px;
	line-height: 17.07px;
	color: #d9d9d9 !important;
`;

const VideoDescription = styled(Typography.Text)`
	font-weight: 400;
	font-style: italic;
	font-size: 14px;
	line-height: 17.07px;
`;

const Item = ({ label, value }: Props) => (
	<Flex gap={4} justify='center' vertical>
		{label && <Label>{label}</Label>}
		{value ? <Text>{value}</Text> : <TextEmpty>Empty</TextEmpty>}
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
						<Content>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={12}>
									<Item label='Client' value={details.clientName} />
								</Col>
								<Col span={12}>
									<Item label='IRS EIN ' value={details.irsEin} />
								</Col>
							</Row>
							{details.managers.map((manager, index) => (
								<Row align='middle' style={{ marginTop: index === 0 ? 20 : 8 }} key={index}>
									<Col span={12}>
										<Item label={index === 0 ? 'Client’s managers' : undefined} value={manager.manager} />
									</Col>
									<Col span={12}>
										<Item label={index === 0 ? 'Manager position' : undefined} value={manager.position} />
									</Col>
								</Row>
							))}
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={12}>
									<Item label='Brand name' value={details.brandName} />
								</Col>
							</Row>
						</Content>
					</Section>
					<Section>
						<Header>the Client’s brief</Header>
						<Content>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={24}>
									<Item label='Project Description' value={details.projectDescription} />
								</Col>
							</Row>
							{details.referenceVideos.map((video, index) => (
								<Row align='middle' style={{ marginTop: index === 0 ? 20 : 8 }} key={index}>
									<Col span={12}>
										<Item label={index === 0 ? 'Reference videos' : undefined} value={video.url} />
									</Col>
									<Col span={12}>
										<VideoDescription>{video.comment}</VideoDescription>
									</Col>
								</Row>
							))}
						</Content>
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
