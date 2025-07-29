import React, { useState } from 'react';
import { Button, Col, Flex, Form, Input, Modal, Row, Select, Typography } from 'antd';
import { styled } from 'styled-components';
import { Person } from '@/types/brief.interface';

const Text = styled(Typography.Text)`
  font-size: 10px !important;
  font-weight: 500 !important;
  line-height: 12.19px !important;

  margin-top: 36px;
  vertical-align: bottom;
`;

interface OnSubmit {
  (person: Person): void;
}

export const usePersonModal = (onSubmit?: OnSubmit) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = (values: Person) => {
    setIsModalOpen(false);
    onSubmit?.(values);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const modal = (
    <Modal width={760} open={isModalOpen} destroyOnClose onCancel={handleCancel} footer={null}>
      <Form<Person> layout='vertical' onFinish={handleOk}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='email' label='Email' rules={[{ required: true }, { type: 'email' }]}>
              <Input placeholder='Email*' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='position' label='Position'>
              <Input placeholder='Producer, Project Manager etc.' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='firstName' label='First name' rules={[{ required: true }]}>
              <Input placeholder='First name*' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='surname' label='Surname' rules={[{ required: true }]}>
              <Input placeholder='Surname*' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='role' label='Role' rules={[{ required: true }]}>
              <Select
                placeholder='Select a role'
                options={[
                  { label: 'Admin', value: 'admin' },
                  { label: 'Internal User', value: 'internal_user' },
                  { label: 'External User', value: 'external_user' },
                ]}
              />
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
