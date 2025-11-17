'use client';

import { OfferData, UnitType } from '@/types/estimation.interface';
import { EstimationItem } from '@/modules/vendor/estimation/styled';
import { RowLine } from '@/modules/vendor/estimation/componnets/RowLine';
import { Fragment } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Flex } from 'antd';

const timeUnitFirst = (a: OfferData['units'][number], b: OfferData['units'][number]) => {
  return a?.type === UnitType.TIME && b?.type === UnitType.QUANTITY ? -1 : 1;
};

export function Entries({ data }: { data: OfferData[] }) {
  return (
    <>
      {data.map((offer) => (
        <Fragment key={offer.id}>
          {/* Settings - empty */}
          <EstimationItem />
          
          {/* Item */}
          <EstimationItem style={{ textAlign: 'left', paddingLeft: '32px' }}>
            {offer.item}
          </EstimationItem>
          
          {/* Price - empty */}
          <EstimationItem />
          
          {/* Units */}
          <EstimationItem style={{ justifyContent: 'center' }}>
            <Flex vertical gap={5} style={{ width: '100%' }}>
              {offer.units &&
                offer.units.toSorted(timeUnitFirst).map(
                  (unit) =>
                    unit && (
                      <div key={unit.value} style={{ textAlign: 'center' }}>
                        {unit.label}
                      </div>
                    )
                )}
            </Flex>
          </EstimationItem>
          
          {/* Quantity */}
          <EstimationItem style={{ justifyContent: 'center' }}>
            <Flex vertical gap={5} style={{ width: '100%' }}>
              {offer.units &&
                offer.units.toSorted(timeUnitFirst).map(
                  (unit) =>
                    unit && (
                      <div key={unit.value} style={{ textAlign: 'center' }}>
                        {unit.count}
                      </div>
                    )
                )}
            </Flex>
          </EstimationItem>
          
          {/* Cost - empty */}
          <EstimationItem />
          
          {/* Actions - empty */}
          <EstimationItem />
          
          {/* Empty separator */}
          <div />
          
          {/* Link - empty */}
          <EstimationItem />
          
          {/* Surcharge - empty */}
          <EstimationItem />
          
          {/* Client's Price - empty */}
          <EstimationItem />
          
          {/* Client's Cost */}
          <EstimationItem style={{ paddingRight: '4px' }}>
            {formatCurrency(offer.clientCost)}
          </EstimationItem>
          
          {/* Market Range - empty */}
          <EstimationItem />
          
          <RowLine />
        </Fragment>
      ))}
    </>
  );
}

