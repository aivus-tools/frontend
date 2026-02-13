'use client';

import React, { useMemo } from 'react';
import { OfferData } from '@/types/estimation.interface';
import { Table, TableHeader, HeaderCell, Content, Wrapper } from './components/styled';
import { FileTextOutlined } from '@ant-design/icons';
import { t } from '@/lib/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectOfferDetails } from '@/store/slices/offer/selectors';
import { KeysProvider } from '@/modules/vendor/estimation/context/expanded';
import { Category } from '@/modules/vendor/client-offer/components/Category';
import { Summary } from '@/modules/vendor/client-offer/components/Summary/Summary';
import { Empty } from 'antd';
import { KEY_SEPARATOR } from '../estimation/constants';

interface Props {
    offers?: OfferData[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ClientOfferTable = ({ offers }: Props) => {
    const { categories } = useAppSelector(selectOfferDetails);

    const topCategories = useMemo(() =>
        categories.filter(cat => !cat.parentCategoryId),
        [categories]
    );

    const initialKeys = useMemo(() => {
        const catKeys = categories.map(cat => cat.id.toString());
        const subCatKeys = categories
            .filter(cat => cat.parentCategoryId)
            .map(cat => `${cat.parentCategoryId}${KEY_SEPARATOR}${cat.id}`);
        return [...catKeys, ...subCatKeys];
    }, [categories]);

    if (categories.length === 0) {
        return (
            <Content style={{ padding: '60px', alignItems: 'center' }}>
                <Empty description={t('EMPTY')} />
            </Content>
        );
    }

    return (
        <KeysProvider initialKeys={initialKeys}>
            <Wrapper>
                <Table>
                    <TableHeader>
                        <HeaderCell>
                            <FileTextOutlined style={{ color: '#99A1B7', fontSize: 14 }} />
                        </HeaderCell>
                        <HeaderCell $align='left'>{t('ITEM')}</HeaderCell>
                        <HeaderCell $align='right'>{t('PRICE')}</HeaderCell>
                        <HeaderCell $align='right'>{t('UNITS')}</HeaderCell>
                        <HeaderCell $align='center'>{t('QUANTITY')}</HeaderCell>
                        <HeaderCell $align='center'>{t('COST')}</HeaderCell>
                        <HeaderCell />
                    </TableHeader>

                    {topCategories.map((category) => (
                        <Category key={category.id} category={category} />
                    ))}

                    <Summary />
                </Table>
            </Wrapper>
        </KeysProvider>
    );
};
