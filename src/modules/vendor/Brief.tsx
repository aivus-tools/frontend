import React from 'react';
import { Form, Input, Flex, InputNumber } from 'antd';
import { ExtraMaterials } from './ExtraMaterials';

const { TextArea } = Input;

export const Brief: React.FC = () => {
	return (
		<>
			<Form.Item
				label='Project Description'
				extra='Give more details about your project (Objectives, Audience, Tone and Style, Key Messages, Preferred Deadline)'
			>
				<TextArea
					autoSize={{ minRows: 6, maxRows: 6 }}
					placeholder={`Objectives,\nAudience,\nTone and Style,\nKey Messages,\nPreferred Deadline\n`}
				/>
			</Form.Item>
			<Form.Item label='Reference video' extra='Add links to relevant videos.'>
				<Flex gap={20}>
					<Input placeholder='url only' />
					<Input placeholder='Comment' />
				</Flex>
			</Form.Item>
			<Flex gap={20}>
				<Form.Item label='Your Budget (US$)* ' extra='We will do our best to recommend creatives in your budget range'>
					<InputNumber placeholder='Number only' suffix='$' controls={false} style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item label='Extra materials'>
					<ExtraMaterials />
				</Form.Item>
			</Flex>
		</>
	);
};
