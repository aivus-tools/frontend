import React, { createContext, useContext, useState, PropsWithChildren, useMemo } from 'react';
import { OfferData } from '../types';
import { Drawer } from 'antd';
import { t } from '@/lib/i18n';

interface DrawerOffersContextType {
  offer: OfferData | null;
  onOpen: (offer: OfferData) => void;
  onClose: () => void;
}

const DrawerOfferContext = createContext<DrawerOffersContextType | undefined>(undefined);

export const DrawerOfferProvider = ({ children }: PropsWithChildren) => {
  const [offer, setOffer] = useState<OfferData | null>(null);

  const onOpen = (offer: OfferData) => {
    setOffer(offer);
  };

  const onClose = () => setOffer(null);
  const value = useMemo(() => ({ offer, onOpen, onClose }), [offer]);

  return (
    <DrawerOfferContext.Provider value={value}>
      <Drawer title={offer?.item} onClose={onClose} open={Boolean(offer)}>
        <p>{t('SETTINGS')}</p>
      </Drawer>
      {children}
    </DrawerOfferContext.Provider>
  );
};

export const useDrawerOffer = () => {
  const context = useContext(DrawerOfferContext);

  if (context === undefined) {
    throw new Error('useDrawerOffer must be used within a DrawerOfferProvider');
  }

  return context;
};
