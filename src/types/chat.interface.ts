export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  brief_data: Record<string, unknown> | null;
  is_complete: boolean;
}

export interface ComparisonData {
  brief: Record<string, unknown>;
  vendors: ComparisonVendor[];
  categories: ComparisonCategory[];
  grand_totals: VendorTotal[];
}

export interface ComparisonVendor {
  id: string;
  name: string;
  total: number;
}

export interface ComparisonCategory {
  id: string;
  name: string;
  items: ComparisonItem[];
  subtotals: VendorTotal[];
}

export interface ComparisonItem {
  name: string;
  values: { vendor_id: string; price: number; cost: number }[];
}

export interface VendorTotal {
  vendor_id: string;
  total: number;
}

export interface AnalysisResponse {
  analysis: string;
  highlights: string[];
}
