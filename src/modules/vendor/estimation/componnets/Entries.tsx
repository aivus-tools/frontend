'use client';

import { HeaderKey, OfferData, UnitType } from '../types';
import { CLIENTS_HEADERS, HEADERS } from '../constants';
import { useRowHover } from '../context/hover';
import SettingsIcon from '@/icons/settings-icon.svg';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import DeleteIcon from '@/icons/delete.svg';
import { EstimationItem, IconButton, InputNumberRight, SelectWrapper } from '../styled';
import { RowLine } from './RowLine';
import { Flex, Select } from 'antd';
import { EntrieInput } from './EntrieInput';
import { useAppDispatch } from '@/store/hooks';
import { changeOfferRow, removeOfferRow } from '@/store/slices/offer/slice';
import { useDrawerOffer } from '../context/drawer';
import { Fragment } from 'react';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { formatCurrency } from '@/lib/utils';

const timeUnitFirst = (a: OfferData['units'][number], b: OfferData['units'][number]) => {
  return a?.type === UnitType.TIME && b?.type === UnitType.QUANTITY ? -1 : 1;
};

const HideElement = ({
  children,
  isVisible,
  width,
}: {
  children?: React.ReactNode;
  isVisible: boolean;
  width: number;
}) => {
  return isVisible ? children : <div style={{ width }} />;
};

export function Entries({ data = [] }: { data?: OfferData[] }) {
  const dispatch = useAppDispatch();
  const handleRemove = (id: number) => {
    dispatch(removeOfferRow(id));
  };
  const handleChange = (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => {
    dispatch(changeOfferRow({ id, [key]: data }));
  };
  const handleChangeUnit = (id: number, unitType: UnitType) => (newUnitValue: number) => {
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

  const handleRemoveUnit = (id: number, unitType: UnitType) => {
    const offer = data.find((it) => it.id === id);
    if (!offer) {
      return;
    }
    const newUnits = offer.units?.filter((unit) => unit?.type !== unitType) ?? [];
    handleChange(id, 'units')(newUnits);
  };

  const handleChangeUnitValue = (id: number, unitValue: number) => (count: number | null) => {
    const offer = data.find((it) => it.id === id);
    if (!offer || !count) {
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
  const checkActive = (id: number) => hoveredRow === id || focusedRow === id;
  const { onOpen } = useDrawerOffer();

  return (
    <>
      {data.map((it) => (
        <Fragment key={it.id}>
          {HEADERS.map(({ key, itemStyle, itemProps }) => {
            const isActive = checkActive(it.id);
            const rowProps = getRowProps(it.id);

            if (key === 'link') {
              return null;
            }

            if (key === 'settings') {
              return (
                <EstimationItem key={`settings-${key}`} {...rowProps} style={{ justifyContent: 'center' }}>
                  {isActive && (
                    <Flex align='center' justify='center' style={{ height: '100%' }}>
                      <SettingsIcon style={{ cursor: 'pointer', color: 'var(--gray)' }} onClick={() => onOpen(it)} />
                    </Flex>
                  )}
                </EstimationItem>
              );
            }

            if (key === 'item') {
              const rowProps = getRowProps(it.id);
              return (
                <EstimationItem key={`item-${key}`} style={itemStyle} {...rowProps}>
                  <EntrieInput value={it} variant={isActive ? 'outlined' : 'borderless'} />
                </EstimationItem>
              );
            }

            if (key === 'actions') {
              return (
                <EstimationItem key={`actions-${key}`} {...rowProps} style={{ justifyContent: 'center' }}>
                  {isActive && (
                    <Flex align='center' justify='center' style={{ height: '100%' }}>
                      <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => handleRemove(it.id)} />
                    </Flex>
                  )}
                </EstimationItem>
              );
            }

            if (key === 'units') {
              return (
                <EstimationItem key={`actions-${key}`} {...rowProps} style={{ justifyContent: 'center' }}>
                  <SelectWrapper vertical $hovered={isActive}>
                    {it.units &&
                      it.units.toSorted(timeUnitFirst).map(
                        (unit) =>
                          unit && (
                            <Flex gap={5} key={unit.value} align='center'>
                              {unit.type === UnitType.TIME &&
                                it.units.length === 1 &&
                                it.options[UnitType.QUANTITY].length > 0 && (
                                  <HideElement width={12} isVisible={isActive}>
                                    <IconButton
                                      onClick={() =>
                                        handleChangeUnit(
                                          it.id,
                                          UnitType.QUANTITY
                                        )(it.options[UnitType.QUANTITY][0].value)
                                      }
                                    >
                                      <AddIcon />
                                    </IconButton>
                                  </HideElement>
                                )}
                              {unit.type === UnitType.QUANTITY && it.units.length === 2 && (
                                <HideElement width={12} isVisible={isActive}>
                                  <IconButton onClick={() => handleRemoveUnit(it.id, UnitType.QUANTITY)}>
                                    <RemoveIcon />
                                  </IconButton>
                                </HideElement>
                              )}
                              <Select
                                style={{ flex: 1 }}
                                placeholder='Select unit'
                                variant={isActive ? 'outlined' : 'borderless'}
                                value={unit.value}
                                onChange={handleChangeUnit(it.id, unit.type)}
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                options={it.options[unit.type]}
                              />
                            </Flex>
                          )
                      )}
                  </SelectWrapper>
                </EstimationItem>
              );
            }

            if (key === 'quantity') {
              return (
                <EstimationItem key={`${it.id}-${key}`} style={itemStyle} {...rowProps}>
                  <Flex key={it.id} align='center' vertical style={{ maxWidth: '100%', gap: '5px' }}>
                    {it.units &&
                      it.units
                        .toSorted(timeUnitFirst)
                        .map(
                          (unit) =>
                            unit && (
                              <InputNumberRight
                                style={{ flex: 1, maxWidth: '100%' }}
                                key={unit.value}
                                variant={isActive ? 'outlined' : 'borderless'}
                                onChange={handleChangeUnitValue(it.id, unit.value)}
                                value={unit.count}
                                controls={false}
                                min={1}
                              />
                            )
                        )}
                  </Flex>
                </EstimationItem>
              );
            }

            if (key === 'cost') {
              return (
                <EstimationItem key={`${it.id}-${key}`} style={itemStyle} {...rowProps}>
                  {formatCurrency(it[key])}
                </EstimationItem>
              );
            }

            return (
              <EstimationItem key={`${it.id}-${key}`} style={itemStyle} {...rowProps}>
                <InputNumberRight
                  style={{ flex: 1 }}
                  variant={isActive ? 'outlined' : 'borderless'}
                  onChange={handleChange(it.id, key)}
                  value={it[key] as number}
                  controls={false}
                  {...itemProps}
                />
              </EstimationItem>
            );
          })}
          <div />
          {CLIENTS_HEADERS.map(({ key, itemStyle, itemProps }) => {
            const isActive = checkActive(it.id);
            const rowProps = getRowProps(it.id);
            if (!isClientKey(key)) {
              return null;
            }
            if (key === 'link') {
              return <EstimationItem key={key} {...rowProps} />;
            }

            if (key === 'marketRange') {
              return <EstimationItem key={key} {...rowProps} />;
            }
            if (key === 'surcharge') {
              return (
                <EstimationItem key={`${key}-${it.id}`} style={itemStyle} {...rowProps}>
                  <InputNumberRight
                    variant={isActive ? 'outlined' : 'borderless'}
                    onChange={handleChange(it.id, key)}
                    value={it[key] as number}
                    controls={false}
                    {...itemProps}
                  />
                </EstimationItem>
              );
            }

            return (
              <EstimationItem key={`${key}-${it.id}`} style={itemStyle} {...rowProps}>
                {formatCurrency(it[key])}
              </EstimationItem>
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
