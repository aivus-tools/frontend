'use client';

import React, { Fragment } from 'react';
import { EntryRow } from './EntryRow';
import { EntryRowLine } from './styled';

interface Props {
    data: any[];
}

export function Entries({ data }: Props) {
    return (
        <>
            {data.map((offer, index) => (
                <Fragment key={offer.id}>
                    <EntryRow
                        offer={offer}
                        isEven={index % 2 === 0}
                    />
                    <div style={{ background: '#fff' }} />
                    <EntryRowLine />
                    <div style={{ background: '#fff' }} />
                </Fragment>
            ))}
        </>
    );
}
