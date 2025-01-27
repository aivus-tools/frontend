import React from 'react';
import { Form, Input, Flex, InputNumber, Typography } from 'antd';
import { ExtraMaterials } from './ExtraMaterials';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import { IconButton, AntdListWrapper } from './styled';
import { LabelWithSide } from './LabelWithButton';

import EyeCrossed from '@/icons/eye-crossed.svg';
import Eye from '@/icons/eye.svg';
import { Details } from '@/types/brief';

const { TextArea } = Input;

export const Brief: React.FC = () => {
	const form = Form.useFormInstance<Details>();
	const visibleForVendors = Form.useWatch('visibleForVendors', form);

	return (
		<>
			<Form.Item
				name='projectDescription'
				label='Project Description'
				extra='Give more details about your project (Objectives, Audience, Tone and Style, Key Messages, Preferred Deadline)'
			>
				<TextArea
					autoSize={{ minRows: 6, maxRows: 6 }}
					placeholder={`Objectives,\nAudience,\nTone and Style,\nKey Messages,\nPreferred Deadline\n`}
				/>
			</Form.Item>
			<AntdListWrapper>
				<Form.List name='referenceVideos' initialValue={[{ url: '', comment: '' }]}>
					{(fields, { add, remove }) => (
						<Form.Item
							label={<LabelWithAdd text='Reference video' onClick={() => add()} />}
							extra='Add links to relevant videos.'
							rules={[{ required: true, message: 'At least one reference video is required' }]}
						>
							{fields.map((field) => (
								<Flex gap={20} key={field.key}>
									<Form.Item
										noStyle
										name={[field.name, 'url']}
										rules={[{ type: 'url', warningOnly: true, message: 'Invalid URL' }]}
									>
										<Input placeholder='url only' />
									</Form.Item>
									<Form.Item noStyle name={[field.name, 'comment']}>
										<Input placeholder='Comment' />
									</Form.Item>
									<Form.Item noStyle>
										<IconButton
											onClick={() => {
												if (fields.length > 1) remove(field.name);
											}}
										>
											<RemoveIcon />
										</IconButton>
									</Form.Item>
								</Flex>
							))}
						</Form.Item>
					)}
				</Form.List>
			</AntdListWrapper>
			<Flex gap={20}>
				<Form.Item
					name='budget'
					className='budget'
					labelCol={{ span: 24, flex: '1 1 100%' }}
					label={
						<LabelWithSide text='Client’s Budget (US$)'>
							<Form.Item name='visibleForVendors' noStyle>
								{visibleForVendors ? <Eye /> : <EyeCrossed />}
								<Typography.Text
									onClick={(e) => {
										e.preventDefault();
										form.setFieldsValue({ visibleForVendors: !visibleForVendors });
									}}
									style={{
										marginLeft: '10px',
										color: 'var(--main)',
									}}
								>
									Visible for vendors
								</Typography.Text>
							</Form.Item>
						</LabelWithSide>
					}
					extra='We will do our best to recommend creatives in your budget range'
					rules={[{ required: true, message: 'Please input your budget!' }]}
				>
					<InputNumber
						formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						placeholder='Number only'
						suffix='$'
						controls={false}
						style={{ width: '100%' }}
					/>
				</Form.Item>
				<Form.Item name='extraMaterials' label='Extra materials'>
					<ExtraMaterials />
				</Form.Item>
			</Flex>
		</>
	);
};
