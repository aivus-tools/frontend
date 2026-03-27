// MENU //
export interface Menu {
  title: string;
  pathname: string;
}

export interface SidebarItem {
  id: string;
  title: string;
  type: 'section' | 'subsection' | 'row';
  isHidden: boolean;
  children?: SidebarItem[];
}

export interface THead {
  text: string;
  showIcon?: boolean;
  className?: string;
}

export interface TSection {
  id: string;
  title: string;
  isHidden: boolean;
  subSections?: TSubSection[];
  rows?: TRow[];
}

export interface TSubSection {
  id: string;
  title: string;
  isHidden: boolean;
  rows: TRow[];
}

export interface TRow {
  id: string;
  item: string;
  price: number;
  units: string;
  quantity: number;
  surcharge: number;
  cprice: number;
  range: number;
}

export interface SubSection {
  subTitle: React.ReactNode;
  subContent: React.ReactNode;
}
