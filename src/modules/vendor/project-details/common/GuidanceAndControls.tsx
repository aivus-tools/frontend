'use client';
import React, { useCallback } from 'react';

import { Button, Flex, Typography, Form } from 'antd';
import { useComponentSize } from '@/hooks/useComponentSize';
import { useBreakpoint } from '@/hooks/useBreakpoint';
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
  const { isMobile } = useBreakpoint();

  const reset = useCallback(() => {
    form.resetFields();
    dispatch(setMode('view'));
  }, [dispatch, form]);

  const edit = useCallback(() => {
    dispatch(setMode('edit'));
  }, [dispatch]);

  const controlsFixedStyle = isMobile
    ? { width: '100%', minWidth: 0 }
    : { position: 'fixed' as const, width: width, bottom: '24px', minWidth: '300px' };

  const editButtonStyle = isMobile
    ? { width: '100%', minWidth: 0 }
    : { position: 'fixed' as const, width: width, bottom: '24px', minWidth: '300px' };

  const guidanceStyle = isMobile ? undefined : { position: 'fixed' as const, width: width };

  const controls =
    mode === 'edit' ? (
      <div className={commonStyles.section} style={controlsFixedStyle}>
        <div className={commonStyles.content}>
          <Flex gap={8} align='center' justify='end'>
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
      <Flex gap={8} align='center' justify='end' style={editButtonStyle}>
        <Button
          type='primary'
          onClick={edit}
          style={isMobile ? { width: '100%' } : { margin: '10px 30px' }}
          block={isMobile}
        >
          {t('EDIT')}
        </Button>
      </Flex>
    );

  return (
    <div className={styles.wrapper} ref={observedRef}>
      <div className={commonStyles.section} style={guidanceStyle}>
        {!isMobile && <div className={commonStyles.header}>{t('GUIDANCE')}</div>}
        {!isMobile && (
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
        )}
      </div>
      {controls}
    </div>
  );
};
