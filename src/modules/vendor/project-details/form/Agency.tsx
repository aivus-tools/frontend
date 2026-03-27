import React from 'react';
import { Form, Input, Flex, Typography } from 'antd';
import { LabelWithAdd } from './LabelWithAdd';
import { usePersonModal } from '../hooks/usePersonModal';
import { Person } from '@/types/brief.interface';
import { ProjectFormData } from '@/hooks/useMutateProject';
import { useGuidance } from '@/context/GuidanceProvider';
import RemoveIcon from '@/icons/minus.svg';
import { IconButton } from '../common/styled';
import { t } from '@/lib/i18n';

export const Agency: React.FC = () => {
  const { handleFocus } = useGuidance();
  const form = Form.useFormInstance<ProjectFormData>();
  const allCollaborators = Form.useWatch('collaborators', form) || [];

  const agencyProducers = allCollaborators
    .map((x, i) => ({ collaborator: x, originalIndex: i }))
    .filter(x => x.collaborator.role === 'agency_producer');

  const addAgencyProducer = (user: Person) => {
    const current = form.getFieldValue('collaborators') || [];
    form.setFieldsValue({
      collaborators: [
        ...current,
        {
          name: `${user.firstName} ${user.surname}`.trim(),
          email: user.email,
          role: 'agency_producer' as const,
        },
      ],
    });
  };

  const removeAgencyProducer = (originalIndex: number) => {
    const current = form.getFieldValue('collaborators') || [];
    const updated = current.filter((_: unknown, i: number) => i !== originalIndex);
    form.setFieldsValue({ collaborators: updated });
  };

  const { showModal, modal } = usePersonModal(addAgencyProducer);

  return (
    <>
      {modal}
      <Form.Item
        name='agencyName'
        label={t('AGENCY_NAME')}
        extra={t('AGENCY_ASSOCIATED')}
        style={{ width: '100%' }}
      >
        <Input placeholder={t('AGENCY_NAME')} onFocus={handleFocus('agencyName')} />
      </Form.Item>
      <Form.Item label={<LabelWithAdd text={t('AGENCY_PRODUCERS')} onClick={() => showModal()} />}>
        {agencyProducers.length === 0 && (
          <Typography.Text type='secondary'>{t('EMPTY')}</Typography.Text>
        )}
        {agencyProducers.map(x => {
          const displayName = x.collaborator.name || x.collaborator.email || '';
          const displayEmail = x.collaborator.email && x.collaborator.name ? ` (${x.collaborator.email})` : '';
          return (
            <Flex gap={12} key={x.originalIndex} align='center' style={{ marginBottom: 8 }}>
              <Typography.Text style={{ flex: 1 }}>
                {displayName}{displayEmail}
              </Typography.Text>
              <IconButton onClick={() => removeAgencyProducer(x.originalIndex)}>
                <RemoveIcon color={'var(--gray-light)'} />
              </IconButton>
            </Flex>
          );
        })}
      </Form.Item>
    </>
  );
};
