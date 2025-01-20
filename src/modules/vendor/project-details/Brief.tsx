import React from 'react';
import { Form, Input, Flex, InputNumber } from 'antd';
import { ExtraMaterials } from './ExtraMaterials';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import { IconButton, AntdListWrapper } from './styled';

const { TextArea } = Input;

export const Brief: React.FC = () => {
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
							label={<LabelWithAdd text='Reference video *' onClick={() => add()} />}
							extra='Add links to relevant videos.'
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
					label='Your Budget (US$)*'
					extra='We will do our best to recommend creatives in your budget range'
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
