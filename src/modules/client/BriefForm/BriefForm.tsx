'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Switch, Upload, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';
import { useCreateBriefMutation } from '@/services/client/briefApi';
import { Details } from '@/types/brief.interface';
import { AppRoute } from '@/constants/appRoute';
import {
  FormPageWrapper,
  FormArea,
  FormHeader,
  FormTitle,
  FormSubtitle,
  SectionCard,
  SectionTitle,
  FieldRow,
  FormFooter,
  FooterLeft,
  FooterRight,
  AddMoreButton,
  GuidancePanel,
  GuidanceTitle,
  GuidanceText,
} from './styled';

const { TextArea } = Input;
const { Option } = Select;

interface BriefFormProps {
  initialData?: Partial<Details>;
}

const TERRITORY_OPTIONS = [
  'Worldwide',
  'United States',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa',
  'Canada',
  'United Kingdom',
  'Australia',
];

const TIME_UNIT_OPTIONS = ['Seconds', 'Minutes', 'Hours'];
const TERM_UNIT_OPTIONS = ['Months', 'Years', 'Perpetuity'];

const GUIDANCE_HINTS: Record<string, string> = {
  default: 'CLICK_ON_FIELD_FOR_GUIDANCE',
  projectName: 'PROJECT_NAME_REQUIRED',
  description: 'SET_DESCRIPTION',
  projectDescription: 'PROJECT_DESCRIPTION_EXTRA',
  referenceVideos: 'ADD_LINKS_TO_RELEVANT_VIDEOS',
  budget: 'RECOMMEND_CREATIVES_IN_BUDGET',
  territory: 'SELECT_ALL_COUNTRIES_OR_WORLDWIDE',
  distributionAndAdPlacements: 'SELECT_AT_LEAST_ONE_PLACEMENT',
  term: 'SET_PERIOD_OR_PERPETUITY',
  mainVideoDuration: 'NUMBER_AND_LENGTH_OF_ORIGINAL_VIDEOS',
  cuts: 'ADDITIONAL_VERSIONS_OF_MAIN_VIDEO',
  managers: 'INDICATE_PROJECT_MANAGERS',
  crmId: 'SET_OWN_ID',
  brandName: 'SPECIFY_BRAND_WITHIN_COMPANY',
};

export const BriefForm: React.FC<BriefFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [activeField, setActiveField] = useState('default');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [createBrief, { isLoading: isSaving }] = useCreateBriefMutation();

  const handleFieldFocus = (fieldName: string) => {
    setActiveField(fieldName);
  };

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      const details: Details = {
        crmId: values.crmId || '',
        clientName: values.clientName || '',
        projectName: values.projectName || '',
        description: values.description || '',
        irsEin: values.irsEin || '',
        brandName: values.brandName || '',
        managers: values.managers || [],
        projectDescription: values.projectDescription || '',
        referenceVideos: (values.referenceVideos || []).filter(
          (v: { url: string }) => v.url
        ),
        distributionAndAdPlacements: values.distributionAndAdPlacements || '',
        territory: values.territory || [],
        collaborators: [],
        term: {
          length: values.termLength || '',
          unit: values.termUnit || 'Months',
        },
        mainVideoDuration: {
          number: values.mainVideoNumber || '',
          length: values.mainVideoLength || '',
          timeUnit: values.mainVideoTimeUnit || 'Seconds',
          comment: values.mainVideoComment || '',
        },
        cuts: (values.cuts || []).filter((c: { number: string }) => c.number),
        shootingDays: {
          number: values.shootingDaysNumber || '',
          length: values.shootingDaysLength || '',
          comment: values.shootingDaysComment || '',
          timeUnit: values.shootingDaysTimeUnit || 'Hours',
        },
        estimationTemplate: values.estimationTemplate || '',
        budget: values.budget,
        visibleForVendors: values.visibleForVendors ?? true,
      };

      await createBrief({
        status: 'DRAFT' as Details['visibleForVendors'] extends boolean ? string : never,
        details,
      } as Parameters<typeof createBrief>[0]).unwrap();

      setSavedAt(new Date().toLocaleTimeString());
      message.success(t('BRIEF_SAVED'));
      router.push(AppRoute.DASHBOARD);
    } catch {
      message.error(t('ERROR_SAVING_DETAILS'));
    }
  };

  const handleCancel = () => {
    router.push(AppRoute.DASHBOARD);
  };

  const guidanceKey = GUIDANCE_HINTS[activeField] || GUIDANCE_HINTS['default'];

  return (
    <FormPageWrapper>
      <FormArea>
        <FormHeader>
          <FormTitle>{t('CREATE_BRIEF_TITLE')}</FormTitle>
          <FormSubtitle>{t('BRIEF_FORM_SUBTITLE')}</FormSubtitle>
        </FormHeader>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            projectName: initialData?.projectName || '',
            description: initialData?.description || '',
            clientName: initialData?.clientName || '',
            brandName: initialData?.brandName || '',
            crmId: initialData?.crmId || '',
            irsEin: initialData?.irsEin || '',
            projectDescription: initialData?.projectDescription || '',
            referenceVideos: initialData?.referenceVideos?.length
              ? initialData.referenceVideos
              : [{ url: '', comment: '' }],
            budget: initialData?.budget,
            visibleForVendors: initialData?.visibleForVendors ?? true,
            distributionAndAdPlacements: initialData?.distributionAndAdPlacements || '',
            territory: initialData?.territory || [],
            termLength: initialData?.term?.length || '',
            termUnit: initialData?.term?.unit || 'Months',
            mainVideoNumber: initialData?.mainVideoDuration?.number || '',
            mainVideoLength: initialData?.mainVideoDuration?.length || '',
            mainVideoTimeUnit: initialData?.mainVideoDuration?.timeUnit || 'Seconds',
            mainVideoComment: initialData?.mainVideoDuration?.comment || '',
            cuts: initialData?.cuts?.length
              ? initialData.cuts
              : [{ number: '', length: '', timeUnit: 'Seconds', comment: '' }],
            shootingDaysNumber: initialData?.shootingDays?.number || '',
            shootingDaysLength: initialData?.shootingDays?.length || '',
            shootingDaysComment: initialData?.shootingDays?.comment || '',
            shootingDaysTimeUnit: initialData?.shootingDays?.timeUnit || 'Hours',
            managers: initialData?.managers?.length
              ? initialData.managers
              : [{ manager: '', position: '' }],
            estimationTemplate: initialData?.estimationTemplate || '',
          }}
        >
          {/* INITIAL PARAMETERS */}
          <SectionCard>
            <SectionTitle>{t('INITIAL_PARAMETERS')}</SectionTitle>

            <FieldRow>
              <Form.Item name="crmId" label={t('CRM_ID_LINK')}>
                <Input
                  onFocus={() => handleFieldFocus('crmId')}
                  placeholder={t('SET_OWN_ID')}
                />
              </Form.Item>
              <Form.Item
                name="projectName"
                label={t('PROJECT_NAME')}
                rules={[{ required: true, message: t('PLEASE_INPUT_PROJECT_NAME') }]}
              >
                <Input
                  onFocus={() => handleFieldFocus('projectName')}
                  placeholder={t('PROJECT_NAME_PLACEHOLDER')}
                />
              </Form.Item>
            </FieldRow>

            <FieldRow>
              <Form.Item name="clientName" label={t('CLIENT')}>
                <Input
                  onFocus={() => handleFieldFocus('clientName')}
                  placeholder={t('CLIENT_NAME_REQUIRED')}
                />
              </Form.Item>
              <Form.Item name="brandName" label={t('BRAND_NAME')}>
                <Input
                  onFocus={() => handleFieldFocus('brandName')}
                  placeholder={t('SPECIFY_BRAND_WITHIN_COMPANY')}
                />
              </Form.Item>
            </FieldRow>

            <Form.Item name="description" label={t('DESCRIPTION')}>
              <Input
                onFocus={() => handleFieldFocus('description')}
                placeholder={t('SET_DESCRIPTION')}
              />
            </Form.Item>
          </SectionCard>

          {/* ABOUT THE PROJECT */}
          <SectionCard>
            <SectionTitle>{t('ABOUT_THE_PROJECT')}</SectionTitle>

            <Form.Item
              name="projectDescription"
              label={t('PROJECT_DESCRIPTION')}
              rules={[{ required: true, message: t('PROJECT_DESCRIPTION_EXTRA') }]}
            >
              <TextArea
                rows={4}
                onFocus={() => handleFieldFocus('projectDescription')}
                placeholder={t('PROJECT_DESCRIPTION_PLACEHOLDER')}
              />
            </Form.Item>

            <Form.List name="referenceVideos">
              {(fields, { add, remove }) => (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>
                      {t('REFERENCE_VIDEOS')}
                    </span>
                  </div>
                  {fields.map((field) => (
                    <FieldRow key={field.key}>
                      <Form.Item
                        name={[field.name, 'url']}
                        rules={[{ type: 'url', message: t('INVALID_URL') }]}
                      >
                        <Input
                          placeholder={t('URL_ONLY')}
                          onFocus={() => handleFieldFocus('referenceVideos')}
                        />
                      </Form.Item>
                      <Form.Item name={[field.name, 'comment']}>
                        <Input
                          placeholder={t('COMMENT')}
                          onFocus={() => handleFieldFocus('referenceVideos')}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          danger
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </FieldRow>
                  ))}
                  <AddMoreButton type="button" onClick={() => add({ url: '', comment: '' })}>
                    <PlusOutlined /> {t('ADD_ITEM')}
                  </AddMoreButton>
                </>
              )}
            </Form.List>

            <div style={{ marginTop: 16 }} />

            <FieldRow>
              <Form.Item name="budget" label={t('CLIENT_BUDGET')}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  onFocus={() => handleFieldFocus('budget')}
                  placeholder={t('PLEASE_INPUT_BUDGET')}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
              <Form.Item name="visibleForVendors" label={t('VISIBLE_FOR_VENDORS')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </FieldRow>

            <Form.Item name="extraMaterials" label={t('EXTRA_MATERIALS')}>
              <Upload.Dragger
                maxCount={5}
                multiple
                customRequest={({ onSuccess }) => {
                  message.info('File upload coming soon');
                  onSuccess?.('ok');
                }}
              >
                <p>
                  <UploadOutlined style={{ fontSize: 24, color: '#99a1b7' }} />
                </p>
                <p style={{ fontSize: 12, color: '#99a1b7' }}>
                  {t('ADD_UP_TO_5_ADDITIONAL_FILES')}
                </p>
              </Upload.Dragger>
            </Form.Item>
          </SectionCard>

          {/* RIGHTS AND TECHNICAL SPECIFICATIONS */}
          <SectionCard>
            <SectionTitle>{t('RIGHTS_AND_TECHNICAL_SPECIFICATIONS')}</SectionTitle>

            <Form.Item
              name="distributionAndAdPlacements"
              label={t('DISTRIBUTION_AND_AD_PLACEMENTS')}
              rules={[{ required: true, message: t('AT_LEAST_ONE_PLACEMENT_REQUIRED') }]}
            >
              <Input
                onFocus={() => handleFieldFocus('distributionAndAdPlacements')}
                placeholder={t('SELECT_AT_LEAST_ONE_PLACEMENT')}
              />
            </Form.Item>

            <Form.Item
              name="territory"
              label={t('TERRITORY')}
              rules={[{ required: true, message: t('SELECT_ALL_COUNTRIES_OR_WORLDWIDE') }]}
            >
              <Select
                mode="multiple"
                placeholder={t('SELECT_ALL_COUNTRIES_OR_WORLDWIDE')}
                onFocus={() => handleFieldFocus('territory')}
              >
                {TERRITORY_OPTIONS.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>{t('TERM')}</div>
            <FieldRow>
              <Form.Item
                name="termLength"
                rules={[{ required: true, message: t('TERM') }]}
              >
                <Input
                  placeholder={t('LENGTH')}
                  onFocus={() => handleFieldFocus('term')}
                />
              </Form.Item>
              <Form.Item name="termUnit">
                <Select onFocus={() => handleFieldFocus('term')}>
                  {TERM_UNIT_OPTIONS.map((opt) => (
                    <Option key={opt} value={opt}>
                      {t(opt.toUpperCase() as Parameters<typeof t>[0])}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </FieldRow>

            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
              {t('MAIN_VIDEO_DURATION')}
            </div>
            <FieldRow>
              <Form.Item
                name="mainVideoNumber"
                rules={[{ required: true, message: t('MAIN_VIDEO_DURATION_REQUIRED') }]}
              >
                <Input
                  placeholder={t('NUMBER')}
                  onFocus={() => handleFieldFocus('mainVideoDuration')}
                />
              </Form.Item>
              <Form.Item name="mainVideoLength">
                <Input
                  placeholder={t('LENGTH')}
                  onFocus={() => handleFieldFocus('mainVideoDuration')}
                />
              </Form.Item>
              <Form.Item name="mainVideoTimeUnit">
                <Select onFocus={() => handleFieldFocus('mainVideoDuration')}>
                  {TIME_UNIT_OPTIONS.map((opt) => (
                    <Option key={opt} value={opt}>
                      {t(opt.toUpperCase() as Parameters<typeof t>[0])}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </FieldRow>
            <Form.Item name="mainVideoComment">
              <Input
                placeholder={t('COMMENT')}
                onFocus={() => handleFieldFocus('mainVideoDuration')}
              />
            </Form.Item>

            <Form.List name="cuts">
              {(fields, { add, remove }) => (
                <>
                  <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                    {t('CUTS')}
                  </div>
                  {fields.map((field) => (
                    <FieldRow key={field.key}>
                      <Form.Item name={[field.name, 'number']}>
                        <Input
                          placeholder={t('NUMBER')}
                          onFocus={() => handleFieldFocus('cuts')}
                        />
                      </Form.Item>
                      <Form.Item name={[field.name, 'length']}>
                        <Input
                          placeholder={t('LENGTH')}
                          onFocus={() => handleFieldFocus('cuts')}
                        />
                      </Form.Item>
                      <Form.Item name={[field.name, 'timeUnit']}>
                        <Select onFocus={() => handleFieldFocus('cuts')}>
                          {TIME_UNIT_OPTIONS.map((opt) => (
                            <Option key={opt} value={opt}>
                              {t(opt.toUpperCase() as Parameters<typeof t>[0])}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item name={[field.name, 'comment']}>
                        <Input
                          placeholder={t('COMMENT')}
                          onFocus={() => handleFieldFocus('cuts')}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          danger
                        />
                      )}
                    </FieldRow>
                  ))}
                  <AddMoreButton
                    type="button"
                    onClick={() => add({ number: '', length: '', timeUnit: 'Seconds', comment: '' })}
                  >
                    <PlusOutlined /> {t('ADD_ITEM')}
                  </AddMoreButton>
                </>
              )}
            </Form.List>

            <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
              {t('SHOOTING_DAYS')}
            </div>
            <FieldRow>
              <Form.Item name="shootingDaysNumber">
                <Input placeholder={t('NUMBER')} />
              </Form.Item>
              <Form.Item name="shootingDaysLength">
                <Input placeholder={t('LENGTH')} />
              </Form.Item>
              <Form.Item name="shootingDaysTimeUnit">
                <Select>
                  {TIME_UNIT_OPTIONS.map((opt) => (
                    <Option key={opt} value={opt}>
                      {t(opt.toUpperCase() as Parameters<typeof t>[0])}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </FieldRow>
            <Form.Item name="shootingDaysComment">
              <Input placeholder={t('COMMENT')} />
            </Form.Item>
          </SectionCard>

          {/* TEAM */}
          <SectionCard>
            <SectionTitle>{t('CLIENTS_MANAGERS')}</SectionTitle>
            <Form.List name="managers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <FieldRow key={field.key}>
                      <Form.Item name={[field.name, 'manager']}>
                        <Input
                          placeholder={t('NAME_PLACEHOLDER')}
                          onFocus={() => handleFieldFocus('managers')}
                        />
                      </Form.Item>
                      <Form.Item name={[field.name, 'position']}>
                        <Input
                          placeholder={t('MANAGER_POSITION')}
                          onFocus={() => handleFieldFocus('managers')}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          danger
                        />
                      )}
                    </FieldRow>
                  ))}
                  <AddMoreButton
                    type="button"
                    onClick={() => add({ manager: '', position: '' })}
                  >
                    <PlusOutlined /> {t('ADD_ITEM')}
                  </AddMoreButton>
                </>
              )}
            </Form.List>
          </SectionCard>
        </Form>

        <FormFooter>
          <FooterLeft>
            {savedAt && `${t('SAVED_AT')} ${savedAt}`}
          </FooterLeft>
          <FooterRight>
            <Button onClick={handleCancel}>{t('CANCEL')}</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={isSaving}
              style={{ background: '#FD8258', borderColor: '#FD8258' }}
            >
              {t('SAVE')}
            </Button>
          </FooterRight>
        </FormFooter>
      </FormArea>

      <GuidancePanel>
        <GuidanceTitle>{t('GUIDANCE')}</GuidanceTitle>
        <GuidanceText>
          {t(guidanceKey as Parameters<typeof t>[0])}
        </GuidanceText>
      </GuidancePanel>
    </FormPageWrapper>
  );
};
