'use client';

import { t } from '@/lib/i18n';

export function Header() {
  return (
    <>
      {/* Empty cell for settings icon space */}
      <div className='estimation-header' />
      
      {/* Item */}
      <div className='estimation-header' style={{ textAlign: 'left', paddingLeft: '8px' }}>
        {t('ITEM')}
      </div>
      
      {/* Price - hidden */}
      <div className='estimation-header' />
      
      {/* Units */}
      <div className='estimation-header'>
        {t('UNITS')}
      </div>
      
      {/* Quantity */}
      <div className='estimation-header'>
        {t('QUANTITY')}
      </div>
      
      {/* Cost - hidden */}
      <div className='estimation-header' />
      
      {/* Actions - hidden */}
      <div className='estimation-header' />
      
      {/* Empty separator */}
      <div />
      
      {/* Link - hidden */}
      <div className='estimation-header' />
      
      {/* Surcharge - hidden */}
      <div className='estimation-header' />
      
      {/* Client's Price - hidden */}
      <div className='estimation-header' />
      
      {/* Client's Cost */}
      <div className='estimation-header'>
        Cost, $
      </div>
      
      {/* Market Range - hidden */}
      <div className='estimation-header' />
    </>
  );
}

