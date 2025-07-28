'use client';

import { CLIENTS_HEADERS, HEADERS } from './constants';

export function Header() {
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
