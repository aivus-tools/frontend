'use client';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { InitialParameters } from './InitialParameters';
import { Client } from './Client';
import { Brief } from './Brief';
import { Specifications } from './Specifications';
import { Button, Flex, Form as LibForm, Typography } from 'antd';

const Wrapper = styled.div`
	display: flex;
	gap: 30px;
	padding: 24px 30px;
`;

const Section = styled.div`
	display: flex;
	flex-direction: column;
`;

const Column = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

const Header = styled.div`
	color: var(--main);
	font-size: 14px;
	font-style: normal;
	font-weight: 700;
	line-height: normal;
	text-transform: uppercase;
	padding: 0px 6px 4px 6px;
`;

const Content = styled.div`
	display: flex;
	padding: 30px;
	flex-direction: column;
	align-items: flex-start;
	gap: 20px;
	align-self: stretch;
	border-radius: 6px;
	background-color: #fff;

	box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
`;

const Form = styled(LibForm)`
	& .ant-form-item {
		width: 100%;
	}
`;

const Side = () => {
	const observedRef = React.useRef<HTMLDivElement>(null);
	const [width, setWidth] = React.useState(0);

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				setWidth(cr.width);
			}
		});
		resizeObserver.observe(observedRef.current as Element);
		return () => {
			resizeObserver.disconnect();
		};
	});

	return (
		<>
			<Section ref={observedRef}>
				<Header>Guidance</Header>
				<Content>
					<div>Guidance</div>
				</Content>
			</Section>
			<Section style={{ position: 'fixed', bottom: '30px', right: '30px', width, minWidth: '300px' }}>
				<Content>
					<Flex gap={8} align='center' justify='space-between'>
						<Typography.Text type='secondary'>Saved at 02:14 pm</Typography.Text>
						<Button type='text'>Cancel</Button>
						<Form.Item label={null} style={{ width: 'auto', margin: 0 }}>
							<Button type='primary' htmlType='submit'>
								Save
							</Button>
						</Form.Item>
					</Flex>
				</Content>
			</Section>
		</>
	);
};

export const Details: React.FC = () => {
	return (
		<Form layout='vertical' disabled={false} size='large' onFinish={(...args) => console.log(args)}>
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
					<Side />
				</Column>
			</Wrapper>
		</Form>
	);
};
