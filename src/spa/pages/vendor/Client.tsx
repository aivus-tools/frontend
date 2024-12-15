import React from 'react';
import { Form, Input, Flex, Select } from 'antd';

export const Client: React.FC = () => {
	return (
		<>
			<Form layout='vertical' disabled={false} size='large' style={{ width: '100%' }}>
				<Flex gap={20} flex={1}>
					<Form.Item
						label='Client'
						extra='A name of the client is required and recommended to be unique.'
						style={{
							flex: '1 1 60%',
						}}
					>
						<Input placeholder='Client' />
					</Form.Item>
					<Form.Item
						label='IRS EIN'
						extra='Taxpayer Id'
						style={{
							flex: '1 1 40%',
						}}
					>
						<Input placeholder='IRS EIN' />
					</Form.Item>
				</Flex>
				<Form.Item label='Brand name' extra='Specify the specific brand within your company, if needed.'>
					<Input placeholder='Brand name' />
				</Form.Item>
				<Flex gap={20}>
					<Form.Item
						label='Client’s managers'
						extra='Indicate the project managers responsible.'
						style={{
							flex: '1 1 55%',
						}}
					>
						<Select placeholder='' />
					</Form.Item>
					<Form.Item
						label='Manager position'
						style={{
							flex: '1 1 45%',
						}}
					>
						<Input placeholder='' />
					</Form.Item>
				</Flex>
			</Form>
		</>
	);
};
