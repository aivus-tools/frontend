import React from 'react';
import { Form, Input, Select, Flex, Row, Col, Typography } from 'antd';
import { Uploader } from './Uploader';
import { LabelWithAdd } from './LabelWithAdd';
import { usePersonModal } from '../hooks/usePersonModal';
import { Person } from '@/types/brief.interface';
import { ProjectFormData } from '@/hooks/useMutateProject';
import { useGuidance } from '@/context/GuidanceProvider';
import RemoveIcon from '@/icons/minus.svg';
import { IconButton } from '../common/styled';
import { t } from '@/lib/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectIsNewBrief } from '@/store/slices/project';
import { useGetTemplatesQuery } from '@/services/client/templatesApi';

const { TextArea } = Input;

interface InitialParametersProps {
  thumbnailUrl?: string | null;
}

export const InitialParameters: React.FC<InitialParametersProps> = ({ thumbnailUrl }) => {
  const isNewProject = useAppSelector(selectIsNewBrief);
  const { handleFocus } = useGuidance();
  const form = Form.useFormInstance<ProjectFormData>();
  const { data: templates = [] } = useGetTemplatesQuery();

  const templateOptions = templates.map((tmpl) => ({
    label: tmpl.name,
    value: tmpl.id,
  }));

  const addPerson = (user: Person) => {
    const currentCollaborators = form.getFieldValue('collaborators') || [];
    form.setFieldsValue({
      collaborators: [
        ...currentCollaborators,
        {
          name: `${user.firstName} ${user.surname}`.trim(),
          email: user.email,
          role: user.role || 'internal_user',
        },
      ],
    });
  };

  const { showModal, modal } = usePersonModal(addPerson);

  return (
    <>
      {modal}
      <Flex gap={30} style={{ width: '100%' }}>
        <Form.Item name='previewImage' valuePropName='image' style={{ width: 'auto' }}>
          <Uploader thumbnailUrl={thumbnailUrl} />
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
            label={t('CHOOSE_TEMPLATE')}
            extra={t('SELECT_TEMPLATE_HINT')}
            style={{
              flex: 1,
            }}
          >
            <Select
              placeholder={t('SELECT_OPTION')}
              onFocus={handleFocus('estimationTemplate')}
              options={templateOptions}
              allowClear
              notFoundContent={t('NO_TEMPLATES')}
            />
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
      {!isNewProject && (
        <Row gutter={20}>
          <Col span={12}>
            <Form.List name='collaborators'>
              {(fields, { remove }) => (
                <Form.Item label={<LabelWithAdd text={t('COLLABORATORS')} onClick={() => showModal()} />}>
                  {fields.length === 0 && (
                    <Typography.Text type='secondary'>{t('EMPTY')}</Typography.Text>
                  )}
                  {fields.map((field) => {
                    const collaborators = form.getFieldValue('collaborators') || [];
                    const collaborator = collaborators[field.name];
                    const displayName = collaborator?.name || collaborator?.email || '';
                    const displayEmail = collaborator?.email && collaborator?.name ? ` (${collaborator.email})` : '';

                    return (
                      <Flex gap={12} key={field.key} align='center' style={{ marginBottom: 8 }}>
                        <Typography.Text style={{ flex: 1 }}>
                          {displayName}{displayEmail}
                        </Typography.Text>
                        <IconButton onClick={() => remove(field.name)}>
                          <RemoveIcon color={'var(--gray-light)'} />
                        </IconButton>
                      </Flex>
                    );
                  })}
                </Form.Item>
              )}
            </Form.List>
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
      )}
    </>
  );
};
