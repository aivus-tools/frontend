'use client';
import { ReactNode } from 'react';

import { GuidanceAndControls } from '../common/GuidanceAndControls';
import { Wrapper, Section, Header, Column, Content } from '../common/styled';
import { Col, Flex, Row, Typography } from 'antd';
import { useBrief } from '@/hooks/useBrief';
import { GuidanceProvider } from '@/context/Guidance';
import Spinner from '@/components/Spinner';
import HouseIcon from '@/icons/house.svg';
import { styled } from 'styled-components';
import i18n from 'i18n-iso-countries';
import CrossIcon from '@/icons/cross.svg';
import { timeUnitsMap } from '@/lib/utils';

interface Props {
	label?: string;
	value?: string | ReactNode;
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

const ItalicComment = styled(Typography.Text)`
	font-weight: 400;
	font-style: italic;
	font-size: 14px;
	line-height: 17.07px;
`;

function formatUrl(url: string): string {
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.hostname + parsedUrl.pathname;
	} catch (error) {
		console.error(error);
		return '';
	}
}

function formatCount(count: number, { singular, plural }: { singular: string; plural: string }): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

function formatTimeUnit(number: string, unit: string): string {
	const countNumber = parseInt(number, 10);
	if (!Number.isFinite(countNumber)) {
		return '';
	}
	const timeUnit = timeUnitsMap.find((timeUnit) => timeUnit.plural === unit);
	if (timeUnit) {
		return formatCount(countNumber, timeUnit);
	}

	return '';
}

const Item = ({ label, value }: Props) => (
	<Flex gap={4} justify='center' vertical>
		{label && <Label>{label}</Label>}
		{value ? <Text>{value}</Text> : <TextEmpty>Empty</TextEmpty>}
	</Flex>
);

export default function Details() {
	const { data: brief, isLoading } = useBrief();
	const countries = i18n.getNames('en', { select: 'official' });

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
						<Content style={{ minWidth: '584px' }}>
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
									<Item
										label='Collaborators'
										value={details.collaborators?.map((person) => {
											const label = (person as unknown as { label: string })?.label;

											if (label) {
												return (
													<>
														{label}
														<br />
													</>
												);
											}
											return null;
										})}
									/>
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
										<Item
											label={index === 0 ? 'Reference videos' : undefined}
											value={
												<Typography.Link href={video.url} target='_blank' rel='noreferrer'>
													{formatUrl(video.url)}
												</Typography.Link>
											}
										/>
									</Col>
									<Col span={12}>
										<ItalicComment>{video.comment}</ItalicComment>
									</Col>
								</Row>
							))}
						</Content>
					</Section>
					<Section>
						<Header>Rights and Technical Specifications</Header>
						<Content>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={12}>
									<Item label='Distribution and Ad placements' value={details.distributionAndAdPlacements} />
								</Col>
							</Row>
							<Row align='middle' style={{ marginTop: 20 }} gutter={16}>
								<Col span={12}>
									<Item
										label='Territory'
										value={
											<>
												{details.territory.map((country, index) => (
													<Text key={country}>
														{countries[country]}
														{index === details.territory.length - 1 ? '' : ', '}
													</Text>
												))}
											</>
										}
									/>
								</Col>
								<Col span={12}>
									<Item
										label='Term'
										value={
											details.term.unit === 'perpetuity'
												? details.term.unit
												: formatTimeUnit(details.term.length, details.term.unit)
										}
									/>
								</Col>
							</Row>
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={24}>
									<Item
										label='Main video'
										value={
											<Row align='middle'>
												<Col span={8}>
													<Text>{`${details.mainVideoDuration.number} video`} </Text>
													<CrossIcon />
													<Text style={{ marginLeft: '4px' }}>
														{formatTimeUnit(details.mainVideoDuration.length, details.mainVideoDuration.timeUnit)}
													</Text>
												</Col>
												<Col span={16}>
													<ItalicComment>{details.mainVideoDuration.comment}</ItalicComment>
												</Col>
											</Row>
										}
									/>
								</Col>
							</Row>
							{details.cuts.map((cut, index) => (
								<Row
									key={cut.comment + cut.number + cut.length + cut.timeUnit}
									align='middle'
									style={{ marginTop: index === 0 ? 20 : 4 }}
								>
									<Col span={8}>
										<Text>{`${cut.number} video`} </Text>
										<CrossIcon />
										<Text style={{ marginLeft: '4px' }}>{formatTimeUnit(cut.length, cut.timeUnit)}</Text>
									</Col>
									<Col span={16}>
										<ItalicComment>{cut.comment}</ItalicComment>
									</Col>
								</Row>
							))}
							<Row align='middle' style={{ marginTop: 20 }}>
								<Col span={24}>
									<Item
										label='Shooting days'
										value={
											<Row align='middle'>
												<Col span={8}>
													<Text>{`${details.shootingDays.number} video`} </Text>
													<CrossIcon />
													<Text style={{ marginLeft: '4px' }}>
														{formatTimeUnit(details.shootingDays.length, 'days')}
													</Text>
												</Col>
												<Col span={16}>
													<ItalicComment>{details.shootingDays.comment}</ItalicComment>
												</Col>
											</Row>
										}
									/>
								</Col>
							</Row>
						</Content>
					</Section>
				</Column>
				<Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
					<GuidanceAndControls />
				</Column>
			</Wrapper>
		</GuidanceProvider>
	);
}
