import React, { useEffect } from 'react';
import { Form, Input, Flex, Select } from 'antd';
import { AntdListWrapper, IconButton } from '../common/styled';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import CrossIcon from '@/icons/cross.svg';
import { useGuidance } from '@/context/GuidanceProvider';
import { getLocale, t } from '@/lib/i18n';

import i18n from 'i18n-iso-countries';
import Flag from 'react-world-flags';
import { Details } from '@/types/brief.interface';

export const Specifications: React.FC = () => {
  const { handleFocus } = useGuidance();
  const countries = i18n.getNames(getLocale(), { select: 'official' });
  const countryOptions = [
    {
      label: t('WORLDWIDE'),
      value: 'worldwide',
    },
    ...Object.keys(countries).map((country) => ({
      label: (
        <Flex gap={8} align='center'>
          <Flag code={country} height='16' width='16' />
          {countries[country]}
        </Flex>
      ),
      value: country,
    })),
  ];

  const form = Form.useFormInstance<Details>();
  const unitTerm = Form.useWatch(['term', 'unit'], form);

  useEffect(() => {
    if (unitTerm === 'perpetuity') {
      form.setFieldsValue({ term: { length: '', unit: 'perpetuity' } });
    }
  }, [form, unitTerm]);

  return (
    <>
      <Form.Item
        name='distributionAndAdPlacements'
        label={t('DISTRIBUTION_AND_AD_PLACEMENTS')}
        extra={t('SELECT_AT_LEAST_ONE_PLACEMENT')}
        rules={[{ required: true, message: t('AT_LEAST_ONE_PLACEMENT_REQUIRED') }]}
      >
        <Input placeholder={t('AD_PLACEMENTS')} onFocus={handleFocus('distributionAndAdPlacements')} />
      </Form.Item>
      <Flex gap={16} style={{ width: '100%' }}>
        <Form.Item
          name='territory'
          label={t('TERRITORY')}
          extra={t('SELECT_ALL_COUNTRIES_OR_WORLDWIDE')}
          rules={[{ required: true }]}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch
            placeholder={t('CLIENT')}
            onFocus={handleFocus('territory')}
            options={countryOptions}
          />
        </Form.Item>
        <Form.Item label={t('TERM')} extra={t('SET_PERIOD_OR_PERPETUITY')} style={{ flex: '1 0 340px' }}>
          <Flex gap={4}>
            <Form.Item name={['term', 'length']} noStyle>
              <Input
                placeholder={t('LENGTH')}
                onFocus={handleFocus('term_length')}
                disabled={unitTerm === 'perpetuity'}
              />
            </Form.Item>
            <Form.Item name={['term', 'unit']} noStyle>
              <Select
                onFocus={handleFocus('term_unit')}
                placeholder={t('CHOOSE')}
                options={[
                  { label: t('MONTHS'), value: 'months' },
                  { label: t('YEARS'), value: 'years' },
                  { label: t('PERPETUITY'), value: 'perpetuity' },
                ]}
              />
            </Form.Item>
          </Flex>
        </Form.Item>
      </Flex>
      <Form.Item
        label={t('MAIN_VIDEO_DURATION')}
        extra={t('NUMBER_AND_LENGTH_OF_ORIGINAL_VIDEOS')}
        rules={[{ required: true, message: t('MAIN_VIDEO_DURATION_REQUIRED') }]}
      >
        <Flex gap={16}>
          <Flex gap={4} align='center'>
            <Form.Item name={['mainVideoDuration', 'number']} noStyle>
              <Input placeholder={t('NUMBER')} onFocus={handleFocus('mainVideoDuration')} />
            </Form.Item>
            <Flex flex={'0 0 10px'} align='center'>
              <svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
                <path
                  d='M1 9L9 1M9 9L1 1'
                  stroke='#99A1B7'
                  strokeWidth='1.5'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </Flex>
            <Form.Item name={['mainVideoDuration', 'length']} noStyle>
              <Input placeholder={t('LENGTH')} onFocus={handleFocus('mainVideoDuration')} />
            </Form.Item>
            <Form.Item name={['mainVideoDuration', 'timeUnit']} noStyle>
              <Select
                onFocus={handleFocus('mainVideoDuration')}
                placeholder={t('CHOOSE')}
                options={[
                  { label: t('SECONDS'), value: 'seconds' },
                  { label: t('MINUTES'), value: 'minutes' },
                  { label: t('HOURS'), value: 'hours' },
                ]}
              />
            </Form.Item>
          </Flex>
          <Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
            <Form.Item name={['mainVideoDuration', 'comment']} noStyle>
              <Input placeholder={t('COMMENT')} onFocus={handleFocus('mainVideoDuration')} />
            </Form.Item>
          </Flex>
        </Flex>
      </Form.Item>
      <AntdListWrapper>
        <Form.List name='cuts'>
          {(fields, { add, remove }) => (
            <Form.Item
              label={<LabelWithAdd text={t('CUTS')} onClick={() => add()} />}
              extra={t('ADDITIONAL_VERSIONS_OF_MAIN_VIDEO')}
            >
              {fields.map((field) => (
                <Flex key={field.key} gap={16}>
                  <Flex gap={4} align='center'>
                    <Form.Item noStyle name={[field.name, 'number']}>
                      <Input placeholder={t('NUMBER')} onFocus={handleFocus('cuts')} />
                    </Form.Item>
                    <Flex flex={'0 0 10px'} align='center'>
                      <CrossIcon />
                    </Flex>
                    <Form.Item noStyle name={[field.name, 'length']}>
                      <Input placeholder={t('LENGTH')} onFocus={handleFocus('cuts')} />
                    </Form.Item>
                    <Form.Item noStyle name={[field.name, 'timeUnit']}>
                      <Select
                        placeholder={t('CHOOSE')}
                        options={[
                          { label: t('SECONDS'), value: 'seconds' },
                          { label: t('MINUTES'), value: 'minutes' },
                          { label: t('HOURS'), value: 'hours' },
                        ]}
                      />
                    </Form.Item>
                  </Flex>
                  <Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
                    <Form.Item noStyle name={[field.name, 'comment']}>
                      <Input placeholder={t('COMMENT')} onFocus={handleFocus('cuts')} />
                    </Form.Item>
                    <IconButton
                      onClick={() => {
                        if (fields.length > 1) remove(field.name);
                      }}
                    >
                      <RemoveIcon color={'var(--gray-light)'} />
                    </IconButton>
                  </Flex>
                </Flex>
              ))}
            </Form.Item>
          )}
        </Form.List>
      </AntdListWrapper>
      <Form.Item
        label={t('SHOOTING_DAYS')}
        extra={t('SHOOTING_DAYS_DESCRIPTION')}
        rules={[{ required: true, message: t('SHOOTING_DAYS_REQUIRED') }]}
      >
        <Flex gap={16}>
          <Flex gap={4} align='center'>
            <Form.Item name={['shootingDays', 'number']} noStyle>
              <Input placeholder={t('NUMBER')} onFocus={handleFocus('shootingDays')} />
            </Form.Item>
            <Flex flex={'0 0 10px'} align='center'>
              <svg xmlns='http://www.w3.org/2000/svg' width='10px' height='10px' viewBox='0 0 10 10' fill='none'>
                <path
                  d='M1 9L9 1M9 9L1 1'
                  stroke='#99A1B7'
                  strokeWidth='1.5'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </Flex>
            <Form.Item name={['shootingDays', 'length']} noStyle>
              <Input placeholder={t('LENGTH')} onFocus={handleFocus('shootingDays')} />
            </Form.Item>
          </Flex>
          <Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
            <Form.Item name={['shootingDays', 'comment']} noStyle>
              <Input onFocus={handleFocus('shootingDays')} placeholder={t('COMMENT')} />
            </Form.Item>
          </Flex>
        </Flex>
      </Form.Item>
    </>
  );
};
