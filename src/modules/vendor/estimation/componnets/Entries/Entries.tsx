'use client';

import { HeaderKey, OfferData, UnitType } from '@/types/estimation.interface';
import { CLIENTS_HEADERS, HEADERS } from '../../constants';
import { useRowHover } from '../../context/hover';
import SettingsIcon from '@/icons/settings-icon.svg';
import AddIcon from '@/icons/add-icon.svg';
import RemoveIcon from '@/icons/minus.svg';
import DeleteIcon from '@/icons/delete.svg';
import { EstimationItem, IconButton, InputNumberRight, SelectWrapper } from '../../styled';
import { RowLine } from '../../componnets/RowLine';
import { Flex, Select, Tooltip } from 'antd';
import { EntrieInput } from '../../componnets/EntrieInput';
import { useAppDispatch } from '@/store/hooks';
import { changeOfferRow, removeOfferRow } from '@/store/slices/offer/slice';
import React, { Fragment } from 'react';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { openSidebar, setSidebarInfo } from '@/store/slices/sidebar';
import { LinkButton } from '../LinkButtons/LinkButtons';

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

  const handleToggleLink = (id: number) => () => {
    const offer = data.find((it) => it.id === id);
    if (!offer) {
      return;
    }
    dispatch(changeOfferRow({ id, linkedSurcharge: !offer.linkedSurcharge }));
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
                <EstimationItem key={`settings-${key}`} {...rowProps} style={{ justifyContent: 'center' }}>
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
                </EstimationItem>
              );
            }

            if (key === 'item') {
              const rowProps = getRowProps(offer.id);
              return (
                <EstimationItem key={`item-${key}`} style={itemStyle} {...rowProps}>
                  <EntrieInput value={offer} variant={isActive ? 'outlined' : 'borderless'} />
                </EstimationItem>
              );
            }

            if (key === 'actions') {
              return (
                <EstimationItem key={`actions-${key}`} {...rowProps} style={{ justifyContent: 'center' }}>
                  {isActive && (
                    <Flex align='center' justify='center' style={{ height: '100%' }}>
                      <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => handleRemove(offer.id)} />
                    </Flex>
                  )}
                </EstimationItem>
              );
            }

            if (key === 'units') {
              return (
                <EstimationItem key={`actions-${key}`} {...rowProps} style={{ justifyContent: 'center' }}>
                  <SelectWrapper vertical $hovered={isActive}>
                    {offer.units &&
                      offer.units.toSorted(timeUnitFirst).map(
                        (unit) =>
                          unit && (
                            <Flex gap={5} key={unit.value} align='center'>
                              {unit.type === UnitType.TIME &&
                                offer.units.length === 1 &&
                                offer.options[UnitType.QUANTITY].length > 0 && (
                                  <HideElement width={12} isVisible={isActive}>
                                    <IconButton
                                      onClick={() =>
                                        handleChangeUnit(
                                          offer.id,
                                          UnitType.QUANTITY
                                        )(offer.options[UnitType.QUANTITY][0].value)
                                      }
                                    >
                                      <AddIcon color={'var(--gray-light)'} />
                                    </IconButton>
                                  </HideElement>
                                )}
                              {unit.type === UnitType.QUANTITY && offer.units.length === 2 && (
                                <HideElement width={12} isVisible={isActive}>
                                  <IconButton onClick={() => handleRemoveUnit(offer.id, UnitType.QUANTITY)}>
                                    <RemoveIcon color={'var(--gray-light)'} />
                                  </IconButton>
                                </HideElement>
                              )}
                              <Select
                                style={{ flex: 1 }}
                                placeholder='Select unit'
                                variant={isActive ? 'outlined' : 'borderless'}
                                value={unit.value}
                                onChange={handleChangeUnit(offer.id, unit.type)}
                                options={offer.options[unit.type].map(({ label, value }) => ({ label, value }))}
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
                <EstimationItem key={`${offer.id}-${key}`} style={itemStyle} {...rowProps}>
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
                </EstimationItem>
              );
            }

            if (key === 'cost') {
              return (
                <EstimationItem key={`${offer.id}-${key}`} style={itemStyle} {...rowProps}>
                  {formatCurrency(offer.cost)}
                </EstimationItem>
              );
            }

            const priceKey = offer.showTax ? 'taxPrice' : 'price';

            return (
              <EstimationItem key={`${offer.id}-${key}`} style={itemStyle} {...rowProps}>
                <InputNumberRight
                  style={{ flex: 1 }}
                  variant={isActive ? 'outlined' : 'borderless'}
                  onChange={handleChange(offer.id, key)}
                  value={offer[priceKey]}
                  controls={false}
                  {...itemProps}
                />
              </EstimationItem>
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
                <EstimationItem key={key} {...rowProps}>
                  <Flex align='center' justify='center'>
                    <LinkButton link={offer.linkedSurcharge} onClickAction={handleToggleLink(offer.id)} />
                  </Flex>
                </EstimationItem>
              );
            }

            if (key === 'marketRange') {
              return <EstimationItem key={key} {...rowProps} />;
            }
            if (key === 'surcharge') {
              return (
                <EstimationItem key={`${key}-${offer.id}`} style={itemStyle} {...rowProps}>
                  <InputNumberRight
                    variant={isActive ? 'outlined' : 'borderless'}
                    onChange={handleChange(offer.id, key)}
                    value={offer.surcharge}
                    controls={false}
                    {...itemProps}
                  />
                </EstimationItem>
              );
            }

            return (
              <EstimationItem key={`${key}-${offer.id}`} style={itemStyle} {...rowProps}>
                {formatCurrency(offer[key])}
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
