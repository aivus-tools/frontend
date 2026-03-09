import { OfferDeliverable, OfferScheduleEntry } from './offer.interface';

export interface ExportCollaborator {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ExportClientManager {
  id: string;
  name: string;
  position: string;
}

export interface ExportEntryItem {
  id: string;
  entryId: string;
  code: string;
  name: string;
  rate: number;
  units: ExportUnitValue[];
  overtime: number;
  estimate: number;
}

export interface ExportUnitValue {
  label: string;
  symbol: string;
  count: number;
}

export interface ExportCategorySection {
  id: string;
  code: string;
  name: string;
  entries: ExportEntryItem[];
  subTotal: number;
  fringes: number | null;
  sectionTotal: number;
}

export interface OfferExportData {
  offer: {
    id: string;
    uuid: string;
    status: string;
    revision: string | null;
    bidDate: string | null;
    term: string | null;
    territory: string[];
    mediaPlacements: string[];
    coverPageNotes: string | null;
    assumptionsExclusions: string | null;
    fringesPercent: string;
    handlingPercent: string;
    markupPercent: string;
    productionInsurancePercent: string;
    productionFeePercent: string;
    postMarkupPercent: string;
    postInsurancePercent: string;
    postTaxPercent: string;
    deliverables: OfferDeliverable[];
    scheduleEntries: OfferScheduleEntry[];
    cost: number | null;
  };
  project: {
    id: string;
    name: string;
    agencyName: string | null;
    clientName: string | null;
    brandName: string | null;
    clientManagers: ExportClientManager[];
  };
  vendor: {
    name: string;
    companyName: string | null;
    logoUrl: string | null;
  };
  collaborators: ExportCollaborator[];
  categories: ExportCategorySection[];
  shareToken: string | null;
}
