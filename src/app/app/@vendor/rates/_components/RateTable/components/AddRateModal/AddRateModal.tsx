'use client';

import React from 'react';
import { Modal, Input, InputNumber, Button, Form, message } from 'antd';
import { t } from '@/lib/i18n';
import { useCreateRateMutation } from '@/services/client/ratesApi';

interface AddRateModalProps {
  open: boolean;
  onClose: () => void;
}

interface RateFormData {
  name: string;
  basePrice: number;
  description?: string;
  unit?: string;
}

export const AddRateModal: React.FC<AddRateModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<RateFormData>();
  const [createRate, { isLoading }] = useCreateRateMutation();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await createRate({
        name: values.name,
        basePrice: values.basePrice,
        description: values.description,
      }).unwrap();
      message.success(t('RATE_SAVED'));
      form.resetFields();
      onClose();
    } catch {
      // validation error or API error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('ADD_RATE_CARD')}
      open={open}
      onCancel={handleCancel}
      width={480}
      centered
      footer={null}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label={t('RATE_CARD_NAME')}
          rules={[{ required: true, message: t('RATE_CARD_NAME_PLACEHOLDER') }]}
        >
          <Input
            placeholder={t('RATE_CARD_NAME_PLACEHOLDER')}
            style={{ height: 40, borderRadius: 6 }}
            autoFocus
          />
        </Form.Item>
        <Form.Item
          name="basePrice"
          label={t('BASE_PRICE')}
          rules={[{ required: true, message: t('BASE_PRICE') }]}
        >
          <InputNumber
            placeholder="0.00"
            style={{ width: '100%', height: 40, borderRadius: 6 }}
            min={0}
            precision={2}
          />
        </Form.Item>
        <Form.Item name="description" label={t('DESCRIPTION')}>
          <Input.TextArea
            placeholder={t('DESCRIPTION')}
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ borderRadius: 6 }}
          />
        </Form.Item>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <Button onClick={handleCancel}>{t('CANCEL')}</Button>
        <Button type="primary" onClick={handleSave} loading={isLoading}>
          {t('SAVE')}
        </Button>
      </div>
    </Modal>
  );
};
