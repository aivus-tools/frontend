export const TOUCH_TARGET_MIN = 44;

export const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)';

export const spacing = {
  mobile: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
  },
  desktop: {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 36,
  },
} as const;

export const dvh = (value: number): string => `min(${value}vh, ${value}dvh)`;
