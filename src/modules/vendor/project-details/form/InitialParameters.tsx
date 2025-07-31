import React, { useRef } from 'react';
import { Form, Input, Select, Flex, Row, Col, Typography } from 'antd';
import { Uploader } from './Uploader';
import { LabelWithAdd } from './LabelWithAdd';
import { usePersonModal } from '../hooks/usePersonModal';
import { Details, Person } from '@/types/brief.interface';
import { useGuidance } from '@/context/GuidanceProvider';
import RemoveIcon from '@/icons/minus.svg';
import { AntdListWrapper, IconButton } from '../common/styled';
import { t } from '@/lib/i18n';

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
            label={t('CRM_ID_LINK')}
            extra={t('SET_OWN_ID')}
            style={{
              flex: 1,
            }}
          >
            <Input placeholder={t('CRM_ID_LINK')} onFocus={handleFocus('crmId')} />
          </Form.Item>
          <Form.Item
            name='estimationTemplate'
            label={t('CHOOSE_ESTIMATION_TEMPLATE')}
            extra={t('SELECT_TEMPLATE')}
            style={{
              flex: 1,
            }}
          >
            <Select placeholder={t('SELECT_OPTION')} onFocus={handleFocus('estimationTemplate')} disabled />
          </Form.Item>
        </Flex>
      </Flex>
      <Form.Item
        name='projectName'
        label={t('PROJECT_NAME')}
        extra={t('PROJECT_NAME_REQUIRED')}
        rules={[{ required: true, message: t('PLEASE_INPUT_PROJECT_NAME') }]}
      >
        <Input placeholder={t('PROJECT_NAME_PLACEHOLDER')} onFocus={handleFocus('projectName')} />
      </Form.Item>
      <Form.Item name='description' label={t('DESCRIPTION')} extra={t('SET_DESCRIPTION')}>
        <TextArea
          placeholder={t('DESCRIPTION')}
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
                  <Form.Item label={<LabelWithAdd text={t('COLLABORATORS')} onClick={() => showModal()} />}>
                    {fields.map((field, index) => (
                      <Flex gap={20} key={field.key}>
                        <Form.Item noStyle name={field.name}>
                          <Select
                            placeholder={t('SELECT_PERSON')}
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
            <b>{t('ADD_INTERNAL_MANAGERS')}</b> {t('INTERNAL_MANAGERS_DESCRIPTION')}
          </Typography.Text>
          <br />
          <Typography.Text>
            <b>{t('ADD_FREELANCERS')}</b> {t('FREELANCERS_DESCRIPTION')}
          </Typography.Text>
        </Col>
      </Row>
    </>
  );
};
