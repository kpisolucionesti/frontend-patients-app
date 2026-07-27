import { useCallback, useEffect, useRef, useState } from 'react';

export function useFetch(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const isMounted = useRef(true);
  const asyncFnRef = useRef(asyncFn);

  useEffect(() => {
    asyncFnRef.current = asyncFn;
  });

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFnRef.current();
      if (isMounted.current) {
        setData(result);
        setFetchedAt(Date.now());
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.message || 'Error fetching data');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    execute();
    return () => { isMounted.current = false; };
  }, [execute]);

  return { data, loading, error, fetchedAt, refetch: execute };
}
