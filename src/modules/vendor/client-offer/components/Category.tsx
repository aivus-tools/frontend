'use client';

import React, { useCallback } from 'react';
import type { Category as TypeCategory } from '@/types/estimation.interface';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { useAppSelector } from '@/store/hooks';
import {
    selectSubcategoryById,
    selectOffersByCategoryId,
    selectTotalSumByCategoryId,
    selectCategoryTotalWithFees,
} from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { Title } from '@/modules/vendor/client-offer/components/Title/Title';
import { SubCategory } from '@/modules/vendor/client-offer/components/SubCategory';
import { Entries } from '@/modules/vendor/client-offer/components/Entries';
import { Total } from '@/modules/vendor/client-offer/components/Total/Total';
import { CategoryFees } from '@/modules/vendor/client-offer/components/Total/CategoryFees';

export function Category({ category }: { category: TypeCategory }) {
    const { keys } = useExpandedKeys();
    const key = `${category.id}`;
    const isOpen = keys?.includes(key);

    const subCategories = useAppSelector(
        useCallback((state: RootState) => selectSubcategoryById(state, category.id), [category.id])
    );
    const offers = useAppSelector(
        useCallback((state: RootState) => selectOffersByCategoryId(state, category.id), [category.id])
    );

    const { clientTotal } = useAppSelector(
        useCallback((state: RootState) => selectTotalSumByCategoryId(state, category.id), [category.id])
    );
    const { clientTotal: clientTotalWithFees } = useAppSelector(
        useCallback((state: RootState) => selectCategoryTotalWithFees(state, category.id), [category.id])
    );

    return (
        <>
            <Title category={category} itemKey={key} value={clientTotal} />
            {isOpen && (
                <>
                    {subCategories?.map((subCategory) => (
                        <SubCategory key={`${key}${subCategory.id}`} subCategory={subCategory} />
                    ))}
                    <Entries data={offers} />
                    <CategoryFees categoryId={category.id} />
                    <Total text={category.name} value={clientTotalWithFees} />
                </>
            )}
            <div style={{ gridColumn: 'span 7', padding: '15px' }} />
        </>
    );
}
