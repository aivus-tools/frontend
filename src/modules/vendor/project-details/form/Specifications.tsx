import React, { useEffect } from 'react';
import { Form, Input, Flex, Select } from 'antd';
import { AntdListWrapper, IconButton } from '../common/styled';
import { LabelWithAdd } from './LabelWithAdd';
import RemoveIcon from '@/icons/minus.svg';
import CrossIcon from '@/icons/cross.svg';
import { useGuidance } from '@/context/Guidance';

import i18n from 'i18n-iso-countries';
import Flag from 'react-world-flags';
import { Details } from '@/types/brief.interface';

export const Specifications: React.FC = () => {
  const { handleFocus } = useGuidance();
  const countries = i18n.getNames('en', { select: 'official' });
  const countryOptions = [
    {
      label: 'Worldwide',
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
        label='Distribution and Ad placements'
        extra='Select at least one placement for your ad'
        rules={[{ required: true, message: 'At least one placement is required' }]}
      >
        <Input placeholder='Ad placements' onFocus={handleFocus('distributionAndAdPlacements')} />
      </Form.Item>
      <Flex gap={16} style={{ width: '100%' }}>
        <Form.Item
          name='territory'
          label='Territory'
          extra='Select all country/regions you need or “Worldwide”'
          rules={[{ required: true }]}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch
            placeholder='Client'
            onFocus={handleFocus('territory')}
            options={countryOptions}
          />
        </Form.Item>
        <Form.Item label='Term' extra='Set the period or Perpetuity' style={{ flex: '1 0 340px' }}>
          <Flex gap={4}>
            <Form.Item name={['term', 'length']} noStyle>
              <Input placeholder='Length' onFocus={handleFocus('term_length')} disabled={unitTerm === 'perpetuity'} />
            </Form.Item>
            <Form.Item name={['term', 'unit']} noStyle>
              <Select
                onFocus={handleFocus('term_unit')}
                placeholder='Choose'
                options={[
                  { label: 'Months', value: 'months' },
                  { label: 'Years', value: 'years' },
                  { label: 'Perpetuity', value: 'perpetuity' },
                ]}
              />
            </Form.Item>
          </Flex>
        </Form.Item>
      </Flex>
      <Form.Item
        label='Main video Duration'
        extra='Number and length of original videos.'
        rules={[{ required: true, message: 'Main video duration is required' }]}
      >
        <Flex gap={16}>
          <Flex gap={4} align='center'>
            <Form.Item name={['mainVideoDuration', 'number']} noStyle>
              <Input placeholder='Number' onFocus={handleFocus('mainVideoDuration')} />
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
              <Input placeholder='Length' onFocus={handleFocus('mainVideoDuration')} />
            </Form.Item>
            <Form.Item name={['mainVideoDuration', 'timeUnit']} noStyle>
              <Select
                onFocus={handleFocus('mainVideoDuration')}
                placeholder='Choose'
                options={[
                  { label: 'Seconds', value: 'seconds' },
                  { label: 'Minutes', value: 'minutes' },
                  { label: 'Hours', value: 'hours' },
                ]}
              />
            </Form.Item>
          </Flex>
          <Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
            <Form.Item name={['mainVideoDuration', 'comment']} noStyle>
              <Input placeholder='Comment' onFocus={handleFocus('mainVideoDuration')} />
            </Form.Item>
          </Flex>
        </Flex>
      </Form.Item>
      <AntdListWrapper>
        <Form.List name='cuts'>
          {(fields, { add, remove }) => (
            <Form.Item
              label={<LabelWithAdd text='Cuts' onClick={() => add()} />}
              extra='Additional versions of the main video, if applicable.'
            >
              {fields.map((field) => (
                <Flex key={field.key} gap={16}>
                  <Flex gap={4} align='center'>
                    <Form.Item noStyle name={[field.name, 'number']}>
                      <Input placeholder='Number' onFocus={handleFocus('cuts')} />
                    </Form.Item>
                    <Flex flex={'0 0 10px'} align='center'>
                      <CrossIcon />
                    </Flex>
                    <Form.Item noStyle name={[field.name, 'length']}>
                      <Input placeholder='Length' onFocus={handleFocus('cuts')} />
                    </Form.Item>
                    <Form.Item noStyle name={[field.name, 'timeUnit']}>
                      <Select
                        placeholder='Choose'
                        options={[
                          { label: 'Seconds', value: 'seconds' },
                          { label: 'Minutes', value: 'minutes' },
                          { label: 'Hours', value: 'hours' },
                        ]}
                      />
                    </Form.Item>
                  </Flex>
                  <Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
                    <Form.Item noStyle name={[field.name, 'comment']}>
                      <Input placeholder='Comment' onFocus={handleFocus('cuts')} />
                    </Form.Item>
                    <IconButton
                      onClick={() => {
                        if (fields.length > 1) remove(field.name);
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Flex>
                </Flex>
              ))}
            </Form.Item>
          )}
        </Form.List>
      </AntdListWrapper>
      <Form.Item
        label='Shooting days'
        extra='Number of days and length of the shooting day, including 1 hour of lunch if the day is more than 6 hours long.'
        rules={[{ required: true, message: 'Shooting days are required' }]}
      >
        <Flex gap={16}>
          <Flex gap={4} align='center'>
            <Form.Item name={['shootingDays', 'number']} noStyle>
              <Input placeholder='Number' onFocus={handleFocus('shootingDays')} />
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
              <Input placeholder='Length' onFocus={handleFocus('shootingDays')} />
            </Form.Item>
          </Flex>
          <Flex gap={4} align='center' style={{ flex: '1 0 340px' }}>
            <Form.Item name={['shootingDays', 'comment']} noStyle>
              <Input onFocus={handleFocus('shootingDays')} placeholder='Comment' />
            </Form.Item>
          </Flex>
        </Flex>
      </Form.Item>
    </>
  );
};
