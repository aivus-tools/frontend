'use client';

import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Button, App, Spin } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import {
  useGetVendorSettingsQuery,
  useUpdateVendorSettingsMutation,
  useUploadVendorLogoMutation,
} from '@/services/client/vendorSettingsApi';

interface VendorSettingsFormValues {
  companyName: string;
  agencyName: string;
  fringesPercent: string;
  handlingPercent: string;
  markupPercent: string;
  productionInsurancePercent: string;
  productionFeePercent: string;
  postMarkupPercent: string;
  postInsurancePercent: string;
  postTaxPercent: string;
}

export const VendorSettingsSection: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<VendorSettingsFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useGetVendorSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateVendorSettingsMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadVendorLogoMutation();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        companyName: settings.companyName || '',
        agencyName: settings.agencyName || '',
        fringesPercent: settings.fringesPercent || '0',
        handlingPercent: settings.handlingPercent || '0',
        markupPercent: settings.markupPercent || '0',
        productionInsurancePercent: settings.productionInsurancePercent || '0',
        productionFeePercent: settings.productionFeePercent || '0',
        postMarkupPercent: settings.postMarkupPercent || '0',
        postInsurancePercent: settings.postInsurancePercent || '0',
        postTaxPercent: settings.postTaxPercent || '0',
      });
    }
  }, [settings, form]);

  const handleSubmit = async (values: VendorSettingsFormValues) => {
    try {
      await updateSettings(values).unwrap();
      message.success('Company settings saved');
    } catch {
      message.error('Failed to save settings');
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      await uploadLogo(formData).unwrap();
      message.success('Logo uploaded');
    } catch {
      message.error('Failed to upload logo');
    }
  };

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Company Settings</h3>

      <div style={{ marginBottom: 24 }}>
        <div
          onClick={handleLogoClick}
          style={{
            width: 120,
            height: 120,
            border: '2px dashed #d9d9d9',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              {isUploadingLogo ? <Spin size="small" /> : <CameraOutlined style={{ fontSize: 24 }} />}
              <div style={{ fontSize: 12, marginTop: 4 }}>Upload Logo</div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleLogoChange}
        />
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="companyName" label="Company Name" style={{ flex: 1 }}>
            <Input placeholder="Your company name" size="large" />
          </Form.Item>
          <Form.Item name="agencyName" label="Default Agency" style={{ flex: 1 }}>
            <Input placeholder="Default agency for new projects" size="large" />
          </Form.Item>
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 16, marginBottom: 12 }}>
          Default Production Percentages
        </h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Form.Item name="fringesPercent" label="Fringes %" style={{ width: 120 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="handlingPercent" label="Handling %" style={{ width: 120 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="markupPercent" label="Markup %" style={{ width: 120 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="productionInsurancePercent" label="Prod Insurance %" style={{ width: 140 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="productionFeePercent" label="Prod Fee %" style={{ width: 120 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 8, marginBottom: 12 }}>
          Default Post-Production Percentages
        </h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Form.Item name="postMarkupPercent" label="Post Markup %" style={{ width: 140 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="postInsurancePercent" label="Post Insurance %" style={{ width: 140 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="postTaxPercent" label="Post Tax %" style={{ width: 120 }}>
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={isUpdating} size="large" style={{ marginTop: 8 }}>
          Save Company Settings
        </Button>
      </Form>
    </div>
  );
};
