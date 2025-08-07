import React from 'react';
import { Button, InputNumber, Select, Space } from 'antd';
import cn from 'classnames';

import styles from './SidebarInput.module.css';
import { Key } from '@/constants/key';

interface SingleButton {
  type: 'single btn';
  value: string;
  width: number;
  onClick: () => void;
  disabled?: boolean;
}

interface DoubleButton {
  type: 'double btn';
  value: [string, string];
  width: [number, number];
  onClick: [() => void, () => void];
  disabled?: [boolean, boolean];
}

interface Input {
  type: 'number';
  value: number;
  width: number;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
}

interface Props {
  type: 'select' | 'input';
  value: number | string;
  width: number;
  label?: string;
  bottomLabel?: string;
  labelPositon?: 'top' | 'left';
  accent?: true;
  options?: { label: string; value: number }[];
  disabled?: boolean;
  onChange?: (value: number | null, options?: Props['options'] | NonNullable<Props['options']>[number]) => void;
  icon?: string;
  action?: {
    icon: React.ElementType;
    label: string;
    disabled: boolean;
    onClick: () => void;
  };
  extraField?: SingleButton | DoubleButton | Input;
}

export const SidebarInput: React.FC<Props> = (props) => {
  const renderSelect = (): React.JSX.Element | null => {
    if (!props.options) {
      return null;
    }

    return (
      <Select
        value={Number(props.value)}
        options={props.options}
        onChange={props.onChange}
        style={{ width: props.width }}
      />
    );
  };

  const renderBtn = (
    value: string,
    width: number,
    onClick: (() => void) | undefined,
    disabled: boolean | undefined
  ) => {
    return (
      <Button className={styles.button} disabled={disabled} type='dashed' onClick={onClick} style={{ width }}>
        {value}
      </Button>
    );
  };

  const renderInputNumber = (
    value: number,
    width: number,
    onChange: Props['onChange'],
    isDisabled?: boolean
  ): React.JSX.Element => {
    if (!props.icon) {
      return (
        <InputNumber
          controls={false}
          min={0}
          value={value}
          name='count'
          style={{ width }}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    }

    return (
      <InputNumber
        controls={false}
        className={styles.input}
        value={value}
        disabled={isDisabled}
        step={0.1}
        prefix={<div className={styles.inputPrefix}>{props.icon}</div>}
        style={{
          backgroundColor: props.accent ? 'var(--bg-light-green)' : '',
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!props.action || props.action.disabled) {
        return;
      }

      if (e.key === Key.ENTER || e.key === Key.SPACE) {
        e.preventDefault();
        props.action.onClick();
      }
    };

    return (
      <div
        role='button'
        tabIndex={props.action.disabled ? -1 : 0}
        aria-disabled={props.action.disabled}
        className={cn(styles.action, { [styles.actionDisabled]: props.action.disabled })}
        onClick={props.action.disabled ? undefined : props.action.onClick}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.actionIcon}>
          <Icon width={12} height={12} />
        </div>
        <div className={styles.actionText}>{props.action.label}</div>
      </div>
    );
  };

  const renderLabel = () => {
    if (!props.action) {
      return <div className={styles.label}>{props.label}</div>;
    }

    return (
      <div className={styles.header}>
        <div className={styles.label}>{props.label}</div>

        {props.action && renderAction()}
      </div>
    );
  };

  const element1: React.JSX.Element | null =
    props.type === 'select'
      ? renderSelect()
      : renderInputNumber(Number(props.value), props.width, props.onChange, props.disabled);
  let element2: React.JSX.Element | null = null;

  switch (props.extraField?.type) {
    case 'number':
      element2 = renderInputNumber(Number(props.extraField.value), props.extraField.width, props.extraField.onChange);
      break;
    case 'single btn':
      element2 = renderBtn(
        props.extraField.value,
        props.extraField.width,
        props.extraField.onClick,
        props.extraField.disabled
      );
      break;
    case 'double btn':
      const [value1, value2] = props.extraField.value;
      const [width1, width2] = props.extraField.width;
      const [onClick1, onClick2] = props.extraField.onClick;
      const [disabled1, disabled2] = props.extraField.disabled ?? [];

      element2 = (
        <Space>
          {renderBtn(value1, width1, onClick1, disabled1)}
          {renderBtn(value2, width2, onClick2, disabled2)}
        </Space>
      );
      break;
    default:
      break;
  }

  if (props.labelPositon === 'left') {
    return (
      <div className={styles.rowContent}>
        {renderLabel()}

        {!props.extraField && element1}
      </div>
    );
  }

  return (
    <div className={styles.columnContent}>
      {renderLabel()}

      {props.extraField && renderGroup(props.extraField.type, element1, element2)}

      {!props.extraField && element1}

      {!props.extraField && props.bottomLabel && (
        <div className={styles.label} style={{ width: props.width }}>
          {props.bottomLabel}
        </div>
      )}
    </div>
  );
};
