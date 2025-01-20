type FetcherGArgs = Parameters<typeof fetch>;

export const fetcher = <T>(...args: FetcherGArgs): Promise<T> => fetch(...args).then((res) => res.json() as Promise<T>);
