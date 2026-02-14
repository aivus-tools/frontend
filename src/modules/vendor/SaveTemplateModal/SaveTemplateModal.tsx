'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, App } from 'antd';
import { t } from '@/lib/i18n';
import { useCreateTemplateMutation } from '@/services/client/templatesApi';

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  offerId: string;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  open,
  onClose,
  offerId,
}) => {
  const { message } = App.useApp();
  const [name, setName] = useState('');
  const [createTemplate, { isLoading }] = useCreateTemplateMutation();

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await createTemplate({
        name: name.trim(),
        offerId,
      }).unwrap();
      message.success(t('TEMPLATE_SAVED'));
      setName('');
      onClose();
    } catch {
      message.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <Modal
      title={t('SAVE_AS_TEMPLATE')}
      open={open}
      onCancel={handleCancel}
      width={420}
      centered
      footer={null}
    >
      <div style={{ marginTop: 16 }}>
        <label
          style={{
            display: 'block',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: '#4B5675',
            marginBottom: 6,
          }}
        >
          {t('TEMPLATE_NAME')}
        </label>
        <Input
          placeholder={t('TEMPLATE_NAME_PLACEHOLDER')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleSave}
          style={{
            height: 40,
            borderRadius: 6,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 14,
          }}
          autoFocus
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 24,
        }}
      >
        <Button onClick={handleCancel}>{t('CANCEL')}</Button>
        <Button
          type="primary"
          onClick={handleSave}
          loading={isLoading}
          disabled={!name.trim()}
        >
          {t('SAVE')}
        </Button>
      </div>
    </Modal>
  );
};
