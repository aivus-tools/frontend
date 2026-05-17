'use client';

import { HeaderKey, OfferData, UnitType } from '@/types/estimation.interface';
import { CLIENTS_HEADERS, HEADERS, KEY_SEPARATOR } from '@/modules/vendor/estimation/constants';
import { useRowHover } from '@/modules/vendor/estimation/context/hover';
import SettingsIcon from '@/icons/settings-icon.svg';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import DeleteIcon from '@/icons/delete.svg';
import { InputNumberRight } from '../InputNumberRight';
import { RowLine } from '@/modules/vendor/estimation/components/RowLine';
import { Flex, Select, Tooltip } from 'antd';
import { EntrieInput } from '@/modules/vendor/estimation/components/EntrieInput';
import { useAppDispatch } from '@/store/hooks';
import { changeOfferRow, removeOfferRow } from '@/store/slices/offer/slice';
import React, { Fragment } from 'react';
type ValueOf<T> = T[keyof T];
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { openSidebar, setSidebarInfo } from '@/store/slices/sidebar';
import { LinkButton } from '../LinkButtons/LinkButtons';

import styles from '@/modules/vendor/estimation/estimation.module.css';

const timeUnitFirst = (a: OfferData['units'][number], b: OfferData['units'][number]) => {
  return a?.type === UnitType.TIME && b?.type === UnitType.QUANTITY ? -1 : 1;
};

const cellClass = (isHovered: boolean): string => {
  return isHovered ? `${styles.estimationItem} ${styles.estimationItemHovered}` : styles.estimationItem;
};

const unitSelectClass = (isHovered: boolean): string => {
  const base = `${styles.selectWrapper} ${styles.unitSelect}`;
  return isHovered ? `${base} ${styles.selectWrapperHovered}` : base;
};

export function Entries({ data }: { data: OfferData[] }) {
  const dispatch = useAppDispatch();
  const handleRemove = (id: string) => {
    dispatch(removeOfferRow(id));
  };
  const handleChange = (id: string, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => {
    dispatch(changeOfferRow({ id, [key]: data }));
  };

  const handleToggleLink = (id: string) => () => {
    const offer = data.find((it) => it.id === id);
    if (!offer) {
      return;
    }
    dispatch(changeOfferRow({ id, isLinkedSurcharge: !offer.isLinkedSurcharge }));
  };
  const handleChangeUnit = (id: string, unitType: UnitType) => (newUnitValue: string) => {
    const offer = data.find((it) => it.id === id);
    if (!offer) {
      return;
    }
    const newUnits = offer.units?.filter((unit) => unit?.type !== unitType) ?? [];
    const newUnit = offer.options[unitType].find((unit) => unit.value === newUnitValue);
    if (!newUnit) {
      return;
    }
    newUnits.push(newUnit);
    handleChange(id, 'units')(newUnits);
  };

  const handleRemoveUnit = (id: string, unitType: UnitType) => {
    const offer = data.find((it) => it.id === id);
    if (!offer) {
      return;
    }
    const newUnits = offer.units?.filter((unit) => unit?.type !== unitType) ?? [];
    handleChange(id, 'units')(newUnits);
  };

  const handleChangeUnitValue = (id: string, unitValue: string) => (count: number | null) => {
    const offer = data.find((it) => it.id === id);
    if (!offer || count === null || count === undefined) {
      return;
    }
    const newUnits = offer.units?.map((unit) => {
      if (unit?.value === unitValue) {
        return {
          ...unit,
          count,
        };
      }
      return unit;
    });
    handleChange(id, 'units')(newUnits);
  };

  const { getRowProps, hoveredRow, focusedRow } = useRowHover();
  const checkActive = (id: string) => hoveredRow === id || focusedRow === id;

  const showSidebar = (offer: OfferData): void => {
    dispatch(openSidebar());
    dispatch(setSidebarInfo({ type: 'offer', data: offer }));
  };

  return (
    <>
      {data.map((offer) => (
        <Fragment key={offer.id}>
          {HEADERS.map(({ key, itemStyle, itemProps }) => {
            const isActive = checkActive(offer.id);
            const rowProps = getRowProps(offer.id);

            if (key === 'link') {
              return null;
            }

            if (key === 'settings') {
              return (
                <div
                  key={`settings-${key}`}
                  className={cellClass(isActive)}
                  {...rowProps}
                  style={{ justifyContent: 'center' }}
                >
                  {isActive && (
                    <Flex align='center' justify='center' style={{ height: '100%' }}>
                      <Tooltip title={t('SHOW_DETAILS')} placement='bottom'>
                        <SettingsIcon
                          style={{ cursor: 'pointer', color: 'var(--gray)' }}
                          onClick={() => showSidebar(offer)}
                        />
                      </Tooltip>
                    </Flex>
                  )}
                </div>
              );
            }

            if (key === 'item') {
              return (
                <div key={`item-${key}`} className={cellClass(isActive)} style={itemStyle} {...rowProps}>
                  <EntrieInput value={offer} variant={isActive ? 'outlined' : 'borderless'} />
                </div>
              );
            }

            if (key === 'actions') {
              return (
                <div
                  key={`actions-${key}`}
                  className={cellClass(isActive)}
                  {...rowProps}
                  style={{ justifyContent: 'center' }}
                >
                  {isActive && (
                    <Flex align='center' justify='center' style={{ height: '100%' }}>
                      <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => handleRemove(offer.id)} />
                    </Flex>
                  )}
                </div>
              );
            }

            if (key === 'units') {
              return (
                <div
                  key={`units-${key}`}
                  className={cellClass(isActive)}
                  {...rowProps}
                  style={{ justifyContent: 'center' }}
                >
                  <Flex vertical className={unitSelectClass(isActive)}>
                    {offer.units &&
                      offer.units.toSorted(timeUnitFirst).map((unit) => {
                        if (!unit) {
                          return null;
                        }

                        const isTime = unit.type === UnitType.TIME;
                        const isQuantity = unit.type === UnitType.QUANTITY;
                        const hasTime = offer.options[UnitType.TIME].length > 0;
                        const hasQuantities = offer.options[UnitType.QUANTITY].length > 0;
                        const unitsCount = offer.units.filter(Boolean).length;

                        return (
                          <Flex gap={5} key={unit.value} align='center'>
                            <div className={styles.iconPlaceholder}>
                              {isActive && (
                                <>
                                  {isTime && unitsCount === 1 && hasQuantities && (
                                    <div
                                      className={styles.iconButton}
                                      onClick={() =>
                                        handleChangeUnit(
                                          offer.id,
                                          UnitType.QUANTITY
                                        )(offer.options[UnitType.QUANTITY][0].value)
                                      }
                                    >
                                      <AddIcon color={'var(--gray-light)'} />
                                    </div>
                                  )}
                                  {isQuantity && unitsCount === 1 && hasTime && (
                                    <div
                                      className={styles.iconButton}
                                      onClick={() =>
                                        handleChangeUnit(offer.id, UnitType.TIME)(offer.options[UnitType.TIME][0].value)
                                      }
                                    >
                                      <AddIcon color={'var(--gray-light)'} />
                                    </div>
                                  )}
                                  {isQuantity && unitsCount === 2 && (
                                    <div
                                      className={styles.iconButton}
                                      onClick={() => handleRemoveUnit(offer.id, UnitType.QUANTITY)}
                                    >
                                      <RemoveIcon color={'var(--gray-light)'} />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <Select
                              style={{ flex: 1 }}
                              placeholder={t('SELECT_UNIT')}
                              variant={isActive ? 'outlined' : 'borderless'}
                              value={unit.value}
                              onChange={handleChangeUnit(offer.id, unit.type)}
                              options={offer.options[unit.type].map(({ label, value }) => ({ label, value }))}
                            />
                          </Flex>
                        );
                      })}
                  </Flex>
                </div>
              );
            }

            if (key === 'quantity') {
              return (
                <div
                  key={`${offer.id}${KEY_SEPARATOR}${key}`}
                  className={cellClass(isActive)}
                  style={itemStyle}
                  {...rowProps}
                >
                  <Flex key={offer.id} align='center' vertical style={{ maxWidth: '100%', gap: '5px' }}>
                    {offer.units &&
                      offer.units
                        .toSorted(timeUnitFirst)
                        .map(
                          (unit) =>
                            unit && (
                              <InputNumberRight
                                style={{ flex: 1, maxWidth: '100%' }}
                                key={unit.value}
                                variant={isActive ? 'outlined' : 'borderless'}
                                onChange={handleChangeUnitValue(offer.id, unit.value)}
                                value={unit.count}
                                controls={false}
                                min={1}
                              />
                            )
                        )}
                  </Flex>
                </div>
              );
            }

            if (key === 'cost') {
              return (
                <div
                  key={`${offer.id}${KEY_SEPARATOR}${key}`}
                  className={cellClass(isActive)}
                  style={itemStyle}
                  {...rowProps}
                >
                  {formatCurrency(offer.cost)}
                </div>
              );
            }

            if (key === 'price') {
              return (
                <div
                  key={`${offer.id}${KEY_SEPARATOR}${key}`}
                  className={cellClass(isActive)}
                  style={itemStyle}
                  {...rowProps}
                >
                  <Flex align='center' gap={4} style={{ width: '100%' }}>
                    <InputNumberRight
                      style={{ flex: 1 }}
                      variant={isActive ? 'outlined' : 'borderless'}
                      onChange={handleChange(offer.id, key)}
                      value={offer.price}
                      controls={false}
                      {...itemProps}
                    />
                    {offer.taxPrice > offer.price && (
                      <span style={{ fontSize: '10px', color: 'var(--gray-light)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(offer.taxPrice)}
                      </span>
                    )}
                  </Flex>
                </div>
              );
            }

            return (
              <div
                key={`${offer.id}${KEY_SEPARATOR}${key}`}
                className={cellClass(isActive)}
                style={itemStyle}
                {...rowProps}
              />
            );
          })}
          <div />
          {CLIENTS_HEADERS.map(({ key, itemStyle, itemProps }) => {
            const isActive = checkActive(offer.id);
            const rowProps = getRowProps(offer.id);
            if (!isClientKey(key)) {
              return null;
            }
            if (key === 'link') {
              return (
                <div key={key} className={cellClass(isActive)} {...rowProps}>
                  <Flex align='center' justify='center'>
                    <LinkButton link={offer.isLinkedSurcharge} onClickAction={handleToggleLink(offer.id)} />
                  </Flex>
                </div>
              );
            }

            if (key === 'marketRange') {
              return <div key={key} className={cellClass(isActive)} {...rowProps} />;
            }
            if (key === 'surcharge') {
              return (
                <div
                  key={`${key}${KEY_SEPARATOR}${offer.id}`}
                  className={cellClass(isActive)}
                  style={itemStyle}
                  {...rowProps}
                >
                  <InputNumberRight
                    variant={isActive ? 'outlined' : 'borderless'}
                    onChange={handleChange(offer.id, key)}
                    value={offer.surcharge}
                    controls={false}
                    {...itemProps}
                  />
                </div>
              );
            }

            return (
              <div
                key={`${key}${KEY_SEPARATOR}${offer.id}`}
                className={cellClass(isActive)}
                style={itemStyle}
                {...rowProps}
              >
                {formatCurrency(offer[key])}
              </div>
            );
          })}
          <RowLine />
        </Fragment>
      ))}
    </>
  );
}

const isClientKey = (key: HeaderKey): key is 'link' | 'surcharge' | 'clientPrice' | 'clientCost' | 'marketRange' => {
  return ['link', 'surcharge', 'clientPrice', 'clientCost', 'marketRange'].includes(key);
};
