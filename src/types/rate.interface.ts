export const rateOption = ['fixed', 'percentage'] as const;

export interface Rate {
  id: string;
  name: string;
  basePrice: number;
  description?: string;
  entryId?: number;
  options?: [
    {
      name: string;
      description: string;
      type: typeof rateOption;
      value: number;
    },
  ];
}
