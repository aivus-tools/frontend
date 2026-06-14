export const resolveClientIp = (xForwardedFor: string | null, xRealIp: string | null): string => {
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',');
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts[i].trim();
      if (candidate) {
        return candidate;
      }
    }
  }
  return xRealIp ?? '';
};
