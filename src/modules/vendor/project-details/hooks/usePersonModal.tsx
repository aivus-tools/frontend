import React, { useState } from 'react';
import { Button, Col, Flex, Form, Input, Modal, Row, Typography } from 'antd';
import styled from 'styled-components';

const Text = styled(Typography.Text)`
	font-size: 10px !important;
	font-weight: 500 !important;
	line-height: 12.19px !important;

	margin-top: 36px;
	vertical-align: bottom;
`;

export interface Person {
	firstName: string;
	surname: string;
	email: string;
	position: string;
	role: string;
	description: string;
}

export const usePersonModal = (onSubmit?: (person: Person) => void) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = (values: unknown) => {
		setIsModalOpen(false);
		onSubmit?.(values as Person);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const modal = (
		<Modal width={760} open={isModalOpen} onOk={handleOk} destroyOnClose onCancel={handleCancel} footer={null}>
			<Form layout='vertical' onFinish={handleOk}>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name='firstName' label='First name' rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name='surname' label='Surname' rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name='email' label='Email' rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name='position' label='Position' rules={[{ required: true }]}>
							<Input placeholder='Producer, Project Manager etc.' />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name='role' label='Role' rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Flex vertical>
							<Text type='secondary'>
								Depending on the Role, the user will see or not see certain information. Choose one to find out.
							</Text>
						</Flex>
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						<Form.Item name='description' label='Description'>
							<Input />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item>
					<Button type='primary' htmlType='submit'>
						Add user
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);

	return { modal, showModal };
};
