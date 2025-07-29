import React, { useRef } from 'react';
import { Form, Input, Select, Flex, Row, Col, Typography } from 'antd';
import { Uploader } from './Uploader';
import { LabelWithAdd } from './LabelWithAdd';
import { usePersonModal } from '../hooks/usePersonModal';
import { Details, Person } from '@/types/brief.interface';
import { useGuidance } from '@/context/Guidance';
import RemoveIcon from '@/icons/minus.svg';
import { AntdListWrapper, IconButton } from '../common/styled';

const { TextArea } = Input;

export const InitialParameters: React.FC = () => {
  const addPersonEmptyRow = useRef<() => void>(() => {});
  const { handleFocus } = useGuidance();
  const form = Form.useFormInstance<Details>();
  const addPerson = (user: Person) => {
    const currentValues: Person[] = form.getFieldValue(['options', 'collaborators']) ?? [];
    form.setFieldValue(['options', 'collaborators'], [...currentValues, user]);
  };

  const { showModal, modal } = usePersonModal(addPerson);
  const options = Form.useWatch('options', form);
  const collaborators = Form.useWatch('collaborators', form);

  const internalOptions = options?.collaborators
    ?.map((person: Person) => ({
      label: `${person.firstName} ${person.surname}`,
      value: person.email,
    }))
    .filter((option) => !collaborators.some((collaborator) => collaborator === option.value));

  return (
    <>
      {modal}
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
      <Row gutter={20}>
        <Col span={12}>
          <AntdListWrapper>
            <Form.List name='collaborators'>
              {(fields, { add, remove }) => {
                addPersonEmptyRow.current = () => {
                  add();
                };
                return (
                  <Form.Item label={<LabelWithAdd text='Collaborators' onClick={() => showModal()} />}>
                    {fields.map((field, index) => (
                      <Flex gap={20} key={field.key}>
                        <Form.Item noStyle name={field.name}>
                          <Select
                            placeholder='Select a person'
                            onFocus={handleFocus('collaborators')}
                            options={internalOptions}
                          />
                        </Form.Item>
                        {fields.length > 1 && fields.length - 1 !== index && (
                          <Form.Item noStyle>
                            <IconButton
                              onClick={() => {
                                if (fields.length > 1) remove(field.name);
                              }}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Form.Item>
                        )}
                      </Flex>
                    ))}
                  </Form.Item>
                );
              }}
            </Form.List>
          </AntdListWrapper>
        </Col>
        <Col span={12}>
          <Typography.Text>
            <b>Add internal managers.</b> They can only view the projects they are invited to and have access to client
            pricing and profit details.
          </Typography.Text>
          <br />
          <Typography.Text>
            <b>Or add freelancers and external producers.</b> They NEVER see client pricing or project profit. They can
            only edit internal costs and expenses to help manage the project.
          </Typography.Text>
        </Col>
      </Row>
    </>
  );
};
