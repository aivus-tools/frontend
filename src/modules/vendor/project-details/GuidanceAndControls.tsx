'use client';
import React from 'react';

import { Button, Flex, Typography } from 'antd';
import { useComponentSize } from '@/hooks/useComponentSize';
import { Section, Header, Content, Form } from './styled';

export const GuidanceAndControls = () => {
	const { observedRef, width } = useComponentSize();

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
