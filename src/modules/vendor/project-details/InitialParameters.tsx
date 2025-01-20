import React from 'react';
import { Form, Input, Space, Select, Flex } from 'antd';
import { Uploader } from './Uploader';

const { TextArea } = Input;

export const InitialParameters: React.FC = () => {
	return (
		<>
			<Flex gap={30} style={{ width: '100%' }}>
				<Form.Item name='previewImage' valuePropName='image' style={{ width: 'auto' }}>
					<Uploader />
				</Form.Item>
				<Flex gap={20} flex={1}>
					<Form.Item
						name='crmId'
						label='CRM ID | Link'
						extra='Set your own ID if applicable.'
						style={{
							flex: 1,
						}}
					>
						<Input placeholder='CRM ID | Link' />
					</Form.Item>
					<Form.Item
						label='Choose the Estimation Template'
						extra='Select one of your templates.'
						style={{
							flex: 1,
						}}
					>
						<Select placeholder='Select an option' />
					</Form.Item>
				</Flex>
			</Flex>
			<Form.Item label='Project Name' extra='A project name is required and recommended to be unique.'>
				<Input placeholder='Project name' />
			</Form.Item>
			<Form.Item label='Description' extra='Set a description to the project if needed. Visible by your team only'>
				<TextArea placeholder='Description' autoSize={{ minRows: 2, maxRows: 2 }} />
			</Form.Item>
			<Space size='large'>
				<Form.Item
					label='Internal managers and producers'
					extra={`The internal team can see the client\'s prices and the project's profit`}
				>
					<Select placeholder='Select a person' />
				</Form.Item>
				<Form.Item
					label='Line producers and externals'
					extra={`Freelancers and externals NEVER see the client's prices and the project's profit`}
				>
					<Select placeholder='Select a person' />
				</Form.Item>
			</Space>
			{/* </Form> */}
		</>
	);
};
