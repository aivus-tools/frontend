'use client';

import React from 'react';
import { EntryRow } from './EntryRow';

interface Props {
    data: any[];
}

export function Entries({ data }: Props) {
    return (
        <>
            {data.map((offer, index) => (
                <EntryRow
                    key={offer.id}
                    offer={offer}
                    isEven={index % 2 === 0}
                />
            ))}
        </>
    );
}
