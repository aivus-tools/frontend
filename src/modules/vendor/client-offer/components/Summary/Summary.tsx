'use client';

import React from 'react';
import { GrandTotal } from './GrandTotal';
import { SubtotalAllSections } from './SubtotalAllSections';
import { CategoryFeeSummary } from './CategoryFeeSummary';
import { CostPerVideo } from './CostPerVideo';

export const Summary = () => {
    return (
        <>
            <SubtotalAllSections />
            <CategoryFeeSummary />
            <GrandTotal />
            <CostPerVideo />
        </>
    );
};
