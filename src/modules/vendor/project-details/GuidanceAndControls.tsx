'use client';
import React from 'react';

import { Button, Flex, Typography, Form } from 'antd';
import { useComponentSize } from '@/hooks/useComponentSize';
import { Section, Header, Content } from './styled';
import { useGuidance } from '@/context/Guidance';
import styled from 'styled-components';

const BorderDashedLine = styled.div`
	border: 1px dashed #99a1b7;
	margin: 8px 0;
`;

const Description = styled(Typography.Text)`
	margin-top: 8px;
	font-size: 9px !important;
	font-weight: 700 !important;
	line-height: 10.97px !important;
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

export const GuidanceAndControls = () => {
	const { observedRef, width } = useComponentSize();
	const { focusedField } = useGuidance();
	return (
		<Wrapper ref={observedRef}>
			<Section style={{ position: 'fixed', width: width }}>
				<Header>Guidance</Header>
				<Content>
					{focusedField ? (
						<>
							<Typography.Text>{focusedField.label}</Typography.Text>
							<BorderDashedLine />
							<Typography.Text>What is this used for?</Typography.Text>
							<Description type='secondary'>{focusedField.description}</Description>
						</>
					) : (
						<Typography.Text>Click on a field to see guidance</Typography.Text>
					)}
				</Content>
			</Section>
			<Section style={{ position: 'fixed', width: width, bottom: '24px', minWidth: '300px' }}>
				<Content>
					<Flex gap={8} align='center' justify='space-between'>
						<Typography.Text type='secondary'>Saved at 02:14 pm</Typography.Text>
						<Button type='text'>Cancel</Button>
						<Form.Item style={{ width: 'auto', margin: 0 }}>
							<Button type='primary' htmlType='submit'>
								Save
							</Button>
						</Form.Item>
					</Flex>
				</Content>
			</Section>
		</Wrapper>
	);
};
