import React from 'react';
import { Form, Input, Flex, Col, Row } from 'antd';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import { IconButton } from '../common/styled';
import { useGuidance } from '@/context/GuidanceProvider';
import { t } from '@/lib/i18n';

export const Client: React.FC = () => {
  const { handleFocus } = useGuidance();
  return (
    <>
      <Flex gap={20} flex={1} style={{ width: '100%' }}>
        <Form.Item
          name='clientName'
          label={t('CLIENT')}
          extra={t('CLIENT_NAME_REQUIRED')}
          style={{
            flex: '1 1 60%',
          }}
        >
          <Input placeholder={t('CLIENT')} onFocus={handleFocus('clientName')} />
        </Form.Item>
        <Form.Item
          name='irsEin'
          label={t('IRS_EIN')}
          extra={t('TAXPAYER_ID')}
          style={{
            flex: '1 1 40%',
          }}
        >
          <Input placeholder={t('IRS_EIN')} onFocus={handleFocus('irsEin')} />
        </Form.Item>
      </Flex>
      <Form.Item name='brandName' label={t('BRAND_NAME')} extra={t('SPECIFY_BRAND_WITHIN_COMPANY')}>
        <Input placeholder={t('BRAND_NAME')} onFocus={handleFocus('brandName')} />
      </Form.Item>
      <Form.List name='managers'>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => {
              const isFirst = index === 0;
              const isLast = index === fields.length - 1;
              const managerLabel = isFirst ? <LabelWithAdd text={t('CLIENTS_MANAGERS')} onClick={() => add()} /> : null;
              const positionProps = isFirst
                ? {
                    label: t('MANAGER_POSITION'),
                  }
                : {};
              const extra = isLast ? t('INDICATE_PROJECT_MANAGERS') : null;

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
