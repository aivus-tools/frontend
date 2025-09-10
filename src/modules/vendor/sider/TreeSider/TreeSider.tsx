'use client';

import React, { useState, useMemo } from 'react';
import { Tree, Input } from 'antd';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectRootCategories, selectVisibilityMap } from '@/store/slices/offer/selectors';
import { toggleItemVisibility } from '@/store/slices/offer/slice';
import { TreeItem } from './components/TreeItem/TreeItem';
import styles from './TreeSider.module.css';
import { Category, OfferData } from '@/types/estimation.interface';

const { Search: AntdSearch } = Input;

interface TreeType {
  key: string;
  title: string;
  type: 'category';
  data: Category;
  children: SubcategoryType[] | OfferDataType[];
}

type SubcategoryType = {
  key: string;
  title: string;
  type: 'subcategory';
  data: Category;
  children: OfferDataType[];
};

type OfferDataType = {
  key: string;
  title: string;
  isLeaf: boolean;
  type: 'offer';
  data: OfferData;
};

export const TreeSider = () => {
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const visibilityMap = useAppSelector(selectVisibilityMap);

  const rootCategories = useAppSelector(selectRootCategories);
  const allSubCategories = useAppSelector((state) => state.offer.offerDetails.subCategories);
  const allOffers = useAppSelector((state) => state.offer.offerDetails.offers);

  const treeData: TreeType[] = useMemo(() => {
    const buildTreeData = (categories: typeof rootCategories, searchTerm: string = '') => {
      return categories
        .map((category) => {
          // const categoryName = category.name.toLowerCase();
          // const matchesSearch = !searchTerm || categoryName.includes(searchTerm.toLowerCase());

          // Получаем подкатегории
          const subCategories = allSubCategories.filter((subCategory) => subCategory.parentCategoryId === category.id);

          const subCategoriesData = subCategories
            .map((subCategory) => {
              // const subCategoryName = subCategory.name.toLowerCase();
              // const subMatchesSearch = !searchTerm || subCategoryName.includes(searchTerm.toLowerCase());

              // Получаем offers для подкатегории
              const offers = allOffers.filter((offer) => offer.categoryId === subCategory.id);

              const offersData = offers
                .filter((offer) => {
                  const offerName = offer.item.toLowerCase();
                  return !searchTerm || offerName.includes(searchTerm.toLowerCase());
                })
                .map((offer) => ({
                  key: `offer-${offer.id}`,
                  title: offer.item,
                  isLeaf: true,
                  type: 'offer' as const,
                  data: offer,
                }));

              // const hasMatchingOffers = offersData.length > 0;
              // const shouldShowSubCategory = subMatchesSearch || hasMatchingOffers;

              // if (!shouldShowSubCategory) return undefined;

              return {
                key: `subcategory-${subCategory.id}`,
                title: subCategory.name,
                type: 'subcategory' as const,
                data: subCategory,
                children: offersData,
              };
            })
            .filter(Boolean);

          // Если нет подкатегорий, ищем офферы сразу у категории
          let directOffersData: OfferDataType[] = [];
          if (subCategories.length === 0) {
            const directOffers = allOffers.filter((offer) => offer.categoryId === category.id);
            directOffersData = directOffers
              .filter((offer) => {
                const offerName = offer.item.toLowerCase();
                return !searchTerm || offerName.includes(searchTerm.toLowerCase());
              })
              .map((offer) => ({
                key: `offer-${offer.id}`,
                title: offer.item,
                isLeaf: true,
                type: 'offer' as const,
                data: offer,
              }));
          }

          //const hasMatchingSubCategories = subCategoriesData.length > 0;
          //const hasDirectOffers = directOffersData.length > 0;
          //const shouldShowCategory = matchesSearch || hasMatchingSubCategories || hasDirectOffers;

          return {
            key: `category-${category.id}`,
            title: category.name,
            type: 'category' as const,
            data: category,
            children: subCategoriesData.length > 0 ? subCategoriesData : directOffersData,
          };
        })
        .filter(Boolean);
    };

    return buildTreeData(rootCategories, searchValue);
  }, [rootCategories, allSubCategories, allOffers, searchValue]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // Автоматически раскрываем все узлы при поиске
    const allKeys = getAllKeys(treeData);
    setExpandedKeys(allKeys);
  };

  const getAllKeys = (data: TreeType[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (items: TreeType[] | SubcategoryType[] | OfferDataType[]) => {
      items.forEach((item) => {
        keys.push(item.key);
        if ('children' in item && Array.isArray(item.children) && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  const handleVisibilityToggle = (key: string) => {
    const currentVisibility = visibilityMap[key] !== false;
    dispatch(toggleItemVisibility({ key, isVisible: !currentVisibility }));
  };

  const handleExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys);
  };

  const titleRender = (nodeData: TreeType | OfferDataType) => {
    return (
      <TreeItem
        data={nodeData}
        isVisible={visibilityMap[nodeData.key] !== false}
        onVisibilityToggle={() => handleVisibilityToggle(nodeData.key)}
      />
    );
  };

  return (
    <div className={styles.treeSider}>
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          <AntdSearch
            placeholder='Q Layers'
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.search}
            allowClear
          />
        </div>
      </div>
      <div className={styles.treeContainer}>
        <Tree
          style={{ width: '100%' }}
          className={styles.tree}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
          titleRender={titleRender}
        />
      </div>
    </div>
  );
};
