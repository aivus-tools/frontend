import React from 'react';
import { Form, Input, Flex, Col, Row } from 'antd';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import { IconButton } from '../common/styled';
import { useGuidance } from '@/context/Guidance';

export const Client: React.FC = () => {
  const { handleFocus } = useGuidance();
  return (
    <>
      <Flex gap={20} flex={1} style={{ width: '100%' }}>
        <Form.Item
          name='clientName'
          label='Client'
          extra='A name of the client is required and recommended to be unique.'
          style={{
            flex: '1 1 60%',
          }}
        >
          <Input placeholder='Client' onFocus={handleFocus('clientName')} />
        </Form.Item>
        <Form.Item
          name='irsEin'
          label='IRS EIN'
          extra='Taxpayer Id'
          style={{
            flex: '1 1 40%',
          }}
        >
          <Input placeholder='IRS EIN' onFocus={handleFocus('irsEin')} />
        </Form.Item>
      </Flex>
      <Form.Item name='brandName' label='Brand name' extra='Specify the specific brand within your company, if needed.'>
        <Input placeholder='Brand name' onFocus={handleFocus('brandName')} />
      </Form.Item>
      <Form.List name='managers'>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => {
              const isFirst = index === 0;
              const isLast = index === fields.length - 1;
              const managerLabel = isFirst ? <LabelWithAdd text='Client’s managers' onClick={() => add()} /> : null;
              const positionProps = isFirst
                ? {
                    label: 'Manager position',
                  }
                : {};
              const extra = isLast ? 'Indicate the project managers responsible.' : null;

              return (
                <Row key={field.key}>
                  <Col span={14}>
                    <Flex gap={10} style={{ marginRight: '20px' }}>
                      <Form.Item name={[field.name, 'manager']} label={managerLabel} extra={extra} style={{ flex: 1 }}>
                        <Input placeholder='' onFocus={handleFocus('manager')} />
                      </Form.Item>
                      <Form.Item label={isFirst ? ' ' : null}>
                        <IconButton
                          onClick={() => {
                            if (fields.length > 1) remove(field.name);
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Form.Item>
                    </Flex>
                  </Col>
                  <Col span={10}>
                    <Form.Item name={[field.name, 'position']} {...positionProps}>
                      <Input placeholder='' onFocus={handleFocus('manager_position')} />
                    </Form.Item>
                  </Col>
                </Row>
              );
            })}
          </>
        )}
      </Form.List>
    </>
  );
};
