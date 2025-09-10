import { OfferData } from '@/types/estimation.interface';

export interface TreeItemProps {
  data: {
    key: string;
    title: string;
    type: 'category' | 'subcategory' | 'offer';
    data: OfferData;
  };
  isVisible: boolean;
  onVisibilityToggle: () => void;
}
