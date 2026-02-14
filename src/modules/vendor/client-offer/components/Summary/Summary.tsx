'use client';

import React from 'react';
import { GrandTotal } from './GrandTotal';
import { SubtotalAllSections } from './SubtotalAllSections';
import { AgencyService } from './AgencyService';
import { UnforeseenExpenses } from './UnforeseenExpenses';
import { CostPerVideo } from './CostPerVideo';

export const Summary = () => {
    return (
        <>
            <SubtotalAllSections />
            <AgencyService />
            <UnforeseenExpenses />
            <GrandTotal />
            <CostPerVideo />
        </>
    );
};
