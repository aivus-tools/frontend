export const isDifferentUser = (sessionEmail: string | null | undefined, confirmedEmail: unknown): boolean => {
  const session = typeof sessionEmail === 'string' && sessionEmail.length > 0 ? sessionEmail.toLowerCase() : null;
  const confirmed =
    typeof confirmedEmail === 'string' && confirmedEmail.length > 0 ? confirmedEmail.toLowerCase() : null;
  if (session == null || confirmed == null) {
    return false;
  }
  return session !== confirmed;
};
