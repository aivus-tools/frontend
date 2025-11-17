'use client';

import { CLIENTS_HEADERS, HEADERS } from '../constants';

interface HeaderProps {
  clientView?: boolean;
}

export function Header({ clientView = false }: HeaderProps) {
  if (clientView) {
    // Client view: only show item name and client price columns
    return (
      <>
        <div className='estimation-header' style={{ textAlign: 'left', paddingLeft: '8px' }}>
          Item
        </div>
        <div className='estimation-header'>Units</div>
        <div className='estimation-header'>Quantity</div>
        <div className='estimation-header'>Price, $</div>
        <div />
        <div />
        <div />
      </>
    );
  }

  // Full view: show all columns
  return (
    <>
      {HEADERS.map(({ label, style, key }) => (
        <div key={key} className='estimation-header' style={style}>
          {label}
        </div>
      ))}
      <div />
      {CLIENTS_HEADERS.map(({ label, key }) => (
        <div key={key} className='estimation-header'>
          {label}
        </div>
      ))}
    </>
  );
}
