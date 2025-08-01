import React from 'react';
import { Button, InputNumber, Select, Space } from 'antd';
import cn from 'classnames';
import { QuantityUnit, TimeUnit } from '@/modules/vendor/estimation/types';

import styles from './SidebarInput.module.css';

interface Props {
  type: 'select' | 'input';
  value: string;
  options?: string[] | TimeUnit[] | QuantityUnit[];
  label: string;
  labelPositon?: 'top' | 'left';
  width: number;
  onChange?: (value: number | null) => void;
  icon?: string;
  action?: {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
  };
  extraField?: {
    type: 'number' | 'single btn' | 'double button';
    value: string | number;
    width: number;
    onChange?: (value: number | null) => void;
    onClick?: () => void;
  };
}

export const SidebarInput: React.FC<Props> = (props) => {
  const renderSelect = (): React.JSX.Element | null => {
    if (!props.options) {
      return null;
    }

    return (
      <Select
        defaultValue={Number(props.value)}
        options={[props.options]}
        onChange={props.onChange}
        style={{ width: props.width }}
      />
    );
  };

  const renderBtn = (width: number, onClick?: () => void) => {
    return (
      <Button
        disabled={!onClick}
        type='dashed'
        onClick={onClick}
        style={{
          width,
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        ←$
      </Button>
    );
  };

  const renderInputNumber = (
    value: number,
    width: number,
    onChange?: (value: number | null) => void
  ): React.JSX.Element => {
    if (!props.icon) {
      return <InputNumber min={0} defaultValue={value} name='count' style={{ width }} onChange={onChange} />;
    }

    return (
      <InputNumber
        controls={false}
        className={styles.input}
        defaultValue={value}
        step={0.1}
        prefix={<div className={styles.inputPrefix}>{props.icon}</div>}
        style={{
          width,
        }}
        onChange={onChange}
      />
    );
  };

  const renderGroup = (
    type: NonNullable<Props['extraField']>['type'],
    Element1: React.JSX.Element | null,
    Element2: React.JSX.Element | null
  ): React.JSX.Element | null => {
    if (!Element1 || !Element2) {
      return null;
    }

    if (type !== 'number') {
      return (
        <Space size='small' className={styles.inputGroup}>
          {Element1}
          {Element2}
        </Space>
      );
    }
    return (
      <Space.Compact block size='small' className={styles.inputGroup}>
        {Element1}
        {Element2}
      </Space.Compact>
    );
  };

  const renderAction = () => {
    if (!props.action) {
      return null;
    }

    const Icon = props.action.icon;

    return (
      <div className={cn(styles.action, { [styles.actionDisabled]: !props.action.isActive })}>
        <div className={styles.actionIcon}>
          <Icon width={12} height={12} color={!props.action.isActive ? 'var(--gray-light)' : 'var(--main)'} />
        </div>
        <div className={cn(styles.actionText, { [styles.actionTextDisabled]: !props.action.isActive })}>
          {props.action.label}
        </div>
      </div>
    );
  };

  const renderLabel = () => {
    if (!props.action) {
      return <div className={styles.text}>{props.label}</div>;
    }

    return (
      <div className={styles.header}>
        <div className={styles.text}>{props.label}</div>

        {props.action && renderAction()}
      </div>
    );
  };

  const element1: React.JSX.Element | null =
    props.type === 'select' ? renderSelect() : renderInputNumber(Number(props.value), props.width, props.onChange);
  let element2: React.JSX.Element | null = null;

  switch (props.extraField?.type) {
    case 'number':
      element2 = renderInputNumber(Number(props.extraField.value), props.extraField.width, props.extraField.onChange);
      break;
    case 'single btn':
      element2 = renderBtn(props.extraField.width, props.extraField.onClick);
      break;
    case 'double button':
      element2 = null;
      break;
    default:
      break;
  }

  return (
    <div className={styles.content}>
      {renderLabel()}

      {props.extraField && renderGroup(props.extraField.type, element1, element2)}
      {!props.extraField && element1}
    </div>
  );
};
