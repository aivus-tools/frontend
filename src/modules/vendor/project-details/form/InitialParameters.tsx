import { Form, Input, Select, Flex, Row, Col, Typography } from 'antd';
import { Uploader } from './Uploader';
import { LabelWithAdd } from './LabelWithAdd';
import { usePersonModal } from '../hooks/usePersonModal';
import { Person } from '@/types/brief.interface';
import { ProjectFormData } from '@/hooks/useMutateProject';
import { useGuidance } from '@/context/GuidanceProvider';
import RemoveIcon from '@/icons/minus.svg';
import commonStyles from '../common/common.module.css';
import { t } from '@/lib/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectIsNewBrief } from '@/store/slices/project';
import { useGetTemplatesQuery } from '@/services/client/templatesApi';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const { TextArea } = Input;

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  internal_user: 'Internal User',
  external_user: 'External User',
  producer: 'Producer',
  agency_producer: 'Agency Producer',
};

interface InitialParametersProps {
  thumbnailUrl?: string | null;
}

export const InitialParameters = (props: InitialParametersProps) => {
  const thumbnailUrl = props.thumbnailUrl;
  const isNewProject = useAppSelector(selectIsNewBrief);
  const { handleFocus } = useGuidance();
  const form = Form.useFormInstance<ProjectFormData>();
  const { data: templates = [] } = useGetTemplatesQuery();
  const { isMobile } = useBreakpoint();

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
      <Flex gap={isMobile ? 16 : 30} style={{ width: '100%' }} vertical={isMobile}>
        <Form.Item name='previewImage' valuePropName='image' style={{ width: 'auto' }}>
          <Uploader thumbnailUrl={thumbnailUrl} />
        </Form.Item>
        <Flex gap={isMobile ? 0 : 20} flex={1} vertical={isMobile}>
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
      <Form.List name='collaborators'>
        {(fields, { remove }) => {
          if (isNewProject) {
            return null;
          }
          const collaborators = form.getFieldValue('collaborators') || [];
          const visibleCount = fields.filter((x) => collaborators[x.name]?.role !== 'agency_producer').length;
          return (
            <Row gutter={20}>
              <Col xs={24} sm={12}>
                <Form.Item label={<LabelWithAdd text={t('COLLABORATORS')} onClick={() => showModal()} />}>
                  {visibleCount === 0 && <Typography.Text type='secondary'>{t('EMPTY')}</Typography.Text>}
                  {fields.map((field) => {
                    const collaborator = collaborators[field.name];
                    if (collaborator?.role === 'agency_producer') {
                      return null;
                    }
                    const displayName = collaborator?.name || collaborator?.email || '';
                    const displayEmail = collaborator?.email && collaborator?.name ? ` (${collaborator.email})` : '';
                    const roleLabel = ROLE_LABELS[collaborator?.role] || collaborator?.role || '';

                    return (
                      <Flex gap={12} key={field.key} align='center' style={{ marginBottom: 8 }}>
                        <Typography.Text style={{ flex: 1 }}>
                          {displayName}
                          {roleLabel ? <Typography.Text type='secondary'> - {roleLabel}</Typography.Text> : null}
                          {displayEmail}
                        </Typography.Text>
                        <div className={commonStyles.iconButton} onClick={() => remove(field.name)}>
                          <RemoveIcon color={'var(--gray-light)'} />
                        </div>
                      </Flex>
                    );
                  })}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Typography.Text>
                  <b>{t('ADD_INTERNAL_MANAGERS')}</b> {t('INTERNAL_MANAGERS_DESCRIPTION')}
                </Typography.Text>
                <br />
                <Typography.Text>
                  <b>{t('ADD_FREELANCERS')}</b> {t('FREELANCERS_DESCRIPTION')}
                </Typography.Text>
              </Col>
            </Row>
          );
        }}
      </Form.List>
    </>
  );
};
