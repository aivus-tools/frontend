import { Form, Input, Flex, InputNumber, Typography } from 'antd';
import { ExtraMaterials } from './ExtraMaterials';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import commonStyles from '../common/common.module.css';
import { LabelWithSide } from './LabelWithButton';

import EyeCrossed from '@/icons/eye-crossed.svg';
import Eye from '@/icons/eye.svg';
import { Details } from '@/types/brief.interface';
import { useGuidance } from '@/context/GuidanceProvider';
import { t } from '@/lib/i18n';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const { TextArea } = Input;

export const Brief = () => {
  const form = Form.useFormInstance<Details>();
  const visibleForVendors = Form.useWatch('visibleForVendors', form);
  const { handleFocus } = useGuidance();
  const { isMobile } = useBreakpoint();

  return (
    <>
      <Form.Item name='projectDescription' label={t('PROJECT_DESCRIPTION')} extra={t('PROJECT_DESCRIPTION_EXTRA')}>
        <TextArea
          autoSize={{ minRows: 6, maxRows: 6 }}
          onFocus={handleFocus('projectDescription')}
          placeholder={t('PROJECT_DESCRIPTION_PLACEHOLDER')}
        />
      </Form.Item>
      <div className={commonStyles.antdListWrapper}>
        <Form.List name='referenceVideos'>
          {(fields, { add, remove }) => (
            <Form.Item
              label={<LabelWithAdd text={t('REFERENCE_VIDEO')} onClick={() => add()} />}
              extra={t('ADD_LINKS_TO_RELEVANT_VIDEOS')}
              rules={[{ required: true, message: t('AT_LEAST_ONE_REFERENCE_VIDEO_REQUIRED') }]}
            >
              {fields.map((field) => (
                <Flex gap={isMobile ? 12 : 20} key={field.key} vertical={isMobile}>
                  <Form.Item
                    noStyle
                    name={[field.name, 'url']}
                    rules={[{ type: 'url', warningOnly: true, message: t('INVALID_URL') }]}
                  >
                    <Input placeholder={t('URL_ONLY')} onFocus={handleFocus('referenceVideos')} />
                  </Form.Item>
                  <Form.Item noStyle name={[field.name, 'comment']}>
                    <Input placeholder={t('COMMENT')} onFocus={handleFocus('referenceVideos')} />
                  </Form.Item>
                  <Form.Item noStyle>
                    <div
                      className={commonStyles.iconButton}
                      onClick={() => {
                        if (fields.length > 1) remove(field.name);
                      }}
                    >
                      <RemoveIcon color={'var(--gray-light)'} />
                    </div>
                  </Form.Item>
                </Flex>
              ))}
            </Form.Item>
          )}
        </Form.List>
      </div>
      <Flex gap={isMobile ? 12 : 20} vertical={isMobile}>
        <Form.Item
          name='budget'
          className='budget'
          labelCol={{ span: 24, flex: '1 1 100%' }}
          label={
            <LabelWithSide
              text={t('CLIENT_BUDGET')}
              onClick={(e) => {
                e.preventDefault();
                form.setFieldsValue({ visibleForVendors: !visibleForVendors });
              }}
            >
              <Form.Item name='visibleForVendors' noStyle>
                <Flex align='center'>
                  {visibleForVendors ? <Eye /> : <EyeCrossed />}
                  <Typography.Text
                    style={{
                      marginLeft: '10px',
                      color: 'var(--main)',
                      userSelect: 'none',
                    }}
                  >
                    {t('VISIBLE_FOR_VENDORS')}
                  </Typography.Text>
                </Flex>
              </Form.Item>
            </LabelWithSide>
          }
          extra={t('RECOMMEND_CREATIVES_IN_BUDGET')}
          rules={[{ required: true, message: t('PLEASE_INPUT_BUDGET') }]}
        >
          <InputNumber
            onFocus={handleFocus('budget')}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            placeholder={t('NUMBER_ONLY')}
            suffix='$'
            controls={false}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item name='extraMaterials' label={t('EXTRA_MATERIALS')}>
          <ExtraMaterials />
        </Form.Item>
      </Flex>
    </>
  );
};
