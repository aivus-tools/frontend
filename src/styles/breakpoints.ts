export const BREAKPOINTS = {
  mobile: 1023,
  desktop: 1024,
} as const;

export const MIN_VIEWPORT_WIDTH = 360;

export const MOBILE_MEDIA_QUERY = `(max-width: ${BREAKPOINTS.mobile}.98px)`;
export const DESKTOP_MEDIA_QUERY = `(min-width: ${BREAKPOINTS.desktop}px)`;

export const media = {
  mobile: `@media ${MOBILE_MEDIA_QUERY}`,
  desktop: `@media ${DESKTOP_MEDIA_QUERY}`,
} as const;
