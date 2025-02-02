import React from 'react';
import { Form, Input, Select, Flex, Row, Col } from 'antd';
import { Uploader } from './Uploader';
import { LabelWithAdd } from './LabelWithAdd';
import { usePersonModal } from './hooks/usePersonModal';
import { Details, Person } from '@/types/brief';
import { useGuidance } from '@/context/Guidance';

const { TextArea } = Input;

export const InitialParameters: React.FC = () => {
	const { handleFocus } = useGuidance();
	const form = Form.useFormInstance<Details>();
	const addInternalPerson = (user: Person) => {
		const currentValues: Details = form.getFieldsValue();
		form.setFieldsValue({
			...currentValues,
			options: {
				...(currentValues.options ?? {}),
				internal: [...(currentValues.options?.internal ?? []), user],
			},
		});
	};

	const addExternalPerson = (user: Person) => {
		const currentValues: Details = form.getFieldsValue();
		form.setFieldsValue({
			...currentValues,
			options: {
				...(currentValues.options ?? {}),
				external: [...(currentValues.options?.external ?? []), user],
			},
		});
	};
	const { showModal: showInternalModal, modal: internalModal } = usePersonModal(addInternalPerson);
	const { showModal: showExternalModal, modal: externalModal } = usePersonModal(addExternalPerson);
	const options = Form.useWatch('options', form);

	const internalOptions = options?.internal?.map((person: Person) => ({
		label: `${person.firstName} ${person.surname}`,
		value: person.email,
	}));

	const externalOptions = options?.external?.map((person: Person) => ({
		label: `${person.firstName} ${person.surname}`,
		value: person.email,
	}));

	return (
		<>
			{externalModal}
			{internalModal}
			<Form.Item name='options' hidden />
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
						<Input placeholder='CRM ID | Link' onFocus={handleFocus('crmId')} />
					</Form.Item>
					<Form.Item
						name='estimationTemplate'
						label='Choose the Estimation Template'
						extra='Select one of your templates.'
						style={{
							flex: 1,
						}}
					>
						<Select placeholder='Select an option' onFocus={handleFocus('estimationTemplate')} disabled />
					</Form.Item>
				</Flex>
			</Flex>
			<Form.Item
				name='projectName'
				label='Project Name'
				extra='A project name is required and recommended to be unique.'
				rules={[{ required: true, message: 'Please input your project name!' }]}
			>
				<Input placeholder='Project name' onFocus={handleFocus('projectName')} />
			</Form.Item>
			<Form.Item
				name='description'
				label='Description'
				extra='Set a description to the project if needed. Visible by your team only'
			>
				<TextArea
					placeholder='Description'
					onFocus={handleFocus('description')}
					autoSize={{ minRows: 2, maxRows: 2 }}
				/>
			</Form.Item>
			<Row>
				<Col span={12}>
					<Form.Item
						name='internalManagersAndProducers'
						label={<LabelWithAdd text='Internal managers and producers' onClick={showInternalModal} />}
						extra={`The internal team can see the client\'s prices and the project's profit`}
						style={{ marginRight: '10px' }}
					>
						<Select
							placeholder='Select a person'
							onFocus={handleFocus('internalManagersAndProducers')}
							options={internalOptions}
						/>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						name='lineProducersAndExternals'
						label={<LabelWithAdd text='Line producers and externals' onClick={showExternalModal} />}
						extra={`Freelancers and externals NEVER see the client's prices and the project's profit`}
						style={{ marginLeft: '10px' }}
					>
						<Select
							placeholder='Select a person'
							onFocus={handleFocus('lineProducersAndExternals')}
							options={externalOptions}
						/>
					</Form.Item>
				</Col>
			</Row>
		</>
	);
};
