'use client';

import React, { Fragment } from 'react';
import { EntryRow } from './EntryRow';

import styles from './components.module.css';

interface EntriesProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export const Entries = (props: EntriesProps) => {
  return (
    <>
      {props.data.map((offer, index) => (
        <Fragment key={offer.id}>
          <EntryRow offer={offer} isEven={index % 2 === 0} />
          <div style={{ background: 'var(--white)' }} />
          <div className={styles.entryRowLine} />
          <div style={{ background: 'var(--white)' }} />
        </Fragment>
      ))}
    </>
  );
};
