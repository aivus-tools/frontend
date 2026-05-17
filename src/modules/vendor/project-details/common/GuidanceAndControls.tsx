'use client';
import React, { useCallback } from 'react';

import { Button, Flex, Typography, Form } from 'antd';
import { useComponentSize } from '@/hooks/useComponentSize';
import { useGuidance } from '@/context/GuidanceProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectMode, setMode } from '@/store/slices/project';
import { t } from '@/lib/i18n';

import commonStyles from './common.module.css';
import styles from './GuidanceAndControls.module.css';

export const GuidanceAndControls = () => {
  const { observedRef, width } = useComponentSize();
  const form = Form.useFormInstance();
  const { focusedField } = useGuidance();
  const mode = useAppSelector(selectMode);
  const dispatch = useAppDispatch();

  const reset = useCallback(() => {
    form.resetFields();
    dispatch(setMode('view'));
  }, [dispatch, form]);

  const edit = useCallback(() => {
    dispatch(setMode('edit'));
  }, [dispatch]);

  const controls =
    mode === 'edit' ? (
      <div
        className={commonStyles.section}
        style={{ position: 'fixed', width: width, bottom: '24px', minWidth: '300px' }}
      >
        <div className={commonStyles.content}>
          <Flex gap={8} align='center' justify='space-between'>
            <Typography.Text type='secondary'>{t('SAVED_AT')}</Typography.Text>
            <Button type='text' onClick={reset}>
              {t('CANCEL')}
            </Button>
            <Form.Item style={{ width: 'auto', margin: 0 }}>
              <Button type='primary' htmlType='submit'>
                {t('SAVE')}
              </Button>
            </Form.Item>
          </Flex>
        </div>
      </div>
    ) : (
      <Flex
        gap={8}
        align='center'
        justify='end'
        style={{ position: 'fixed', width: width, bottom: '24px', minWidth: '300px' }}
      >
        <Button type='primary' onClick={edit} style={{ margin: '10px 30px' }}>
          {t('EDIT')}
        </Button>
      </Flex>
    );

  return (
    <div className={styles.wrapper} ref={observedRef}>
      <div className={commonStyles.section} style={{ position: 'fixed', width: width }}>
        <div className={commonStyles.header}>{t('GUIDANCE')}</div>
        <div className={commonStyles.content}>
          {focusedField ? (
            <>
              <Typography.Text>{focusedField.label}</Typography.Text>
              <div className={styles.borderDashedLine} />
              <Typography.Text>{t('WHAT_IS_THIS_USED_FOR')}</Typography.Text>
              <Typography.Text type='secondary' className={styles.description}>
                {focusedField.description}
              </Typography.Text>
            </>
          ) : (
            <Typography.Text>{t('CLICK_ON_FIELD_FOR_GUIDANCE')}</Typography.Text>
          )}
        </div>
      </div>
      {controls}
    </div>
  );
};
