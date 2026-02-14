type FetcherGArgs = Parameters<typeof fetch>;

export const fetcher = <T>(...args: FetcherGArgs): Promise<T> => fetch(...args).then((res) => {
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
});
